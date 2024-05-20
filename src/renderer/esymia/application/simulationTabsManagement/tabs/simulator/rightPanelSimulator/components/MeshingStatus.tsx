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
import axios from 'axios';
import {
  deleteSimulation,
  findProjectByFaunaID,
  setMeshApproved, setMeshGenerated,
  updateSimulation
} from '../../../../../../store/projectSlice';
import { Project, Simulation } from '../../../../../../model/esymiaModels';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';
import { launchMeshing, saveMeshAndExternalGridsToS3 } from './rightPanelFunctions';
import { Material } from 'cad-library';
import { AppDispatch } from '../../../../../../store/store';

export interface MeshingStatusProps {
  selectedProject: Project,
  allMaterials: Material[],
  quantumDimsInput: [number, number, number],
  setAlert:Function,
  meshStatus: "Not Generated" | "Generated" | "Generating"
}

const MeshingStatus: React.FC<MeshingStatusProps> = ({
  selectedProject, allMaterials, quantumDimsInput, meshStatus, setAlert
                                                     }) => {

  const dispatch = useDispatch()
  const WS_URL = 'ws://localhost:8081';
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
  const isAlert = useSelector(isAlertInfoModalSelector);

  const { sendMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
      console.log('start request');
      launchMeshing(selectedProject, allMaterials as Material[], quantumDimsInput, dispatch, saveMeshAndExternalGridsToS3, setAlert, meshStatus)
    },
    shouldReconnect: () => false,
    onMessage: (event) => {

    },
    onClose: () => {
      console.log('WebSocket connection closed.');
    },
    onError: () => {
      dispatch(setMessageInfoModal('Error while meshing, please start mesher on plugins section and try again'))
      dispatch(setIsAlertInfoModal(true))
      dispatch(setShowInfoModal(true))
      dispatch(setMeshGenerated('Not Generated'))
    }
  });

  useEffect(() => {
    if (isAlertConfirmed) {
      if (!isAlert) {
        sendMessage('Stop computation');
      } else {
        dispatch(setMeshGenerated('Not Generated'))
      }
    }
  }, [isAlertConfirmed]);


  return (
    <div className='absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] p-5 bg-white rounded-xl flex flex-col gap-4 items-center justify-center w-1/4'>
      <h5>Meshing</h5>
      <hr className='w-full' />
      <ImSpinner className='animate-spin w-12 h-12' />
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
        }}
      >
        Stop Meshing
      </div>
    </div>
  );
};

export default MeshingStatus;
