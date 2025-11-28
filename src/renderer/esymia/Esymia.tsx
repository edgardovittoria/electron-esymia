import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectMenuItem,
  showCreateNewProjectModalSelector,
  tabSelectedSelector,
  ThemeSelector,
} from './store/tabsAndMenuItemsSlice';
import {
  ActivePluginsSelector,
} from './store/pluginsSlice';
import { TabsContainer } from './application/TabsContainer';
import { ImSpinner } from 'react-icons/im';
import { CreateNewProjectModal } from './application/sharedModals/CreateNewProjectModal';
import { MenuBar } from './application/MenuBar';
import { DashboardTabsContentFactory } from './application/dashboardTabsManagement/DashboardTabsContentFactory';
import { SimulationTabsContentFactory } from './application/simulationTabsManagement/SimulationTabsContentFactory';
import { usersStateSelector } from '../cad_library';
import { useStorage } from './hook/useStorage';

export interface EsymiaProps {
  selectedTab: string;
}

const Esymia: React.FC<EsymiaProps> = ({ selectedTab }) => {
  const dispatch = useDispatch();
  // SELECTORS
  const user = useSelector(usersStateSelector);
  const tabSelected = useSelector(tabSelectedSelector);
  const { loadFolders } = useStorage();
  const [loginSpinner, setLoginSpinner] = useState(false);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  const activePlugins = useSelector(ActivePluginsSelector);
  const [pluginsVisible, setPluginsVisible] = useState<boolean>(true);
  useEffect(() => {
    if (activePlugins.length > 0) {
      setPluginsVisible(true);
    }
  }, [activePlugins.length]);

  const showCreateNewProjectModal = useSelector(
    showCreateNewProjectModalSelector,
  );

  // USE EFFECT
  useEffect(() => {
    if (user.userName) {
      setLoginSpinner(true);
      loadFolders(setLoginSpinner);
    }
  }, [user.userName]);

  // MEMOIZED COMPONENTS
  const memoizedTabsContainer = useMemo(
    () => (
      <TabsContainer
        user={user}
        setPluginModalVisible={setPluginsVisible}
        pluginModalVisible={pluginsVisible}
      />
    ),
    [user, pluginsVisible],
  );

  return (
    <>
      {selectedTab === 'esymia' && (
        <div className="h-full flex flex-col animate-fade-in-up overflow-hidden">
          {loginSpinner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <ImSpinner className={`animate-spin w-12 h-12 ${isDark ? 'text-white' : 'text-black'}`} />
            </div>
          )}

          {showCreateNewProjectModal && <CreateNewProjectModal />}

          <div className={`flex-1 flex flex-col h-full ${loginSpinner ? 'opacity-40 pointer-events-none' : ''}`}>

            {/* Header Area with Tabs and Menu */}
            <div className="flex flex-col w-full">
              {memoizedTabsContainer}
              {tabSelected !== "DASHBOARD" && <MenuBar />}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto relative">
              {tabSelected === 'DASHBOARD' ? (
                <DashboardTabsContentFactory
                  setLoadingSpinner={setLoginSpinner}
                />
              ) : (
                <SimulationTabsContentFactory />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Esymia;
