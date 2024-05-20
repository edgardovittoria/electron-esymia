import React from 'react';
import { PiFolderUserFill } from 'react-icons/pi';
import { IoShareSocial } from 'react-icons/io5';
import { GiCubeforce } from 'react-icons/gi';
import { CgProfile } from 'react-icons/cg';
import { IoMdLogIn, IoMdLogOut } from 'react-icons/io';
import { useAuth0 } from '@auth0/auth0-react';

export interface NavbarProps {
  selectedMenuItem: string;
  setSelectedMenuItem: (v: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  selectedMenuItem,
  setSelectedMenuItem,
}) => {
  const { loginWithPopup, user } = useAuth0();
  return (
    <div className="w-1/5 bg-black h-[100vh] relative flex flex-col text-white items-center py-5">
      <span className="text-4xl font-semibold">CADmIA</span>
      <hr className="w-full border border-white mt-3" />
      <div
        className={`flex flex-col py-2 gap-2 mt-5 w-full items-start pl-5 hover:bg-white hover:text-black hover:cursor-pointer ${selectedMenuItem === 'MP' ? 'bg-white text-black' : 'text-white'}`}
        onClick={() => setSelectedMenuItem('MP')}
      >
        <div className="flex flex-row items-center gap-2">
          <PiFolderUserFill size={25} />
          <span className="text-xl">My Projects</span>
        </div>
      </div>
      <div
        className={`flex flex-col py-2 gap-2 mt-1 w-full items-start pl-5 hover:bg-white hover:text-black hover:cursor-pointer ${selectedMenuItem === 'MSP' ? 'bg-white text-black' : 'text-white'}`}
        onClick={() => setSelectedMenuItem('MSP')}
      >
        <div className="flex flex-row items-center gap-2">
          <IoShareSocial size={25} />
          <span className="text-xl">Shared With Me</span>
        </div>
      </div>
      {/* <div
        className={`flex flex-col py-2 gap-2 mt-1 w-full items-start pl-5 hover:bg-white hover:text-black hover:cursor-pointer ${selectedMenuItem === 'L' ? 'bg-white text-black' : 'text-white'}`}
        onClick={() => setSelectedMenuItem('L')}
      >
        <div className="flex flex-row items-center gap-2">
          <GiCubeforce size={25} />
          <span className="text-xl">Library</span>
        </div>
      </div>
      <div
        className={`flex flex-col py-2 gap-2 mt-1 w-full items-start pl-5 hover:bg-white hover:text-black hover:cursor-pointer ${selectedMenuItem === 'P' ? 'bg-white text-black' : 'text-white'}`}
        onClick={() => setSelectedMenuItem('P')}
      >
        <div className="flex flex-row items-center gap-2">
          <CgProfile size={25} />
          <span className="text-xl">Profile</span>
        </div>
      </div> */}
      {user ? (
        <div
          className="absolute bottom-10 flex flex-col gap-5 w-3/4 items-center px-10 py-2 border border-white rounded-xl hover:bg-white hover:text-black hover:cursor-pointer"
          onClick={() => {
            window.electron.ipcRenderer.sendMessage('logout', [
              process.env.REACT_APP_AUTH0_DOMAIN,
            ]);
          }}
        >
          <div className="flex flex-row justify-between items-center gap-2">
            <IoMdLogOut size={25} />
            <span className="text-xl font-semibold">Logout</span>
          </div>
        </div>
      ) : (
        <div
          className="absolute bottom-10 flex flex-col gap-5 w-3/4 items-center px-10 py-2 border border-white rounded-xl hover:bg-white hover:text-black hover:cursor-pointer"
          onClick={() => loginWithPopup()}
        >
          <div className="flex flex-row justify-between items-center gap-2">
            <IoMdLogIn size={25} />
            <span className="text-xl font-semibold">Login/Register</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
