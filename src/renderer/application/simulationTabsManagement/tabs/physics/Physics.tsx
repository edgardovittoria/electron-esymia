import React, { FC, useEffect, useRef, useState } from 'react';
import { FactoryShapes, meshFrom, useFaunaQuery } from 'cad-library';
import { useDispatch, useSelector } from 'react-redux';
import * as THREE from 'three';
import { BiHide, BiShow } from 'react-icons/bi';
import {
  boundingBoxDimensionSelector,
  findSelectedPort,
  selectedProjectSelector,
  setBoundingBoxDimension,
} from '../../../../store/projectSlice';
import { PhysicsLeftPanelTab } from './PhysicsLeftPanelTab';
import { CreatePorts } from './portManagement/selectPorts/CreatePorts';
import { PortManagement } from './portManagement/PortManagement';
import { PortType } from './portManagement/components/PortType';
import { PortPosition } from './portManagement/components/PortPosition';
import { RLCParamsComponent } from './portManagement/components/RLCParamsComponent';
import { ModalSelectPortType } from './portManagement/ModalSelectPortType';
import { InputSignal } from './inputSignal/InputSignal';
import { InputSignalManagement } from './inputSignal/InputSignalManagement';
import { MyPanel } from '../../sharedElements/MyPanel';
import { Port, Project } from '../../../../model/esymiaModels';
import { ImportExportPhysicsSetup } from './ImportExportPhysicsSetup';
import StatusBar from '../../sharedElements/StatusBar';
import { updateProjectInFauna } from '../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../faunadb/apiAuxiliaryFunctions';
import { Vector3 } from 'three';
import { CanvasPhysics } from './CanvasPhysics';

interface PhysicsProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
  savedPortParameters: boolean;
  setSavedPortParameters: Function;
}

export const Physics: React.FC<PhysicsProps> = ({
                                                  selectedTabLeftPanel,
                                                  setSelectedTabLeftPanel,
                                                  savedPortParameters,
                                                  setSavedPortParameters
                                                }) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const { execQuery } = useFaunaQuery();
  const dispatch = useDispatch();




  const [selectedTabRightPanel, setSelectedTabRightPanel] = useState<string>('Ports');
  const [cameraPosition, setCameraPosition] = useState<Vector3>(new THREE.Vector3( 0, 0, 0 ));
  const [surfaceAdvices, setSurfaceAdvices] = useState<boolean>(false);


  useEffect(() => {
    if (selectedProject && savedPortParameters) {
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis(selectedProject)
      ).then(() => {
      });
    }
  }, [savedPortParameters, selectedProject?.signal]);

  const boundingBoxDimension = useSelector(boundingBoxDimensionSelector)

  useEffect(() => {
    if(!boundingBoxDimension){
      console.log('qui')
      const group = new THREE.Group();
      if (selectedProject && selectedProject.model.components) {
        selectedProject.model.components.forEach((c) => {
          group.add(meshFrom(c));
        });
      }
      const boundingbox = new THREE.Box3().setFromObject(group);
      dispatch(setBoundingBoxDimension(boundingbox.getSize(boundingbox.max).x));
    }

  }, []);

  return (
    <>
      <CanvasPhysics
        setCameraPosition={setCameraPosition}
        surfaceAdvices={surfaceAdvices}
        setSavedPortParameters={setSavedPortParameters}
        setSurfaceAdvices={setSurfaceAdvices}
      />
      <div className='absolute lg:left-[42%] left-[38%] gap-2 top-[160px] flex flex-row'>
        {selectedProject?.model.components && (
          <>
            <CreatePorts selectedProject={selectedProject} cameraPosition={cameraPosition}/>
            <ImportExportPhysicsSetup />
            <SurfaceAdvicesButton
              surfaceAdvices={surfaceAdvices}
              setSurfaceAdvices={setSurfaceAdvices}
            />
          </>

        )}

      </div>
      <PhysicsLeftPanel
        selectedTabLeftPanel={selectedTabLeftPanel}
        setSelectedTabLeftPanel={setSelectedTabLeftPanel}
      />
      <PhysicsRightPanel
        selectedTabRightPanel={selectedTabRightPanel}
        setSelectedTabRightPanel={setSelectedTabRightPanel}
        savedPortParameters={savedPortParameters}
        setSavedPortParameters={setSavedPortParameters}
      />
      <StatusBar />
    </>
  );
};



const SurfaceAdvicesButton: FC<{
  surfaceAdvices: boolean;
  setSurfaceAdvices: Function;
}> = ({ surfaceAdvices, setSurfaceAdvices }) => {
  return (
    <div
      className='tooltip'
      data-tip={
        surfaceAdvices ? 'Hide Surface Advices' : 'Show Surface Advices'
      }
    >
      <button
        className='bg-white rounded p-2'
        onClick={() => setSurfaceAdvices(!surfaceAdvices)}
      >
        {surfaceAdvices ? (
          <BiShow className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
        ) : (
          <BiHide className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
        )}
      </button>
    </div>
  );
};

const PhysicsLeftPanel: FC<{
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}> = ({ selectedTabLeftPanel, setSelectedTabLeftPanel }) => {
  return (
    <MyPanel
      tabs={['Physics']}
      selectedTab={selectedTabLeftPanel}
      setSelectedTab={setSelectedTabLeftPanel}
      className='absolute left-[2%] top-[160px] md:w-1/4 xl:w-1/5'
    >
      <PhysicsLeftPanelTab />
    </MyPanel>
  );
};

const PhysicsRightPanel: FC<{
  selectedTabRightPanel: string;
  setSelectedTabRightPanel: Function;
  savedPortParameters: boolean;
  setSavedPortParameters: Function;
}> = ({ selectedTabRightPanel, setSelectedTabRightPanel, savedPortParameters, setSavedPortParameters }) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);
  return (
    <MyPanel
      tabs={['Ports', 'Signals']}
      selectedTab={selectedTabRightPanel}
      setSelectedTab={setSelectedTabRightPanel}
      className='absolute right-[2%] top-[160px] w-1/4'
    >
      {selectedTabRightPanel === 'Ports' ? (
        <PortManagement
          selectedPort={selectedPort}
          savedPortParameters={savedPortParameters}
          setSavedPortParameters={setSavedPortParameters}
        >
          <PortType
            disabled={selectedProject?.simulation?.status === 'Completed'}
            setShow={setShowModalSelectPortType}
            selectedPort={selectedPort as Port}
          />
          <PortPosition
            selectedPort={selectedPort as Port}
            disabled={selectedProject?.simulation?.status === 'Completed'}
            setSavedPortParameters={setSavedPortParameters}
          />
          <RLCParamsComponent
            selectedPort={selectedPort as Port}
            disabled={selectedProject?.simulation?.status === 'Completed'}
            setSavedPortParameters={setSavedPortParameters}
          />
          {selectedProject?.simulation?.status !== 'Completed' && (
            <ModalSelectPortType
              show={showModalSelectPortType}
              setShow={setShowModalSelectPortType}
              selectedPort={selectedPort as Port}
              setSavedPortParameters={setSavedPortParameters}
            />
          )}
        </PortManagement>
      ) : (
        <InputSignalManagement>
          <InputSignal
            disabled={selectedProject?.simulation?.status === 'Completed'}
            selectedProject={selectedProject as Project}
          />
        </InputSignalManagement>
      )}
    </MyPanel>
  );
};

