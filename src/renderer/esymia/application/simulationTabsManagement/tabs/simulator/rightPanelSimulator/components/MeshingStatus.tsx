import React, { useEffect, useState } from 'react';
import { ImSpinner } from 'react-icons/im';
import {
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  mesherProgressLengthSelector,
  mesherProgressSelector,
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal,
  unsetMeshProgress,
  unsetMeshProgressLength
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { useDispatch, useSelector } from 'react-redux';
import useWebSocket from 'react-use-websocket';
import { setMeshGenerated, setPreviousMeshStatus } from '../../../../../../store/projectSlice';
import { Project } from '../../../../../../model/esymiaModels';
import { generateSTLListFromComponents, launchMeshing } from './rightPanelFunctions';
import { ComponentEntity, Material } from 'cad-library';
import { TiArrowMinimise } from 'react-icons/ti';
import { AiOutlineCheckCircle } from 'react-icons/ai';

export interface MeshingStatusProps {
  feedbackMeshingVisible: boolean;
  setFeedbackMeshingVisible: (v: boolean) => void;
  activeMeshing: {
    selectedProject: Project,
    allMaterials: Material[],
    quantum: [number, number, number],
    meshStatus: 'Not Generated' | 'Generated'
  }[];
}

const MeshingStatus: React.FC<MeshingStatusProps> = ({
                                                       feedbackMeshingVisible,
                                                       setFeedbackMeshingVisible,
                                                       activeMeshing
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
                             quantumDimsInput={m.quantum} />
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
}

const MeshingStatusItem: React.FC<MeshingStatusItemProps> = ({
                                                               selectedProject,
                                                               allMaterials,
                                                               quantumDimsInput
                                                             }) => {


  const dispatch = useDispatch();
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector)
  const isAlert = useSelector(isAlertInfoModalSelector);
  const checkProgressLength = useSelector(mesherProgressLengthSelector).filter(item => item.id === selectedProject.faunaDocumentId as string)[0]
  const checkProgressValue = useSelector(mesherProgressSelector).filter(item => item.id === selectedProject.faunaDocumentId as string)[0]
  const [stopSpinner, setStopSpinner] = useState<boolean>(false);

  useEffect(() => {
    launchMeshing(selectedProject, allMaterials as Material[], quantumDimsInput);
    return () => {
      dispatch(unsetMeshProgressLength(selectedProject.faunaDocumentId as string))
      dispatch(unsetMeshProgress(selectedProject.faunaDocumentId as string))
    }
  }, [])
  

  useEffect(() => {
    if (isAlertConfirmed) {
      if (!isAlert) {
        //sendMessage('Stop computation');
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
          {checkProgressLength && checkProgressLength.length > 0 ? (
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
          {checkProgressValue && checkProgressLength && checkProgressLength.length > 0 ? (
            <div className='flex flex-row w-full justify-between items-center'>
              <progress
                className='progress w-full mr-4'
                value={checkProgressValue.index}
                max={checkProgressLength.length}
              />
              {checkProgressValue.index === checkProgressLength.length &&
                <AiOutlineCheckCircle size='20px' className='text-green-500' />}

            </div>
          ) : (
            <progress className='progress w-full' />
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
