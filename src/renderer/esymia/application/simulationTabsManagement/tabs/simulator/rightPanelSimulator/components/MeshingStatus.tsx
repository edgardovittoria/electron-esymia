import React, { useEffect, useState } from 'react';
import { ImSpinner } from 'react-icons/im';
import {
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { useDispatch, useSelector } from 'react-redux';
import useWebSocket from 'react-use-websocket';
import { setMeshGenerated, setPreviousMeshStatus } from '../../../../../../store/projectSlice';
import { Project, Simulation } from '../../../../../../model/esymiaModels';
import { launchMeshing } from './rightPanelFunctions';
import { Material, useFaunaQuery } from 'cad-library';
import { TiArrowMinimise } from 'react-icons/ti';
import { useEffectNotOnMount } from '../../../../../../hook/useEffectNotOnMount';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { useStorageData } from '../hook/useStorageData';

export interface MeshingStatusProps {
  feedbackMeshingVisible: boolean;
  setFeedbackMeshingVisible: (v: boolean) => void;
  activeMeshing: {
    selectedProject: Project,
    allMaterials: Material[],
    quantum: [number, number, number],
    meshStatus: 'Not Generated' | 'Generated'
  }[];
  setAlert: (v: boolean) => void;
}

const MeshingStatus: React.FC<MeshingStatusProps> = ({
                                                       feedbackMeshingVisible,
                                                       setFeedbackMeshingVisible,
                                                       activeMeshing,
                                                       setAlert
                                                     }) => {
  return (
    <div
      className={`absolute right-10 w-1/4 bottom-6 flex flex-col justify-center items-center bg-white p-3 rounded ${
        !feedbackMeshingVisible && 'hidden'
      }`}
    >
      <div className='flex flex-row justify-between'>
        <h5>Meshing Status</h5>
        <TiArrowMinimise
          className='absolute top-2 right-2 hover:cursor-pointer hover:bg-gray-200'
          size={20}
          onClick={() => setFeedbackMeshingVisible(false)}
        />
      </div>
      <hr className='text-secondaryColor w-full mb-5 mt-3' />
      <div className='max-h-[600px] overflow-y-scroll w-full'>
        {activeMeshing.map((m) => (
          <MeshingStatusItem selectedProject={m.selectedProject} allMaterials={m.allMaterials}
                             quantumDimsInput={m.quantum} setAlert={setAlert} meshStatus={m.meshStatus} />
        ))}
      </div>
    </div>
  );
};

export default MeshingStatus;

export interface MeshingStatusItemProps {
  selectedProject: Project,
  allMaterials: Material[],
  quantumDimsInput: [number, number, number],
  setAlert: Function,
  meshStatus: 'Not Generated' | 'Generated'
}

const MeshingStatusItem: React.FC<MeshingStatusItemProps> = ({
                                                               selectedProject,
                                                               allMaterials,
                                                               quantumDimsInput,
                                                               meshStatus,
                                                               setAlert
                                                             }) => {

  const dispatch = useDispatch();
  const WS_URL = 'ws://localhost:8081';
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
  const isAlert = useSelector(isAlertInfoModalSelector);
  const { execQuery } = useFaunaQuery();
  const [meshing, setMeshing] = useState<boolean>(false);
  const [checkProgressLength, setCheckProgressLength] = useState<number>(0);
  const [checkProgressValue, setCheckProgressValue] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [stopSpinner, setStopSpinner] = useState<boolean>(false);
  const { saveMeshData } = useStorageData();
  const { sendMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
      console.log('start request');
      launchMeshing(selectedProject, allMaterials as Material[], quantumDimsInput, dispatch, saveMeshData, setAlert, meshStatus, execQuery, setLoadingData);
    },
    shouldReconnect: () => false,
    onMessage: (event) => {
      if (event.data === 'Computing completed') {
        setMeshing(true);
      } else if ((event.data as string).startsWith('length')) {
        setCheckProgressLength(parseInt((event.data as string).substring((event.data as string).indexOf(':') + 1)));
      } else {
        setCheckProgressValue(event.data);
      }
    },
    onClose: () => {
      console.log('WebSocket connection closed.');
      dispatch(setPreviousMeshStatus({ status: undefined, projectToUpdate: selectedProject.faunaDocumentId as string }));
    },
    onError: () => {
      dispatch(setMessageInfoModal('Error while meshing, please start mesher on plugins section and try again'));
      dispatch(setIsAlertInfoModal(true));
      dispatch(setShowInfoModal(true));
      dispatch(setMeshGenerated({ status: 'Not Generated', projectToUpdate: selectedProject.faunaDocumentId as string }));
    }
  });

  useEffect(() => {
    if (isAlertConfirmed) {
      if (!isAlert) {
        sendMessage('Stop computation');
      } else {
        dispatch(setMeshGenerated({ status: 'Not Generated', projectToUpdate: selectedProject.faunaDocumentId as string }));
      }
    }
  }, [isAlertConfirmed]);


  return (
    <div
      className={`p-5 bg-white rounded-xl flex flex-col gap-4 items-center justify-center w-full`}>
      {stopSpinner && <ImSpinner className="animate-spin w-8 h-8 absolute top-1/2 left-1/2"/> }
      <div className={`flex flex-col gap-2 w-full ${stopSpinner ? 'opacity-40' : 'opacity-100'}`}>
        <span>Meshing</span>
        <div className='flex flex-row justify-between items-center w-full'>
          {meshing ? (
            <div className='flex flex-row w-full justify-between items-center'>
              <progress
                className='progress w-full mr-4'
                value={1}
                max={1}
              />
              <AiOutlineCheckCircle
                size='20px'
                className='text-green-500'
              />
            </div>
          ) : (
            <progress className='progress w-full' />
          )}
        </div>
      </div>
      <div className={`flex flex-col gap-2 w-full ${stopSpinner ? 'opacity-40' : 'opacity-100'}`}>
        <span>Check mesh validity</span>
        <div className='flex flex-row justify-between items-center w-full'>
          {checkProgressLength > 0 ? (
            <div className='flex flex-row w-full justify-between items-center'>
              <progress
                className='progress w-full mr-4'
                value={checkProgressValue}
                max={checkProgressLength}
              />
              {checkProgressValue === checkProgressLength &&
                <AiOutlineCheckCircle size='20px' className='text-green-500' />}

            </div>
          ) : (
            <progress className='progress w-full' />
          )}
        </div>
      </div>
      <div className={`flex flex-col gap-2 w-full ${stopSpinner ? 'opacity-40' : 'opacity-100'}`}>
        <span>Loading Data</span>
        <div className='flex flex-row justify-between items-center w-full'>
          {loadingData && (
            <progress className='progress w-full' />
          )}
        </div>
      </div>
      <div
        className='button w-full buttonPrimary text-center mt-4 mb-4'
        onClick={() => {
          dispatch(
            setMessageInfoModal(
              'Are you sure to stop the meshing?'
            )
          );
          dispatch(setIsAlertInfoModal(false));
          dispatch(setShowInfoModal(true));
          setStopSpinner(true)
        }}
      >
        Stop Meshing
      </div>
    </div>
  );
};
