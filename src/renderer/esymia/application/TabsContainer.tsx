import React, { } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { MdOutlineDashboard } from 'react-icons/md';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SelectedFolderSelector,
  selectProject,
} from '../store/projectSlice';
import {
  closeProjectTab,
  projectsTabsSelector,
  selectTab,
  setShowCreateNewProjectModal,
  tabSelectedSelector,
  ThemeSelector,
  unsetSolverResults,
} from '../store/tabsAndMenuItemsSlice';
import { VscServerProcess } from 'react-icons/vsc';
import { ActivePluginsSelector, addActivePlugin } from '../store/pluginsSlice';
import { SetUserInfo, UsersState } from '../../cad_library';
import Plugins from '../plugin/Plugins';
import logo from '../../../../assets/esimia_logo_noScritta.png';

interface TabsContainerProps {
  user: UsersState;
  setPluginModalVisible: (v: boolean) => void;
  pluginModalVisible: boolean;
}

export const TabsContainer: React.FC<TabsContainerProps> = ({
  user,
  setPluginModalVisible,
  pluginModalVisible,
}) => {
  const tabSelected = useSelector(tabSelectedSelector);
  const projectsTabs = useSelector(projectsTabsSelector);
  const dispatch = useDispatch();
  const selectedFolder = useSelector(SelectedFolderSelector);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';
  const projects = selectedFolder?.projectList;

  const { loginWithPopup, isAuthenticated, loginWithRedirect } = useAuth0();
  const activePlugins = useSelector(ActivePluginsSelector);

  return (
    <>
      <SetUserInfo />
      <div className="w-full px-8 pt-6 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center mr-2">
          <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-500 animate-gradient-shadow">
            <img src={logo} alt="Logo" className="w-12 h-12 rounded-full bg-white dark:bg-gray-900 p-2" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-2">
          {/* Dashboard Tab */}
          <div
            data-testid="dashboard"
            className={`group relative px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-300 border ${tabSelected === 'DASHBOARD'
              ? (isDark ? 'bg-blue-500/20 border-blue-500/50 text-blue-100 shadow-lg shadow-blue-500/10' : 'bg-blue-50 border-blue-200 text-blue-700 shadow-md')
              : (isDark ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700')
              }`}
            onClick={() => {
              dispatch(selectTab('DASHBOARD'));
              dispatch(selectProject(undefined));
              dispatch(unsetSolverResults());
            }}
          >
            <MdOutlineDashboard size={18} />
            <span className="font-medium text-sm">Dashboard</span>
          </div>

          {/* Project Tabs */}
          {projectsTabs.map((projectTab) => {
            const isSelected = tabSelected === projectTab.id;
            return (
              <div
                key={projectTab.id}
                className={`group relative px-4 py-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-300 min-w-[120px] justify-between border ${isSelected
                  ? (isDark ? 'bg-purple-500/20 border-purple-500/50 text-purple-100 shadow-lg shadow-purple-500/10' : 'bg-purple-50 border-purple-200 text-purple-700 shadow-md')
                  : (isDark ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700')
                  }`}
                onClick={() => {
                  dispatch(selectTab(projectTab.id as string));
                  dispatch(selectProject(projectTab.id));
                  dispatch(unsetSolverResults());
                }}
              >
                <span className="font-medium text-sm truncate max-w-[100px]">{projectTab.name}</span>

                <div
                  className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(closeProjectTab(projectTab.id as string));
                    dispatch(selectProject(undefined));
                    dispatch(unsetSolverResults());
                  }}
                >
                  <FaTimes size={10} />
                </div>
              </div>
            );
          })}

          {/* Add Tab Button */}
          <button
            onClick={() =>
              selectedFolder?.id !== 'shared_root' &&
              dispatch(setShowCreateNewProjectModal(true))
            }
            className={`p-2.5 rounded-xl transition-all duration-300 border ${isDark
              ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-300'
              : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300 hover:text-green-700'
              } disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-transparent`}
            disabled={projects && projects.length === 3}
            title="Create New Project"
          >
            <FaPlus size={14} />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-4 relative">
          {isAuthenticated ? (
            <>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${isDark
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:border-green-300 hover:shadow-md'
                  }`}
                onClick={() => {
                  if (
                    activePlugins.filter((p) => p === 'serverGUI').length === 0
                  ) {
                    dispatch(addActivePlugin('serverGUI'));
                    setPluginModalVisible(true);
                  }
                  setPluginModalVisible(!pluginModalVisible);
                }}
              >
                <VscServerProcess size={18} />
                <span>Mesher & Solver</span>
              </button>
              {activePlugins && activePlugins.length > 0 && (
                <Plugins
                  pluginsVisible={pluginModalVisible}
                  setPluginsVisible={setPluginModalVisible}
                  activePlugins={activePlugins}
                />
              )}
            </>
          ) : (
            <button
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
                }`}
              onClick={() =>
                process.env.NODE_ENV === 'development'
                  ? loginWithRedirect()
                  : loginWithPopup()
              }
            >
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
};
