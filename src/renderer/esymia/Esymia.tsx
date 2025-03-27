import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  showCreateNewProjectModalSelector,
  showInfoModalSelector,
  tabSelectedSelector,
} from './store/tabsAndMenuItemsSlice';
import {
  ActivePluginsSelector,
} from './store/pluginsSlice';
import { TabsContainer } from './application/TabsContainer';
import { ImSpinner } from 'react-icons/im';
import InfoModal from './application/sharedModals/InfoModal';
import { CreateNewProjectModal } from './application/sharedModals/CreateNewProjectModal';
import { MenuBar } from './application/MenuBar';
import { DashboardTabsContentFactory } from './application/dashboardTabsManagement/DashboardTabsContentFactory';
import { SimulationTabsContentFactory } from './application/simulationTabsManagement/SimulationTabsContentFactory';
import Plugins from './plugin/Plugins';
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
  // da scommentare nel caso esymia dovesse essere estrapolata
  /* const [alert, setAlert] = useState<boolean>(false);
  const activeSimulations = useSelector(activeSimulationsSelector);
  const [feedbackSimulationVisible, setFeedbackSimulationVisible] =
    useState<boolean>(false);
  useEffect(() => {
    if (activeSimulations.length > 0) {
      setFeedbackSimulationVisible(true);
    }
  }, [activeSimulations.length]);

  const activeMeshing = useSelector(activeMeshingSelector);
  const [feedbackMeshingVisible, setFeedbackMeshingVisible] =
    useState<boolean>(false);
  useEffect(() => {
    if (activeMeshing.length > 0) {
      setFeedbackMeshingVisible(true);
    }
  }, [activeMeshing.length]); */

  const activePlugins = useSelector(ActivePluginsSelector);
  const [pluginsVisible, setPluginsVisible] = useState<boolean>(true);
  useEffect(() => {
    if (activePlugins.length > 0) {
      setPluginsVisible(true);
    }
  }, [activePlugins.length]);

  const showInfoModal = useSelector(showInfoModalSelector);
  const showCreateNewProjectModal = useSelector(
    showCreateNewProjectModalSelector,
  );
  // const mesherStatus = useSelector(MesherStatusSelector);
  // const solverStatus = useSelector(SolverStatusSelector);

  // useEffect(() => {
  //   if (user.userName) {
  //     dispatch(addActivePlugin('serverGUI'));
  //     if (mesherStatus === 'idle') {
  //       dispatch(setMesherStatus('starting'));
  //       window.electron.ipcRenderer.sendMessage('runMesher', []);
  //     }
  //     if (solverStatus === 'idle') {
  //       dispatch(setSolverStatus('starting'));
  //       window.electron.ipcRenderer.sendMessage('runSolver', []);
  //     }
  //   }
  // }, [user.userName]);


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
        <div className="lg:h-[97vh] h-screen overflow-x-hidden">
          {loginSpinner && (
            <ImSpinner className="animate-spin w-12 h-12 absolute left-1/2 top-1/2" />
          )}
          {showInfoModal && <InfoModal />}
          {showCreateNewProjectModal && <CreateNewProjectModal />}
          <div className={`${loginSpinner && 'opacity-40'}`}>
            {memoizedTabsContainer}
            <MenuBar />

            {tabSelected === 'DASHBOARD' ? (
              <DashboardTabsContentFactory
                setLoadingSpinner={setLoginSpinner}
              />
            ) : (
              <SimulationTabsContentFactory />
            )}
            {/* {activeSimulations &&
              activeSimulations.length > 0 &&
              !feedbackSimulationVisible && (
                <button
                  className="absolute bottom-24 right-0 rounded-tl-full rounded-bl-full p-3 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor text-sm"
                  onClick={() => setFeedbackSimulationVisible(true)}
                >
                  SIM
                </button>
              )}
            {activeSimulations && activeSimulations.length > 0 && (
              <SimulationStatus
                feedbackSimulationVisible={feedbackSimulationVisible}
                setFeedbackSimulationVisible={setFeedbackSimulationVisible}
                activeSimulations={activeSimulations}
              />
            )}
            {activeMeshing &&
              activeMeshing.length > 0 &&
              !feedbackMeshingVisible && (
                <button
                  className="absolute bottom-24 right-0 rounded-tl-full rounded-bl-full p-3 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor text-sm"
                  onClick={() => setFeedbackMeshingVisible(true)}
                >
                  MES
                </button>
              )}
            {activeMeshing && activeMeshing.length > 0 && (
              <MeshingStatus
                feedbackMeshingVisible={feedbackMeshingVisible}
                setFeedbackMeshingVisible={setFeedbackMeshingVisible}
                activeMeshing={activeMeshing}
                setAlert={setAlert}
              />
            )} */}
            {/* {activePlugins && activePlugins.length > 0 && !pluginsVisible && (
              <button
                className="absolute bottom-40 right-0 rounded-tl-full rounded-bl-full p-3 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor"
                onClick={() => setPluginsVisible(true)}
              >
                <BsPlugin size={22} />
              </button>
            )} */}
            {activePlugins && activePlugins.length > 0 && (
              <Plugins
                pluginsVisible={pluginsVisible}
                setPluginsVisible={setPluginsVisible}
                activePlugins={activePlugins}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Esymia;
