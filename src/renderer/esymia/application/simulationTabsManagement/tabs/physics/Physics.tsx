import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as THREE from 'three';
import { BiHide, BiShow } from 'react-icons/bi';
import {
  addPorts,
  boundingBoxDimensionSelector,
  findSelectedPort,
  SelectedFolderSelector,
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
import {
  Folder,
  Port,
  Probe,
  Project,
  TempLumped,
} from '../../../../model/esymiaModels';
import {
  ExportPhisicsToCSV,
} from './ImportExportPhysicsSetup';
import StatusBar from '../../sharedElements/StatusBar';
import { Vector3 } from 'three';
import { CanvasPhysics } from './CanvasPhysics';
import { ResetFocusButton } from '../../sharedElements/ResetFocusButton';
import { physicsRightPanelTitle } from '../../../config/panelTitles';
import ScatteringParameter from './portManagement/components/ScatteringParameter';
import FrequenciesDef from './frequenciesDef/FrequenciesDef';
import { useEffectNotOnMount } from '../../../../hook/useEffectNotOnMount';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { calculateModelBoundingBox } from '../../sharedElements/utilityFunctions';
import { SiAzurefunctions } from 'react-icons/si';
import { GiAtom, GiRadialBalance } from 'react-icons/gi';
import { GrClone, GrStatusInfo } from 'react-icons/gr';
import { RiListIndefinite } from 'react-icons/ri';
import { ImSpinner } from 'react-icons/im';
import { useStorageData } from '../mesher/components/rightPanelSimulator/hook/useStorageData';
import {
  FrequenciesImportFromCSV,
  LumpedImportFromCSV,
  PortImportFromCSV,
} from './ImportPhysicsFromCSV';
import { s3 } from '../../../../aws/s3Config';
import { Dispatch } from '@reduxjs/toolkit';
import { savePortsOnS3 } from './savePortsOnS3';
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { TbWavesElectricity } from 'react-icons/tb';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../dynamoDB/projectsFolderApi';

interface PhysicsProps {
  selectedTabLeftPanel: string | undefined;
  setSelectedTabLeftPanel: Function;
}

export const setPortsFromS3 = (project: Project, dispatch: Dispatch) => {
  const params = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
    Key: project.portsS3 as string,
  };
  s3.getObject(params, (err, data) => {
    if (err) {
      console.log(err);
    }
    const ports: (Port | TempLumped)[] = JSON.parse(data.Body?.toString() as string);
    ports.forEach((p) => {
      dispatch(addPorts(p));
    });
  });
};

export const Physics: React.FC<PhysicsProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  useEffect(() => {
    if (selectedProject?.portsS3 && selectedProject.ports.length === 0) {
      setPortsFromS3(selectedProject, dispatch);
    }
  }, []);
  const { cloneProject } = useStorageData();
  const [cloning, setcloning] = useState<boolean>(false);
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedFolder = useSelector(SelectedFolderSelector);
  const theme = useSelector(ThemeSelector);
  const { execQuery2 } = useDynamoDBQuery();
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
      if (selectedProject.ports.length > 0) {
        savePortsOnS3(
          selectedProject.ports,
          selectedProject,
          dispatch,
          execQuery2,
        );
      } else {
        execQuery2(
          createOrUpdateProjectInDynamoDB,
          selectedProject,
          dispatch,
        ).then(() => {});
      }
    }
  }, [savedPhysicsParameters]);

  const boundingBoxDimension = useSelector(boundingBoxDimensionSelector);

  useEffect(() => {
    if (!boundingBoxDimension) {
      const boundingbox = calculateModelBoundingBox(selectedProject as Project);
      dispatch(setBoundingBoxDimension(boundingbox.getSize(boundingbox.max).x));
    }
  }, []);

  useEffect(() => {
    setSelectedTabLeftPanel(undefined);
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
      <div className="absolute lg:left-[32%] left-[28%] gap-2 top-[180px] flex flex-col items-center">
        <div className="gap-2 flex flex-row">
          {selectedProject?.model.components && (
            <>
              <CreatePorts
                selectedProject={selectedProject}
                cameraPosition={cameraPosition}
              />
              <SurfaceAdvicesButton
                surfaceAdvices={surfaceAdvices}
                setSurfaceAdvices={setSurfaceAdvices}
              />
              <ResetFocusButton toggleResetFocus={toggleResetFocus} />
              <div className="">
                <div
                  className={`tooltip rounded tooltip-right ${
                    theme === 'light'
                      ? 'bg-white text-blue-500'
                      : 'bg-bgColorDark2 text-blue-300'
                  } p-2`}
                  data-tip="Port Positioning Info"
                  onClick={() => setShowAdvices(!showAdvices)}
                >
                  <GrStatusInfo size={18} />
                </div>
                {showAdvices && <PositioningPortsInfo />}
              </div>
            </>
          )}
        </div>
        <div className="gap-2 flex flex-row">
          {selectedProject?.model.components && (
            <>
              <ExportPhisicsToCSV />
              <PortImportFromCSV />
              <LumpedImportFromCSV />
              <FrequenciesImportFromCSV />
            </>
          )}
        </div>
      </div>
      {/* <PhysicsLeftPanel
        selectedTabLeftPanel={selectedTabLeftPanel}
        setSelectedTabLeftPanel={setSelectedTabLeftPanel}
      /> */}

      {/* <PhysicsRightPanel
        selectedTabRightPanel={selectedTabRightPanel}
        setSelectedTabRightPanel={setSelectedTabRightPanel}
        savedPhysicsParameters={savedPhysicsParameters}
        setSavedPhysicsParameters={setSavedPhysicsParameters}
      /> */}
      <PhysicsSettingsOld
        selectedTabRightPanel={selectedTabRightPanel}
        setSelectedTabRightPanel={setSelectedTabRightPanel}
        savedPhysicsParameters={savedPhysicsParameters}
        setSavedPhysicsParameters={setSavedPhysicsParameters}
        selectedTabLeftPanel={selectedTabLeftPanel}
        setSelectedTabLeftPanel={setSelectedTabLeftPanel}
      />
      <div
        className={`absolute left-[2%] top-[420px] rounded max-h-[500px] flex flex-col items-center gap-0 ${
          theme === 'light'
            ? 'bg-white text-textColor'
            : 'bg-bgColorDark2 text-textColorDark'
        }`}
      >
        <button
          disabled={
            selectedProject &&
            selectedProject.simulation &&
            selectedProject.simulation.status === 'Running'
          }
          className={`p-2 tooltip rounded-t tooltip-right relative z-10 disabled:opacity-40`}
          data-tip="Clone Project"
          onClick={() => {
            setcloning(true);
            cloneProject(
              selectedProject as Project,
              selectedFolder as Folder,
              setcloning,
            );
          }}
        >
          <GrClone
            style={{ width: '25px', height: '25px' }}
            className={`${cloning ? 'opacity-20' : 'opacity-100'}`}
          />
          {cloning && (
            <ImSpinner className="absolute z-50 top-3 bottom-1/2 animate-spin w-5 h-5" />
          )}
        </button>
      </div>
      <StatusBar />
    </>
  );
};

const PositioningPortsInfo: FC = () => {
  const theme = useSelector(ThemeSelector);
  return (
    <div
      className={`fixed bottom-20 right-5 flex flex-col ${
        theme === 'light'
          ? 'bg-white text-textColor'
          : 'bg-bgColorDark2 text-textColorDark'
      } shadow-2xl text-sm text-start p-[10px] max-w-[300px] max-h-[300px] overflow-y-scroll`}
    >
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
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  return (
    <div
      className="tooltip"
      data-tip={
        surfaceAdvices ? 'Hide Surface Advices' : 'Show Surface Advices'
      }
    >
      <button
        className={`${
          theme === 'light'
            ? 'bg-white text-textColor'
            : 'bg-bgColorDark2 text-textColorDark'
        } rounded p-2 disabled:opacity-40`}
        onClick={() => setSurfaceAdvices(!surfaceAdvices)}
        disabled={
          selectedProject && selectedProject?.simulation?.resultS3
            ? true
            : false
        }
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
      tabs={['Mesher']}
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
  const theme = useSelector(ThemeSelector);
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
          className={`button buttonPrimary ${
            theme === 'light' ? '' : 'bg-secondaryColorDark'
          } w-full hover:opacity-80 disabled:opacity-60`}
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

export const PhysicsSettingsOld: FC<{
  selectedTabRightPanel: string | undefined;
  setSelectedTabRightPanel: Function;
  savedPhysicsParameters: boolean;
  setSavedPhysicsParameters: Function;
  selectedTabLeftPanel: string | undefined;
  setSelectedTabLeftPanel: Function;
}> = ({
  selectedTabRightPanel,
  setSelectedTabRightPanel,
  savedPhysicsParameters,
  setSavedPhysicsParameters,
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);
  const theme = useSelector(ThemeSelector);
  const [planeWaweModalOpen, setplaneWaweModalOpen] = useState(false)
  const [radialFieldModalOpen, setradialFieldModalOpen] = useState(false)
  return (
    <>
      {/* <PhysicsLeftPanelTab /> */}
      <div
        className={`absolute left-[2%] top-[210px] rounded max-h-[500px] flex flex-col items-center gap-0`}
      >
        <div
          className={`p-2 tooltip rounded-t tooltip-right ${
            selectedTabLeftPanel === 'Termination List'
              ? `${
                  theme === 'light'
                    ? 'text-white bg-primaryColor'
                    : 'text-textColor bg-secondaryColorDark'
                }`
              : `${
                  theme === 'light'
                    ? 'text-primaryColor bg-white'
                    : 'text-textColorDark bg-bgColorDark2'
                }`
          }`}
          data-tip="Terminations List"
          onClick={() => {
            if (selectedTabLeftPanel === 'Termination List') {
              setSelectedTabLeftPanel(undefined);
            } else {
              setSelectedTabLeftPanel('Termination List');
            }
            setSelectedTabRightPanel(undefined);
          }}
        >
          <RiListIndefinite style={{ width: '25px', height: '25px' }} />
        </div>
        <div
          className={`p-2 tooltip tooltip-right ${
            selectedTabRightPanel === physicsRightPanelTitle.first
              ? `${
                  theme === 'light'
                    ? 'text-white bg-primaryColor'
                    : 'text-textColor bg-secondaryColorDark'
                }`
              : `${
                  theme === 'light'
                    ? 'text-primaryColor bg-white'
                    : 'text-textColorDark bg-bgColorDark2'
                }`
          }`}
          data-testid="terminationSettings"
          data-tip="Terminations Settings"
          onClick={() => {
            if (selectedTabRightPanel === physicsRightPanelTitle.first) {
              setSelectedTabRightPanel(undefined);
            } else {
              setSelectedTabRightPanel(physicsRightPanelTitle.first);
            }
            setSelectedTabLeftPanel(undefined);
          }}
        >
          <GiAtom style={{ width: '25px', height: '25px' }} />
        </div>
        <div
          className={`p-2 tooltip rounded-b tooltip-right ${
            selectedTabRightPanel === physicsRightPanelTitle.second
              ? `${
                  theme === 'light'
                    ? 'text-white bg-primaryColor'
                    : 'text-textColor bg-secondaryColorDark'
                }`
              : `${
                  theme === 'light'
                    ? 'text-primaryColor bg-white'
                    : 'text-textColorDark bg-bgColorDark2'
                }`
          }`}
          data-testid="frequenciesSettings"
          data-tip="Frequencies"
          onClick={() => {
            if (selectedTabRightPanel === physicsRightPanelTitle.second) {
              setSelectedTabRightPanel(undefined);
            } else {
              setSelectedTabRightPanel(physicsRightPanelTitle.second);
            }
            setSelectedTabLeftPanel(undefined);
          }}
        >
          <SiAzurefunctions style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      <div
        className={`absolute left-[2%] top-[320px] rounded max-h-[500px] flex flex-col items-center gap-0`}
      >
        <div
          className={`p-2 tooltip rounded-t hover:cursor-pointer hover:opacity-80 tooltip-right ${
            theme === 'light'
              ? 'text-primaryColor bg-white'
              : 'text-textColorDark bg-bgColorDark2'
          }`}
          data-tip="Plane Wave"
          onClick={() => setplaneWaweModalOpen(true)}
        >
          <TbWavesElectricity style={{ width: '25px', height: '25px' }} />
        </div>
        <div
          className={`p-2 tooltip rounded-b hover:cursor-pointer hover:opacity-80 tooltip-right ${
            theme === 'light'
              ? 'text-primaryColor bg-white'
              : 'text-textColorDark bg-bgColorDark2'
          }`}
          data-tip="Radiation Diagram"
          onClick={() => setradialFieldModalOpen(true)}
        >
          <GiRadialBalance style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      {/* {planeWaweModalOpen && <PlaneWaveSettingsModal setModalOpen={setplaneWaweModalOpen}/>}
      {radialFieldModalOpen && <RadialFieldSettingsModal setModalOpen={setradialFieldModalOpen}/>} */}
      {(selectedTabRightPanel || selectedTabLeftPanel) && (
        <div
          className={`${
            theme === 'light'
              ? 'bg-white text-textColor'
              : 'bg-bgColorDark2 text-textColorDark'
          } p-3 absolute xl:left-[5%] left-[6%] top-[180px] rounded w-1/5`}
        >
          {selectedTabLeftPanel === 'Termination List' && (
            <PhysicsLeftPanelTab />
          )}
          {selectedTabRightPanel === physicsRightPanelTitle.first && (
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
          )}
          {selectedTabRightPanel === physicsRightPanelTitle.second && (
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
                className={`button buttonPrimary ${
                  theme === 'light' ? '' : 'bg-secondaryColorDark'
                } text-sm w-full hover:opacity-80 disabled:opacity-60`}
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
