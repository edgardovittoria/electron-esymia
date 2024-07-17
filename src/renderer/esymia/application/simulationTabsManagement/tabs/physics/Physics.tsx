import React, { FC, useEffect, useState } from 'react';
import { meshFrom, useFaunaQuery } from 'cad-library';
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
import { MyPanel } from '../../sharedElements/MyPanel';
import { Port, Project, TempLumped } from '../../../../model/esymiaModels';
import { ImportExportPhysicsSetup } from './ImportExportPhysicsSetup';
import StatusBar from '../../sharedElements/StatusBar';
import { updateProjectInFauna } from '../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../faunadb/apiAuxiliaryFunctions';
import { Vector3 } from 'three';
import { CanvasPhysics } from './CanvasPhysics';
import { ResetFocusButton } from '../../sharedElements/ResetFocusButton';
import { physicsRightPanelTitle } from '../../../config/panelTitles';
import ScatteringParameter from './portManagement/components/ScatteringParameter';
import FrequenciesDef from './frequenciesDef/FrequenciesDef';
import { useEffectNotOnMount } from '../../../../hook/useEffectNotOnMount';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { calculateModelBoundingBox } from '../../sharedElements/utilityFunctions';
import { FaReact } from 'react-icons/fa';
import { SiAzurefunctions } from 'react-icons/si';
import { GiAtom } from 'react-icons/gi';
import { GrStatusInfo } from 'react-icons/gr';

interface PhysicsProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}

export const Physics: React.FC<PhysicsProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const { execQuery } = useFaunaQuery();
  const dispatch = useDispatch();
  const [savedPhysicsParameters, setSavedPhysicsParameters] = useState(true);
  const [selectedTabRightPanel, setSelectedTabRightPanel] = useState<
    string | undefined
  >(undefined);
  const [showAdvices, setShowAdvices] = useState<boolean>(false);
  const [cameraPosition, setCameraPosition] = useState<Vector3>(
    new THREE.Vector3(0, 0, 0),
  );
  const [surfaceAdvices, setSurfaceAdvices] = useState<boolean>(false);
  const [resetFocus, setResetFocus] = useState(false);
  const toggleResetFocus = () => {
    setResetFocus(!resetFocus);
    setSurfaceAdvices(false);
  };

  useEffectNotOnMount(() => {
    if (selectedProject && savedPhysicsParameters) {
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis(selectedProject),
      ).then(() => {});
    }
  }, [savedPhysicsParameters]);

  const boundingBoxDimension = useSelector(boundingBoxDimensionSelector);

  useEffect(() => {
    if (!boundingBoxDimension) {
      const boundingbox = calculateModelBoundingBox(selectedProject as Project);
      dispatch(setBoundingBoxDimension(boundingbox.getSize(boundingbox.max).x));
    }
  }, []);

  return (
    <>
      <CanvasPhysics
        resetFocus={resetFocus}
        setCameraPosition={setCameraPosition}
        surfaceAdvices={surfaceAdvices}
        setSavedPortParameters={setSavedPhysicsParameters}
        setSurfaceAdvices={setSurfaceAdvices}
      />
      <div className="absolute lg:left-[42%] left-[38%] gap-2 top-[180px] flex flex-row">
        {selectedProject?.model.components && (
          <>
            <CreatePorts
              selectedProject={selectedProject}
              cameraPosition={cameraPosition}
            />
            <ImportExportPhysicsSetup />
            <SurfaceAdvicesButton
              surfaceAdvices={surfaceAdvices}
              setSurfaceAdvices={setSurfaceAdvices}
            />
            <ResetFocusButton toggleResetFocus={toggleResetFocus} />
            <div className="">
              <div
                className="tooltip tooltip-right bg-white p-2 "
                data-tip="Port Positioning Info"
                onClick={() => setShowAdvices(!showAdvices)}
              >
                <GrStatusInfo size={18} color="blue" />
              </div>
              {showAdvices && <PositioningPortsInfo />}
            </div>
          </>
        )}
      </div>
      <PhysicsLeftPanel
        selectedTabLeftPanel={selectedTabLeftPanel}
        setSelectedTabLeftPanel={setSelectedTabLeftPanel}
      />

      {/* <PhysicsRightPanel
        selectedTabRightPanel={selectedTabRightPanel}
        setSelectedTabRightPanel={setSelectedTabRightPanel}
        savedPhysicsParameters={savedPhysicsParameters}
        setSavedPhysicsParameters={setSavedPhysicsParameters}
      /> */}
      <PhysicsRightSidebar
        selectedTabRightPanel={selectedTabRightPanel}
        setSelectedTabRightPanel={setSelectedTabRightPanel}
        savedPhysicsParameters={savedPhysicsParameters}
        setSavedPhysicsParameters={setSavedPhysicsParameters}
      />
      <StatusBar />
    </>
  );
};

const PositioningPortsInfo: FC = () => {
  return (
    <div className="flex flex-col bg-white shadow-2xl text-sm text-start p-[10px] max-w-[300px] max-h-[300px] overflow-y-scroll">
      <span className="font-semibold">
        Once you have added a new termination, you can place it in the following
        ways:
      </span>
      <div className="list-decimal ml-3 mt-2">
        <li>double clicking on model surface point of interest;</li>
        <li>
          <span className="w-full">
            enabling termination location suggestions by clicking on
          </span>
          <div className="inline mx-2">
            <BiHide className="w-5 h-5 inline text-green-300" />
          </div>
          <span className="w-full">
            button on top of the model, then double clicking on suggestions
            shown;
          </span>
        </li>
        <li>
          using the input fields in the terminations section in the right
          sidebar
        </li>
        <li>
          using controls shown directly on the selected port (discouraged).
        </li>
      </div>
    </div>
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

const PhysicsLeftPanel: FC<{
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}> = ({ selectedTabLeftPanel, setSelectedTabLeftPanel }) => {
  return (
    <MyPanel
      tabs={['Terminations']}
      selectedTab={selectedTabLeftPanel}
      setSelectedTab={setSelectedTabLeftPanel}
      className="absolute left-[2%] top-[180px] md:w-1/4 xl:w-1/6"
    >
      <PhysicsLeftPanelTab />
    </MyPanel>
  );
};

const PhysicsRightPanel: FC<{
  selectedTabRightPanel: string;
  setSelectedTabRightPanel: Function;
  savedPhysicsParameters: boolean;
  setSavedPhysicsParameters: Function;
}> = ({
  selectedTabRightPanel,
  setSelectedTabRightPanel,
  savedPhysicsParameters,
  setSavedPhysicsParameters,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);
  return (
    <MyPanel
      tabs={[physicsRightPanelTitle.first, physicsRightPanelTitle.second]}
      selectedTab={selectedTabRightPanel}
      setSelectedTab={setSelectedTabRightPanel}
      className="absolute right-[2%] top-[180px] w-1/4 max-h-[500px]"
    >
      {selectedTabRightPanel === physicsRightPanelTitle.first ? (
        <>
          {selectedPort?.category === 'lumped' ? (
            <PortManagement selectedPort={selectedPort}>
              <PortType
                disabled={selectedProject?.simulation?.status === 'Completed'}
                setShow={setShowModalSelectPortType}
                selectedPort={selectedPort as TempLumped}
              />
              <RLCParamsComponent
                selectedPort={selectedPort as TempLumped}
                disabled={selectedProject?.simulation?.status === 'Completed'}
                setSavedPortParameters={setSavedPhysicsParameters}
              />
              <PortPosition
                selectedPort={selectedPort as Port | TempLumped}
                disabled={selectedProject?.simulation?.status === 'Completed'}
                setSavedPortParameters={setSavedPhysicsParameters}
              />
              {selectedProject?.simulation?.status !== 'Completed' && (
                <ModalSelectPortType
                  show={showModalSelectPortType}
                  setShow={setShowModalSelectPortType}
                  selectedPort={selectedPort as TempLumped}
                  setSavedPortParameters={setSavedPhysicsParameters}
                />
              )}
            </PortManagement>
          ) : (
            <PortManagement selectedPort={selectedPort}>
              <ScatteringParameter
                setSavedPortParameters={setSavedPhysicsParameters}
              />
              <PortPosition
                selectedPort={selectedPort as Port | TempLumped}
                disabled={selectedProject?.simulation?.status === 'Completed'}
                setSavedPortParameters={setSavedPhysicsParameters}
              />
            </PortManagement>
          )}
        </>
      ) : (
        <div className="flex-col px-[20px] pb-[5px] overflow-x-hidden">
          <FrequenciesDef
            disabled={selectedProject?.simulation?.status === 'Completed'}
            setSavedPhysicsParameters={setSavedPhysicsParameters}
          />
          {/* <InputSignal
            disabled={selectedProject?.simulation?.status === 'Completed'}
            selectedProject={selectedProject as Project}
          /> */}
        </div>
      )}
      <div className={`flex px-[20px] mt-2 flex-row gap-2 items-center`}>
        <button
          data-testid="savePhysics"
          type="button"
          className="button buttonPrimary w-full hover:opacity-80 disabled:opacity-60"
          onClick={() => setSavedPhysicsParameters(true)}
          disabled={savedPhysicsParameters}
        >
          SAVE ON DB
        </button>
        <div
          className="tooltip tooltip-left"
          data-tip="Saving parameters on server now is not necessary in order to launch a simulation. Use this button if you are not intended to launch a simulation now."
        >
          <IoMdInformationCircleOutline size={20} />
        </div>
      </div>
    </MyPanel>
  );
};

const PhysicsRightSidebar: FC<{
  selectedTabRightPanel: string | undefined;
  setSelectedTabRightPanel: Function;
  savedPhysicsParameters: boolean;
  setSavedPhysicsParameters: Function;
}> = ({
  selectedTabRightPanel,
  setSelectedTabRightPanel,
  savedPhysicsParameters,
  setSavedPhysicsParameters,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);
  return (
    <>
      <div className="absolute right-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0 bg-white">
        <div
          className={`p-2 tooltip rounded-t tooltip-left ${selectedTabRightPanel === physicsRightPanelTitle.first ? 'text-white bg-primaryColor' : 'text-primaryColor bg-white'}`}
          data-tip="Terminations"
          onClick={() => {
            if (selectedTabRightPanel === physicsRightPanelTitle.first) {
              setSelectedTabRightPanel(undefined);
            } else {
              setSelectedTabRightPanel(physicsRightPanelTitle.first);
            }
          }}
        >
          <GiAtom
            style={{ width: '25px', height: '25px' }}

          />
        </div>
        <div
          className={`p-2 tooltip rounded-b tooltip-left ${selectedTabRightPanel === physicsRightPanelTitle.second ? 'text-white bg-primaryColor' : 'text-primaryColor bg-white'}`}
          data-tip="Frequencies"
          onClick={() => {
            if (selectedTabRightPanel === physicsRightPanelTitle.second) {
              setSelectedTabRightPanel(undefined);
            } else {
              setSelectedTabRightPanel(physicsRightPanelTitle.second);
            }
          }}
        >
          <SiAzurefunctions
            style={{ width: '25px', height: '25px' }}
          />
        </div>
      </div>
      {selectedTabRightPanel && (
        <div className="bg-white p-3 absolute right-[5%] top-[180px] rounded">
          {selectedTabRightPanel === physicsRightPanelTitle.first ? (
            <>
              {selectedPort?.category === 'lumped' ? (
                <PortManagement selectedPort={selectedPort}>
                  <PortType
                    disabled={
                      selectedProject?.simulation?.status === 'Completed'
                    }
                    setShow={setShowModalSelectPortType}
                    selectedPort={selectedPort as TempLumped}
                  />
                  <RLCParamsComponent
                    selectedPort={selectedPort as TempLumped}
                    disabled={
                      selectedProject?.simulation?.status === 'Completed'
                    }
                    setSavedPortParameters={setSavedPhysicsParameters}
                  />
                  <PortPosition
                    selectedPort={selectedPort as Port | TempLumped}
                    disabled={
                      selectedProject?.simulation?.status === 'Completed'
                    }
                    setSavedPortParameters={setSavedPhysicsParameters}
                  />
                  {selectedProject?.simulation?.status !== 'Completed' && (
                    <ModalSelectPortType
                      show={showModalSelectPortType}
                      setShow={setShowModalSelectPortType}
                      selectedPort={selectedPort as TempLumped}
                      setSavedPortParameters={setSavedPhysicsParameters}
                    />
                  )}
                </PortManagement>
              ) : (
                <PortManagement selectedPort={selectedPort}>
                  <ScatteringParameter
                    setSavedPortParameters={setSavedPhysicsParameters}
                  />
                  <PortPosition
                    selectedPort={selectedPort as Port | TempLumped}
                    disabled={
                      selectedProject?.simulation?.status === 'Completed'
                    }
                    setSavedPortParameters={setSavedPhysicsParameters}
                  />
                </PortManagement>
              )}
            </>
          ) : (
            <div className="flex-col px-[20px] pb-[5px] overflow-x-hidden max-w-[350px]">
              <span className="font-bold">Frequencies Definition</span>
              <FrequenciesDef
                disabled={selectedProject?.simulation?.status === 'Completed'}
                setSavedPhysicsParameters={setSavedPhysicsParameters}
              />
              {/* <InputSignal
                  disabled={selectedProject?.simulation?.status === 'Completed'}
                  selectedProject={selectedProject as Project}
                /> */}
            </div>
          )}
          {(selectedTabRightPanel === physicsRightPanelTitle.second ||
            (selectedTabRightPanel === physicsRightPanelTitle.first &&
              selectedPort)) && (
            <div className={`flex px-[20px] mt-2 flex-row gap-2 items-center`}>
              <button
                data-testid="savePhysics"
                type="button"
                className="button buttonPrimary text-sm w-full hover:opacity-80 disabled:opacity-60"
                onClick={() => setSavedPhysicsParameters(true)}
                disabled={savedPhysicsParameters}
              >
                SAVE ON DB
              </button>
              <div
                className="tooltip tooltip-left"
                data-tip="Saving parameters on server now is not necessary in order to launch a simulation. Use this button if you are not intended to launch a simulation now."
              >
                <IoMdInformationCircleOutline size={15} />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
