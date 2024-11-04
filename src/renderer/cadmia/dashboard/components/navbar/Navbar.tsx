import React from 'react';
import { PiFolderUserFill } from 'react-icons/pi';
import { IoShareSocial } from 'react-icons/io5';
import { GiCubeforce } from 'react-icons/gi';
import { CgProfile } from 'react-icons/cg';
import { IoMdLogIn, IoMdLogOut } from 'react-icons/io';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';

export interface NavbarProps {
  selectedMenuItem: string;
  setSelectedMenuItem: (v: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  selectedMenuItem,
  setSelectedMenuItem,
}) => {
  const theme = useSelector(ThemeSelector)
  return (
    <div className="w-full px-10">
      <div className={`${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'}  px-4 py-2 flex flex-row justify-between items-center rounded-xl`}>
        <div className="flex flex-col justify-center items-center hover:cursor-pointer">
          <span
            className={'no-underline px-4 py-2 text-sm'}
          >
            My Projects
          </span>
          <hr className={`w-2/3 border ${theme === 'light' ? 'border-textColor' : 'border-textColorDark'}`} />
        </div>
        {/* <div className='flex flex-row gap-4 items-center'>
          {selectedProject && (
            <button
              className="flex flex-row items-center gap-3 btn btn-sm text-sm bg-white text-black border-gray-300 hover:bg-secondaryColor hover:text-white"
              onClick={() => {
                setcloning(true)
                cloneProject(selectedProject, selectedFolder as Folder, setcloning)
              }}
            >
              <GrClone size={20} />
              <span className="uppercase">clone project</span>
            </button>
          )}
          {cloning && <ImSpinner className="animate-spin w-5 h-5" />}
        </div> */}
      </div>
    </div>
    // <div className="w-1/6 bg-secondaryColor relative flex flex-col text-white items-center py-5 rounded-tr-2xl">
    //   <span className="text-2xl font-semibold">CADmIA</span>
    //   <hr className="w-full border border-white mt-3" />
    //   <div
    //     className={`flex flex-col py-2 gap-2 mt-5 w-full items-start pl-5 hover:bg-white hover:text-black hover:cursor-pointer ${selectedMenuItem === 'MP' ? 'bg-white text-black' : 'text-white'}`}
    //     onClick={() => setSelectedMenuItem('MP')}
    //   >
    //     <div className="flex flex-row items-center gap-2">
    //       <PiFolderUserFill size={25} />
    //       <span className="text-sm">My Projects</span>
    //     </div>
    //   </div>
    //   {/* <div
    //     className={`flex flex-col py-2 gap-2 mt-1 w-full items-start pl-5 hover:bg-white hover:text-black hover:cursor-pointer ${selectedMenuItem === 'MSP' ? 'bg-white text-black' : 'text-white'}`}
    //     onClick={() => setSelectedMenuItem('MSP')}
    //   >
    //     <div className="flex flex-row items-center gap-2">
    //       <IoShareSocial size={25} />
    //       <span className="text-sm">Shared With Me</span>
    //     </div>
    //   </div> */}
    //   {/* <div
    //     className={`flex flex-col py-2 gap-2 mt-1 w-full items-start pl-5 hover:bg-white hover:text-black hover:cursor-pointer ${selectedMenuItem === 'L' ? 'bg-white text-black' : 'text-white'}`}
    //     onClick={() => setSelectedMenuItem('L')}
    //   >
    //     <div className="flex flex-row items-center gap-2">
    //       <GiCubeforce size={25} />
    //       <span className="text-xl">Library</span>
    //     </div>
    //   </div>
    //   <div
    //     className={`flex flex-col py-2 gap-2 mt-1 w-full items-start pl-5 hover:bg-white hover:text-black hover:cursor-pointer ${selectedMenuItem === 'P' ? 'bg-white text-black' : 'text-white'}`}
    //     onClick={() => setSelectedMenuItem('P')}
    //   >
    //     <div className="flex flex-row items-center gap-2">
    //       <CgProfile size={25} />
    //       <span className="text-xl">Profile</span>
    //     </div>
    //   </div> */}
    //   {/* {user ? (
    //     <div
    //       className="absolute bottom-10 flex flex-col gap-5 w-3/4 items-center px-10 py-2 border border-white rounded-xl hover:bg-white hover:text-black hover:cursor-pointer"
    //       onClick={() => {
    //         window.electron.ipcRenderer.sendMessage('logout', [
    //           process.env.REACT_APP_AUTH0_DOMAIN,
    //         ]);
    //       }}
    //     >
    //       <div className="flex flex-row justify-between items-center gap-2">
    //         <IoMdLogOut size={25} />
    //         <span className="text-xl font-semibold">Logout</span>
    //       </div>
    //     </div>
    //   ) : (
    //     <div
    //       className="absolute bottom-10 flex flex-col gap-5 w-3/4 items-center px-10 py-2 border border-white rounded-xl hover:bg-white hover:text-black hover:cursor-pointer"
    //       onClick={() => loginWithPopup()}
    //     >
    //       <div className="flex flex-row justify-between items-center gap-2">
    //         <IoMdLogIn size={25} />
    //         <span className="text-xl font-semibold">Login/Register</span>
    //       </div>
    //     </div>
    //   )} */}
    // </div>
  );
};

export default Navbar;
