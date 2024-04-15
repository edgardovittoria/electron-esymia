import React, { FC, useEffect, useRef, useState } from 'react';
import { FactoryShapes, meshFrom, useFaunaQuery } from 'cad-library';
import { useDispatch, useSelector } from 'react-redux';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { BiHide, BiShow } from 'react-icons/bi';
import { ThreeEvent } from '@react-three/fiber';
import {
  findSelectedPort,
  selectedProjectSelector,
  selectPort,
  setBoundingBoxDimension,
  updatePortPosition,
} from '../../../../store/projectSlice';
import { CanvasBaseWithRedux } from '../../sharedElements/CanvasBaseWithRedux';
import { PortControls } from './portManagement/PortControls';
import { ProbeControls } from './portManagement/ProbeControls';
import { PhysicsLeftPanelTab } from './PhysicsLeftPanelTab';
import { SelectPorts } from './portManagement/selectPorts/SelectPorts';
import { PortManagement } from './portManagement/PortManagement';
import { PortType } from './portManagement/components/PortType';
import { PortPosition } from './portManagement/components/PortPosition';
import { RLCParamsComponent } from './portManagement/components/RLCParamsComponent';
import { ModalSelectPortType } from './portManagement/ModalSelectPortType';
import { InputSignal } from './inputSignal/InputSignal';
import { InputSignalManagement } from './inputSignal/InputSignalManagement';
import { MyPanel } from '../../sharedElements/MyPanel';
import { Models } from '../../sharedElements/Models';
import { ModelOutliner } from '../../sharedElements/ModelOutliner';
import { Port, Probe, Project } from '../../../../model/esymiaModels';
import { ImportExportPhysicsSetup } from './ImportExportPhysicsSetup';
import StatusBar from '../../sharedElements/StatusBar';
import { updateProjectInFauna } from '../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../faunadb/apiAuxiliaryFunctions';
import EdgesGenerator from './EdgesGenerator';

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
  setSavedPortParameters,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const { execQuery } = useFaunaQuery();
  const dispatch = useDispatch();
  const [surfaceAdvices, setSurfaceAdvices] = useState(true);
  const [pointerEvent, setPointerEvent] = useState<
    ThreeEvent<MouseEvent> | undefined
  >(undefined);
  const [inputPortPositioned, setInputPortPositioned] = useState(false);
  const mesh = useRef<THREE.Mesh[]>([]);
  const [selectedTabRightPanel, setSelectedTabRightPanel] = useState<string>('Ports');

  const setMesh = (meshToSet: THREE.Mesh, index: number) => {
    if (meshToSet) {
      mesh.current[index] = meshToSet;
    }
  };

  useEffect(() => {
    if (pointerEvent) {
      if (!inputPortPositioned) {
        dispatch(
          updatePortPosition({
            type: 'first',
            position: [
              pointerEvent.point.x,
              pointerEvent.point.y,
              pointerEvent.point.z,
            ],
          }),
        );
        setInputPortPositioned(true);
      } else {
        dispatch(
          updatePortPosition({
            type: 'last',
            position: [
              pointerEvent.point.x,
              pointerEvent.point.y,
              pointerEvent.point.z,
            ],
          }),
        );
        setInputPortPositioned(false);
      }
    }
  }, [pointerEvent]);

  useEffect(() => {
    if (selectedProject && savedPortParameters) {
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis(selectedProject),
      ).then(() => {});
    }
  }, [savedPortParameters, selectedProject?.signal]);

  useEffect(() => {
    if (mesh.current && mesh.current.length !== 0) {
      const group = new THREE.Group();
      if (selectedProject && selectedProject.model.components) {
        selectedProject.model.components.forEach((c) => {
          group.add(meshFrom(c));
        });
      }
      const boundingbox = new THREE.Box3().setFromObject(group);
      dispatch(setBoundingBoxDimension(boundingbox.getSize(boundingbox.max).x));
    }
  }, [selectedProject, selectedProject?.model, mesh.current]);

  return (
    <>
      <CanvasBaseWithRedux
        section="Physics"
        setPointerEvent={setPointerEvent}
        setMesh={setMesh}
      >
        <EdgesGenerator
          meshRef={mesh}
          surfaceAdvices={surfaceAdvices as boolean}
          inputPortPositioned={inputPortPositioned as boolean}
          setInputPortPositioned={setInputPortPositioned as Function}
        />
        <PhysicsPortsDrawer />
        <PhysicsPortsControlsDrawer
          setSavedPortParameters={setSavedPortParameters}
        />
      </CanvasBaseWithRedux>
      <div className="absolute lg:left-[42%] left-[38%] gap-2 top-[160px] flex flex-row">
        {selectedProject?.model?.components && (
          <SelectPorts selectedProject={selectedProject} />
        )}
        <ImportExportPhysicsSetup />
        <SurfaceAdvicesButton
          surfaceAdvices={surfaceAdvices}
          setSurfaceAdvices={setSurfaceAdvices}
        />
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

const PhysicsPortsDrawer: FC = () => {
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();
  return (
    <>
      {selectedProject?.ports.map((port, index) => {
        if (port.category === 'port' || port.category === 'lumped') {
          return (
            <group key={index}>
              <mesh
                name={port.inputElement.name}
                position={port.inputElement.transformationParams.position}
                scale={port.inputElement.transformationParams.scale}
                rotation={port.inputElement.transformationParams.rotation}
                onClick={() => dispatch(selectPort(port.name))}
              >
                <FactoryShapes entity={port.inputElement} color="#00ff00" />
              </mesh>

              <mesh
                name={port.outputElement.name}
                position={port.outputElement.transformationParams.position}
                scale={port.outputElement.transformationParams.scale}
                rotation={port.outputElement.transformationParams.rotation}
                onClick={() => dispatch(selectPort(port.name))}
              >
                <FactoryShapes entity={port.outputElement} />
              </mesh>
              <Line
                points={[
                  port.inputElement.transformationParams.position,
                  port.outputElement.transformationParams.position,
                ]}
                color={
                  port.category === 'port'
                    ? new THREE.Color('red').getHex()
                    : new THREE.Color('violet').getHex()
                }
                lineWidth={1}
              />
            </group>
          );
        }
        return (
          <group
            key={port.name}
            name={port.name}
            onClick={() => dispatch(selectPort(port.name))}
            position={(port as Probe).groupPosition}
          >
            {(port as Probe).elements.map((element, index) => {
              return (
                <mesh
                  key={index}
                  position={element.transformationParams.position}
                  scale={element.transformationParams.scale}
                  rotation={element.transformationParams.rotation}
                >
                  <FactoryShapes entity={element} color="orange" />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </>
  );
};

const PhysicsPortsControlsDrawer: FC<{ setSavedPortParameters: Function }> = ({
  setSavedPortParameters,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const dispatch = useDispatch();
  return (
    <>
      {selectedProject?.simulation?.status !== 'Completed' && (
        <>
          {selectedPort &&
            (selectedPort.category === 'port' ||
              selectedPort.category === 'lumped') && (
              <PortControls
                selectedPort={selectedPort}
                updatePortPosition={(obj: {
                  type: 'first' | 'last';
                  position: [number, number, number];
                }) => dispatch(updatePortPosition(obj))}
                setSavedPortParameters={setSavedPortParameters}
              />
            )}
          {selectedPort && selectedPort.category === 'probe' && (
            <ProbeControls
              selectedProbe={selectedPort as Probe}
              updateProbePosition={(obj: {
                type: 'first' | 'last';
                position: [number, number, number];
              }) => dispatch(updatePortPosition(obj))}
              setSavedPortParameters={setSavedPortParameters}
            />
          )}
        </>
      )}
    </>
  );
};

const SurfaceAdvicesButton: FC<{
  surfaceAdvices: boolean;
  setSurfaceAdvices: Function;
}> = ({ surfaceAdvices, setSurfaceAdvices }) => {
  return (
    <div
      className="tooltip"
      data-tip={
        surfaceAdvices ? 'Hide Surface Advices' : 'Show Surface Advices'
      }
    >
      <button
        className="bg-white rounded p-2"
        onClick={() => setSurfaceAdvices(!surfaceAdvices)}
      >
        {surfaceAdvices ? (
          <BiShow className="h-5 w-5 text-green-300 hover:text-secondaryColor" />
        ) : (
          <BiHide className="h-5 w-5 text-green-300 hover:text-secondaryColor" />
        )}
      </button>
    </div>
  );
};

/* const PhysicsRight2Panel: FC<{

}> = ({ savedPortParameters, setSavedPortParameters }) => {

  return (
    <>
      {selectedPort &&
      (selectedPort?.category === 'port' ||
        selectedPort?.category === 'lumped') ? (
        <>


        </>
      ) : (
        <PortManagement
          selectedPort={selectedPort}
          savedPortParameters={savedPortParameters}
          setSavedPortParameters={setSavedPortParameters}
        >
          <PortPosition
            selectedPort={selectedPort ?? ({} as Probe)}
            disabled={selectedProject?.simulation?.status === 'Completed'}
            setSavedPortParameters={setSavedPortParameters}
          />
        </PortManagement>
      )}
    </>
  );
}; */

const PhysicsLeftPanel: FC<{
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}> = ({ selectedTabLeftPanel, setSelectedTabLeftPanel }) => {
  return (
    <MyPanel
      tabs={['Modeler', 'Physics']}
      selectedTab={selectedTabLeftPanel}
      setSelectedTab={setSelectedTabLeftPanel}
      className="absolute left-[2%] top-[160px] md:w-1/4 xl:w-1/5"
    >
      {selectedTabLeftPanel === 'Physics' ? (
        <PhysicsLeftPanelTab />
      ) : (
        <Models>
          <ModelOutliner />
        </Models>
      )}
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
      className="absolute right-[2%] top-[160px] w-1/4"
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

