import { SiAzurefunctions } from 'react-icons/si';
import { theme } from '../../../../../../../../tailwind.config';
import { physicsRightPanelTitle } from '../../../../config/panelTitles';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import FrequenciesDef from '../../physics/frequenciesDef/FrequenciesDef';
import { selectedProjectSelector } from '../../../../../store/projectSlice';
import { useEffect } from 'react';
import { IoMdInformationCircleOutline } from 'react-icons/io';

interface FrequenciesSettingsProps {
  selectedTabRightPanel: string | undefined;
  setSelectedTabRightPanel: Function;
  setSelectedTabLeftPanel: Function;
  setSavedPhysicsParameters: Function;
  setsidebarItemSelected: Function;
  savedPhysicsParameters: boolean;
}

export const FrequenciesSettings: React.FC<FrequenciesSettingsProps> = ({
  selectedTabRightPanel,
  setSelectedTabRightPanel,
  setSelectedTabLeftPanel,
  setSavedPhysicsParameters,
  setsidebarItemSelected,
  savedPhysicsParameters,
}) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  useEffect(() => {
    console.log(selectedTabRightPanel);
    console.log(physicsRightPanelTitle.second);
  }, [selectedTabRightPanel]);
  return (
    <>
      <div
        className={`absolute left-[2%] top-[225px] rounded max-h-fit flex flex-col items-center gap-0`}
      >
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
            setsidebarItemSelected(undefined);
          }}
        >
          <SiAzurefunctions style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      {selectedTabRightPanel === physicsRightPanelTitle.second && (
        <div
          className={`${
            theme === 'light'
              ? 'bg-white text-textColor'
              : 'bg-bgColorDark2 text-textColorDark'
          } p-3 absolute xl:left-[5%] left-[6%] top-[180px] rounded w-1/5 max-h-fit`}
        >
          <div className="flex-col px-[20px] pb-[5px] overflow-x-hidden max-w-[350px]">
            <span className="font-bold">Frequencies Definition</span>
            <FrequenciesDef
              disabled={selectedProject?.simulation?.status === 'Completed'}
              setSavedPhysicsParameters={setSavedPhysicsParameters}
            />
          </div>

          {selectedTabRightPanel === physicsRightPanelTitle.second && (
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
