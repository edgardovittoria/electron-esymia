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

      <div className="absolute left-[2%] top-[225px] flex flex-col items-center gap-0">
        <div
          className={`p-3 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer ${selectedTabRightPanel === physicsRightPanelTitle.second
            ? (theme === 'light' ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-blue-600 text-white shadow-blue-600/30')
            : (theme === 'light' ? 'bg-white/80 text-blue-600 hover:bg-white hover:text-blue-500' : 'bg-black/40 text-blue-400 hover:bg-black/60 hover:text-blue-300 border border-white/10')
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
          <SiAzurefunctions size={24} />
        </div>
      </div>
      {selectedTabRightPanel === physicsRightPanelTitle.second && (
        <div
          className={`absolute left-[6%] xl:left-[5%] top-0 w-[350px] rounded-2xl p-4 shadow-2xl backdrop-blur-md border transition-all duration-300 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar ${theme === 'light'
            ? 'bg-white/90 border-white/40 text-gray-800'
            : 'bg-black/60 border-white/10 text-gray-200'
            }`}
        >
          <div className="flex flex-col gap-4">
            <span className="font-bold text-lg border-b pb-2 border-gray-200/50 dark:border-white/10">
              Frequencies Definition
            </span>
            <FrequenciesDef
              disabled={selectedProject?.simulation?.status === 'Completed'}
              setSavedPhysicsParameters={setSavedPhysicsParameters}
            />
          </div>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200/50 dark:border-white/10">
            <div className="flex items-center gap-2">
              <button
                data-testid="savePhysics"
                type="button"
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${theme === 'light'
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={() => setSavedPhysicsParameters(true)}
                disabled={savedPhysicsParameters}
              >
                SAVE ON DB
              </button>
              <div
                className="tooltip tooltip-left"
                data-tip="Saving parameters on server now is not necessary in order to launch a simulation. Use this button if you are not intended to launch a simulation now."
              >
                <IoMdInformationCircleOutline size={20} className="opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
