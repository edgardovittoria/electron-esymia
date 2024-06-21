import React, { useEffect, useState } from 'react';
import { ImSpinner } from 'react-icons/im';
import {
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  mesherProgressLengthSelector,
  mesherProgressSelector,
  mesherResultsSelector,
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal,
  unsetMeshProgress,
  unsetMeshProgressLength,
  unsetMesherResults,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { useDispatch, useSelector } from 'react-redux';
import useWebSocket from 'react-use-websocket';
import {
  setExternalGrids,
  setMesh,
  setMeshGenerated,
  setPreviousMeshStatus,
} from '../../../../../../store/projectSlice';
import { Project } from '../../../../../../model/esymiaModels';
import { generateSTLListFromComponents } from './rightPanelFunctions';
import { ComponentEntity, Material, useFaunaQuery } from 'cad-library';
import { TiArrowMinimise } from 'react-icons/ti';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Client } from '@stomp/stompjs';
import {
  callback_mesh_advices,
  callback_mesher_feedback,
  callback_mesher_results,
} from '../../../../../rabbitMQFunctions';
import { client } from '../../../../../../../App';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';

export interface MeshingStatusProps {
  feedbackMeshingVisible: boolean;
  setFeedbackMeshingVisible: (v: boolean) => void;
  activeMeshing: {
    selectedProject: Project;
    allMaterials: Material[];
    quantum: [number, number, number];
    meshStatus: 'Not Generated' | 'Generated';
  }[];
}

const MeshingStatus: React.FC<MeshingStatusProps> = ({
  feedbackMeshingVisible,
  setFeedbackMeshingVisible,
  activeMeshing,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    client.subscribe(
      'mesher_results',
      (msg) => callback_mesher_results(msg, dispatch),
      { ack: 'client' },
    );
    client.subscribe(
      'mesher_feedback',
      (msg) => callback_mesher_feedback(msg, dispatch),
      { ack: 'client' },
    );
  }, []);

  return (
    <div
      className={`absolute right-10 w-1/4 bottom-6 flex flex-col justify-center items-center bg-white p-3 rounded ${
        !feedbackMeshingVisible && 'hidden'
      }`}
    >
      <div className="flex flex-row justify-between">
        <h5>Meshing Status</h5>
        <TiArrowMinimise
          className="absolute top-2 right-2 hover:cursor-pointer hover:bg-gray-200"
          size={20}
          onClick={() => setFeedbackMeshingVisible(false)}
        />
      </div>
      <hr className="text-secondaryColor w-full mb-5 mt-3" />
      <div className="max-h-[600px] overflow-y-scroll w-full">
        {activeMeshing.map((m) => (
          <MeshingStatusItem
            selectedProject={m.selectedProject}
            allMaterials={m.allMaterials}
            quantumDimsInput={m.quantum}
          />
        ))}
      </div>
    </div>
  );
};

export default MeshingStatus;

export interface MeshingStatusItemProps {
  selectedProject: Project;
  allMaterials: Material[];
  quantumDimsInput: [number, number, number];
}

const MeshingStatusItem: React.FC<MeshingStatusItemProps> = ({
  selectedProject,
  allMaterials,
  quantumDimsInput,
}) => {
  const dispatch = useDispatch();
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
  const isAlert = useSelector(isAlertInfoModalSelector);
  const checkProgressLength = useSelector(mesherProgressLengthSelector).filter(
    (item) => item.id === (selectedProject.faunaDocumentId as string),
  )[0];
  const checkProgressValue = useSelector(mesherProgressSelector).filter(
    (item) => item.id === (selectedProject.faunaDocumentId as string),
  )[0];
  const [stopSpinner, setStopSpinner] = useState<boolean>(false);
  const mesherResults = useSelector(mesherResultsSelector).filter(
    (item) => item.id === (selectedProject.faunaDocumentId as string),
  )[0];

  useEffect(() => {
    const components = selectedProject?.model?.components as ComponentEntity[];
    const objToSendToMesher = {
      STLList:
        components &&
        allMaterials &&
        generateSTLListFromComponents(allMaterials, components),
      quantum: quantumDimsInput,
      fileName: selectedProject.faunaDocumentId as string,
    };
    client.publish({
      destination: 'management',
      body: JSON.stringify({
        message: 'compute mesh',
        body: objToSendToMesher,
      }),
    });

    return () => {
      dispatch(
        unsetMeshProgressLength(selectedProject.faunaDocumentId as string),
      );
      dispatch(unsetMeshProgress(selectedProject.faunaDocumentId as string));
      dispatch(unsetMesherResults(selectedProject.faunaDocumentId as string));
    };
  }, []);

  const { execQuery } = useFaunaQuery()

  useEffect(() => {
    if (mesherResults) {
      if (mesherResults.isStopped) {
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
      } else if (mesherResults.isValid.valid === false) {
        dispatch(
          setMessageInfoModal(
            'Error! Mesh not valid. Please adjust quantum along ' +
              mesherResults.isValid.axis +
              ' axis.',
          ),
        );
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
      } else {
        dispatch(
          setMeshGenerated({
            status: 'Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
        dispatch(
          setMesh({
            mesh: mesherResults.meshPath,
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
        dispatch(
          setExternalGrids({
            extGrids: mesherResults.gridsPath,
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
        execQuery(
          updateProjectInFauna,
          convertInFaunaProjectThis({
            ...selectedProject,
            meshData: {
              ...selectedProject.meshData,
              mesh: mesherResults.meshPath,
              externalGrids: mesherResults.gridsPath,
              meshGenerated: 'Generated',
            },
          }),
        ).then(() => {});
      }
    }
  }, [mesherResults]);

  useEffect(() => {
    if (isAlertConfirmed) {
      if (!isAlert) {
        //sendMessage('Stop computation');
      } else {
        dispatch(
          setMeshGenerated({
            status: 'Not Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
      }
    }
  }, [isAlertConfirmed]);

  return (
    <div
      className={`p-5 bg-white rounded-xl flex flex-col gap-4 items-center justify-center w-full`}
    >
      {stopSpinner && (
        <ImSpinner className="animate-spin w-8 h-8 absolute top-1/2 left-1/2" />
      )}
      <div
        className={`flex flex-col gap-2 w-full ${
          stopSpinner ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <span>Meshing</span>
        <div className="flex flex-row justify-between items-center w-full">
          {checkProgressLength && checkProgressLength.length > 0 ? (
            <div className="flex flex-row w-full justify-between items-center">
              <progress className="progress w-full mr-4" value={1} max={1} />
              <AiOutlineCheckCircle size="20px" className="text-green-500" />
            </div>
          ) : (
            <progress className="progress w-full" />
          )}
        </div>
      </div>
      <div
        className={`flex flex-col gap-2 w-full ${
          stopSpinner ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <span>Check mesh validity</span>
        <div className="flex flex-row justify-between items-center w-full">
          {checkProgressValue &&
          checkProgressLength &&
          checkProgressLength.length > 0 ? (
            <div className="flex flex-row w-full justify-between items-center">
              <progress
                className="progress w-full mr-4"
                value={checkProgressValue.index}
                max={checkProgressLength.length}
              />
              {checkProgressValue.index === checkProgressLength.length && (
                <AiOutlineCheckCircle size="20px" className="text-green-500" />
              )}
            </div>
          ) : (
            <progress className="progress w-full" />
          )}
        </div>
      </div>
      {/* <div className={`flex flex-col gap-2 w-full ${stopSpinner ? 'opacity-40' : 'opacity-100'}`}>
        <span>Loading Data</span>
        <div className='flex flex-row justify-between items-center w-full'>
          {loadingData && (
            <progress className='progress w-full' />
          )}
        </div>
      </div> */}
      <div
        className="button w-full buttonPrimary text-center mt-4 mb-4"
        onClick={() => {
          dispatch(setMessageInfoModal('Are you sure to stop the meshing?'));
          dispatch(setIsAlertInfoModal(false));
          dispatch(setShowInfoModal(true));
          setStopSpinner(true);
        }}
      >
        Stop Meshing
      </div>
    </div>
  );
};
