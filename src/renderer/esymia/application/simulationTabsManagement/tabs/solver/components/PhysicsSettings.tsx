import { FC, useState } from 'react';
import { GiAtom, GiRadialBalance } from 'react-icons/gi';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { RiListIndefinite } from 'react-icons/ri';
import { SiAzurefunctions } from 'react-icons/si';
import { TbWavesElectricity } from 'react-icons/tb';
import { useSelector } from 'react-redux';
import { Port, TempLumped } from '../../../../../model/esymiaModels';
import {
  selectedProjectSelector,
  findSelectedPort,
} from '../../../../../store/projectSlice';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import { physicsRightPanelTitle } from '../../../../config/panelTitles';
import FrequenciesDef from '../../physics/frequenciesDef/FrequenciesDef';
import { PhysicsLeftPanelTab } from '../../physics/PhysicsLeftPanelTab';
import { PlaneWaveSettingsModal } from '../../physics/planeWave/PlaneWaveSettingsModal';
import { RadialFieldSettingsModal } from '../../physics/planeWave/RadialFieldSettingsModal';
import { PortPosition } from '../../physics/portManagement/components/PortPosition';
import { PortType } from '../../physics/portManagement/components/PortType';
import { RLCParamsComponent } from '../../physics/portManagement/components/RLCParamsComponent';
import ScatteringParameter from '../../physics/portManagement/components/ScatteringParameter';
import { ModalSelectPortType } from '../../physics/portManagement/ModalSelectPortType';
import { PortManagement } from '../../physics/portManagement/PortManagement';

export const PhysicsSettings: FC<{
  selectedTabRightPanel: string | undefined;
  setSelectedTabRightPanel: Function;
  savedPhysicsParameters: boolean;
  setSavedPhysicsParameters: Function;
  selectedTabLeftPanel: string | undefined;
  setSelectedTabLeftPanel: Function;
  setsidebarItemSelected: Function;
  simulationType: "Matrix" | "Electric Fields" | "Both"
}> = ({
  selectedTabRightPanel,
  setSelectedTabRightPanel,
  savedPhysicsParameters,
  setSavedPhysicsParameters,
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
  setsidebarItemSelected,
  simulationType
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);
  const theme = useSelector(ThemeSelector);
  const [planeWaweModalOpen, setplaneWaweModalOpen] = useState(false);
  const [radialFieldModalOpen, setradialFieldModalOpen] = useState(false);
  return (
    <>
      {/* <PhysicsLeftPanelTab /> */}
      <div
        className={`absolute left-[2%] top-[272px] rounded max-h-[500px] flex flex-col items-center gap-0`}
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
            setsidebarItemSelected(undefined);
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
            setsidebarItemSelected(undefined);
          }}
        >
          <GiAtom style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      <div
        className={`absolute left-[2%] top-[360px] rounded max-h-[500px] flex flex-col items-center gap-0`}
      >
        <button
          className={`p-2 tooltip rounded-t ${simulationType === "Matrix" ? 'opacity-50 hover:cursor-not-allowed' : 'opacity-100 hover:cursor-pointer hover:opacity-80'} tooltip-right ${
            theme === 'light'
              ? 'text-primaryColor bg-white'
              : 'text-textColorDark bg-bgColorDark2'
          }`}
          disabled={simulationType === "Matrix"}
          data-tip="Plane Wave"
          onClick={() => setplaneWaweModalOpen(true)}
        >
          <TbWavesElectricity style={{ width: '25px', height: '25px' }} />
        </button>
        <button
          className={`p-2 tooltip rounded-b ${simulationType === "Matrix" ? 'opacity-50 hover:cursor-not-allowed' : 'opacity-100 hover:cursor-pointer hover:opacity-80'} tooltip-right ${
            theme === 'light'
              ? 'text-primaryColor bg-white'
              : 'text-textColorDark bg-bgColorDark2'
          }`}
          disabled={simulationType === "Matrix"}
          data-tip="Radiation Diagram"
          onClick={() => setradialFieldModalOpen(true)}
        >
          <GiRadialBalance style={{ width: '25px', height: '25px' }} />
        </button>
      </div>
      {planeWaweModalOpen && (
        <PlaneWaveSettingsModal setModalOpen={setplaneWaweModalOpen} />
      )}
      {radialFieldModalOpen && (
        <RadialFieldSettingsModal setModalOpen={setradialFieldModalOpen} />
      )}
      {(selectedTabRightPanel || selectedTabLeftPanel) && selectedTabRightPanel !== physicsRightPanelTitle.second && (
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
          {selectedTabRightPanel === physicsRightPanelTitle.first &&
            selectedPort && (
              <div
                className={`flex px-[20px] mt-2 flex-row gap-2 items-center`}
              >
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
