import './App.css';
import React, { useEffect, useState } from 'react';
import Esymia from './esymia/Esymia';
import Cadmia from './cadmia/Cadmia';
import Home from './home/Home';
import { useAuth0 } from '@auth0/auth0-react';
import SimulationStatus
  from './esymia/application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/SimulationStatus';
import MeshingStatus
  from './esymia/application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/MeshingStatus';
import { useDispatch, useSelector } from 'react-redux';
import { activeMeshingSelector, activeSimulationsSelector, setHomePat } from './esymia/store/projectSlice';
import { HiOutlineLogout } from 'react-icons/hi';
import { GiSettingsKnobs } from 'react-icons/gi';
import { FaUser } from 'react-icons/fa';
import {
  createFolder,
  deleteFile,
  deleteFolder,
  getDirContents,
  uploadFile
} from './fileSystemAPIs/fileSystemAPIs';


export default function App() {

  const dispatch = useDispatch()

  useEffect(() => {
    window.electron.ipcRenderer.invoke('getInstallationDir').then(res => dispatch(setHomePat(res)))
  }, []);

  const [tabsSelected, setTabsSelected] = useState<string>('home');
  const { user } = useAuth0();
  const [alert, setAlert] = useState<boolean>(false);
  const [userDropdownVisibility, setUserDropdownVisibility] = useState(false);
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
  }, [activeMeshing.length]);
  return (
    <>
    <div className="flex flex-row items-center justify-center">
      <div role="tablist" className="tabs tabs-bordered w-full justify-center h-[3vh]">
        <input type="radio" name="dashboard" role="tab" className={`tab`} aria-label="Home" checked={tabsSelected === 'home'}
               onClick={() => setTabsSelected('home')}
        />
        <input type="radio" name="cadmia" role="tab" className={`tab`} aria-label="CADmIA" checked={tabsSelected === 'cadmia'}
               disabled={!user}
               onClick={() => setTabsSelected('cadmia')}
        />
        <input type="radio" name="esymia" role="tab" className={`tab`} aria-label="ESymIA" checked={tabsSelected === 'esymia'}
               disabled={!user}
               onClick={() => setTabsSelected('esymia')}
        />
      </div>
      {user &&
        <div>
          <FaUser
            id="profileIcon"
            className="w-[20px] h-[20px] mr-4 text-black hover:opacity-40 hover:cursor-pointer"
            onClick={() => {
              setUserDropdownVisibility(!userDropdownVisibility)
            }}
          />
          <ul
            style={{ display: !userDropdownVisibility ? 'none' : 'block' }}
            className="px-4 py-2 bg-white rounded list-none absolute right-[10px] mt-[20px] w-max shadow z-[10000]"
          >
            <li className="font-bold text-lg text-black">
              {user.nickname}
            </li>
            <hr className="mb-3" />
            <div className="flex items-center p-[5px] hover:bg-black hover:text-white hover:cursor-pointer">
              <GiSettingsKnobs className="w-[20px] h-[20px] mr-[10px]" />
              <li>Settings</li>
            </div>
            <div
              className="flex items-center p-[5px] hover:bg-black hover:text-white hover:cursor-pointer"
              onClick={() => {
                window.electron.ipcRenderer.sendMessage('logout', [
                  process.env.REACT_APP_AUTH0_DOMAIN,
                ]);
              }}
            >
              <HiOutlineLogout className="w-[20px] h-[20px] mr-[10px]" />
              <li>Logout</li>
            </div>
          </ul>
        </div>
      }
    </div>
      {tabsSelected === 'home' && <Home setSelectedTab={setTabsSelected}/>}
      <Cadmia selectedTab={tabsSelected}/>
      <Esymia selectedTab={tabsSelected}/>
      {activeSimulations &&
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
      )}

    </>
  );
}
