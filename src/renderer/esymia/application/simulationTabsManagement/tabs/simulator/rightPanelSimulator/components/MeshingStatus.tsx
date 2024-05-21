import React, { useEffect } from 'react';
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
import { setMeshGenerated } from '../../../../../../store/projectSlice';
import { Project, Simulation } from '../../../../../../model/esymiaModels';
import { launchMeshing, saveMeshAndExternalGridsToS3 } from './rightPanelFunctions';
import { Material, useFaunaQuery } from 'cad-library';
import { TiArrowMinimise } from 'react-icons/ti';
import { useEffectNotOnMount } from '../../../../../../hook/useEffectNotOnMount';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';

export interface MeshingStatusProps {
  feedbackMeshingVisible: boolean;
  setFeedbackMeshingVisible: (v: boolean) => void;
  activeMeshing: {
    selectedProject: Project,
    allMaterials: Material[],
    quantum: [number, number, number],
    meshStatus: 'Not Generated' | 'Generated' | 'Generating'
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
  meshStatus: 'Not Generated' | 'Generated' | 'Generating'
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
  const { execQuery } = useFaunaQuery()


  const { sendMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
      console.log('start request');
      launchMeshing(selectedProject, allMaterials as Material[], quantumDimsInput, dispatch, saveMeshAndExternalGridsToS3, setAlert, meshStatus, execQuery);
    },
    shouldReconnect: () => false,
    onMessage: (event) => {

    },
    onClose: () => {
      console.log('WebSocket connection closed.');
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
      className='p-5 bg-white rounded-xl flex flex-col gap-4 items-center justify-center w-full'>
      <ImSpinner className='animate-spin w-12 h-12' />
      {/* <div
        className='button w-full buttonPrimary text-center mt-4 mb-4'
        onClick={() => {
          dispatch(
            setMessageInfoModal(
              'Are you sure to stop the meshing?'
            )
          );
          dispatch(setIsAlertInfoModal(false));
          dispatch(setShowInfoModal(true));
        }}
      >
        Stop Meshing
      </div> */}
    </div>
  );
};
