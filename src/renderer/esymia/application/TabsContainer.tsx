import React, { useEffect, useState } from 'react';
import { FaPlus, FaTimes, FaUser } from 'react-icons/fa';
import { MdOutlineDashboard } from 'react-icons/md';
import { useAuth0 } from '@auth0/auth0-react';
import { HiOutlineLogout } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { SelectedFolderSelector, selectProject } from '../store/projectSlice';
import {
  closeProjectTab,
  projectsTabsSelector,
  selectTab, setShowCreateNewProjectModal,
  tabSelectedSelector,
  ThemeSelector
} from '../store/tabsAndMenuItemsSlice';
import { BsPlugin } from 'react-icons/bs';
import { VscServerProcess } from 'react-icons/vsc';
import { ActivePluginsSelector, addActivePlugin } from '../store/pluginsSlice';
import { SetUserInfo, UsersState } from '../../cad_library';

interface TabsContainerProps {
  user: UsersState;
  setPluginModalVisible: (v: boolean) => void
  pluginModalVisible: boolean
}

export const TabsContainer: React.FC<TabsContainerProps> = ({ user, setPluginModalVisible, pluginModalVisible }) => {
  const tabSelected = useSelector(tabSelectedSelector);
  const projectsTabs = useSelector(projectsTabsSelector);
  const dispatch = useDispatch();
  const selectedFolder = useSelector(SelectedFolderSelector)
  const theme = useSelector(ThemeSelector)

  const { loginWithPopup, isAuthenticated, loginWithRedirect } = useAuth0();
  const activePlugins = useSelector(ActivePluginsSelector)

  return (
    <>
      <SetUserInfo />
      <div className="grid grid-cols-12 px-8 pt-6 items-center">
        <span className={`xl:col-span-1 sm:col-span-2 col-span-3 ${theme === 'light' ? 'text-secondaryColor' : 'text-secondaryColorDark'} text-2xl font-semibold mr-4 ml-4 flex justify-center`}>
          ESimIA
        </span>
        <ul className="flex xl:col-span-9 sm:col-span-7 col-span-7 flex-row gap-1 pl-0 mb-0 overflow-auto w-full">
          <li
            data-testid="dashboard"
            className={
              tabSelected === 'DASHBOARD'
                ? `px-3 py-3 ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'} rounded-t flex justify-between items-center gap-2`
                : `${theme === 'light' ? 'bg-white text-textColor opacity-60' : 'bg-bgColorDark2 text-textColorDark opacity-60'} rounded-t flex items-center px-3 py-3 hover:cursor-pointer`
            }
            onClick={() => {
              dispatch(selectTab('DASHBOARD'));
              dispatch(selectProject(undefined));
            }}
          >
            <MdOutlineDashboard size={20} />
            {tabSelected === 'DASHBOARD' && (
              <span className="font-bold text-sm">Dashboard</span>
            )}
          </li>
          {projectsTabs.map((projectTab) => {
            return (
              <li
                key={projectTab.faunaDocumentId}
                className={`${theme === 'light' ? 'bg-white' : 'bg-bgColorDark2'} rounded-t`}
              >
                <div
                  className={
                    tabSelected === projectTab.faunaDocumentId
                      ? `px-3 py-3 ${theme === 'light' ? 'bg-white' : 'bg-bgColorDark2'} flex items-center rounded-t`
                      : `px-3 py-3 ${theme === 'light' ? 'bg-white opacity-60' : 'bg-bgColorDark2 opacity-60'} flex items-center`
                  }
                >
                  <div
                    className={
                      tabSelected === projectTab.faunaDocumentId
                        ? `${theme === 'light' ? 'text-textColor' : 'text-textColorDark'} font-bold text-sm`
                        : 'text-gray-400 hover:cursor-pointer text-sm'
                    }
                    aria-current="page"
                    onClick={() => {
                      dispatch(selectTab(projectTab.faunaDocumentId as string));
                      dispatch(selectProject(projectTab.faunaDocumentId));
                    }}
                  >
                    {projectTab.name}
                  </div>
                  <div
                    className="ml-8"
                    onClick={() => {
                      dispatch(
                        closeProjectTab(projectTab.faunaDocumentId as string),
                      );
                      dispatch(selectProject(undefined));
                    }}
                  >
                    <FaTimes className="w-[12px] h-[12px] text-gray-400" />
                  </div>
                </div>
              </li>
            );
          })}
          <li className="nav-item m-auto mx-4">
            <FaPlus
              onClick={() => (selectedFolder?.faunaDocumentId !== "shared_root") && dispatch(setShowCreateNewProjectModal(true))}
              className="w-[12px] h-[12px] text-gray-400"
            />
          </li>
        </ul>
        <div className="flex flex-row items-center justify-end xl:col-span-2 sm:col-span-3 col-span-4 ">
          {isAuthenticated ? (
            <>
              <div className={`px-3 py-1 mb-[-2px] ${theme === 'light' ? 'bg-white hover:bg-secondaryColor text-textColor' : 'bg-bgColorDark2 text-textColorDark'} rounded-t list-none mr-10 hover:text-white hover:cursor-pointer z-[1000]`}
                onClick={() => {
                  if(activePlugins.filter(p => p === "serverGUI").length === 0) {
                    dispatch(addActivePlugin("serverGUI"))
                    setPluginModalVisible(true)
                  }
                  setPluginModalVisible(!pluginModalVisible)
                }}
              >
                  <div className="flex items-center p-[5px]">
                    <VscServerProcess className="w-[20px] h-[20px] mr-[10px]" />
                    <li>Mesher & Solver</li>
                  </div>

              </div>
              {/* <div>
                <FaUser
                  id="profileIcon"
                  className="w-[20px] h-[20px] mr-4 text-primaryColor hover:text-secondaryColor hover:cursor-pointer"
                  onClick={() => {
                    setUserDropdownVisibility(!userDropdownVisibility)
                    setPluginVisibility(false)
                  }}
                />
                <ul
                  style={{ display: !userDropdownVisibility ? 'none' : 'block' }}
                  className="px-4 py-2 bg-white rounded list-none absolute right-[10px] mt-[8px] w-max shadow z-[10000]"
                >
                  <li className="font-bold text-lg text-secondaryColor">
                    {user.userName}
                  </li>
                  <hr className="mb-3" />
                  <div className="flex items-center p-[5px] hover:bg-opacity-40 hover:bg-green-200 hover:font-semibold hover:cursor-pointer">
                  <GiSettingsKnobs className="w-[20px] h-[20px] mr-[10px] text-primaryColor" />
                  <li>Settings</li>
                </div>
                  <div
                    className="flex items-center p-[5px] hover:bg-opacity-40 hover:bg-green-200 hover:font-semibold hover:cursor-pointer"
                    onClick={() => {
                      window.electron.ipcRenderer.sendMessage('logout', [
                        process.env.REACT_APP_AUTH0_DOMAIN,
                      ]);
                    }}
                  >
                    <HiOutlineLogout className="w-[20px] h-[20px] mr-[10px] text-primaryColor" />
                    <li>Logout</li>
                  </div>
                </ul>
              </div> */}
            </>

          ) : (
            <button
              className="text-primaryColor rounded mr-[20px] border-2 border-secondaryColor font-bold py-[4px] px-[10px] hover:bg-green-200"
              onClick={() => process.env.NODE_ENV === 'development' ? loginWithRedirect() : loginWithPopup()}
              name="loginButton"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
};
