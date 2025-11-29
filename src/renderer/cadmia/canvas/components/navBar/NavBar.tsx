import React from 'react';
import { Popover } from '@headlessui/react';
import { MdDashboard, MdViewInAr } from 'react-icons/md';
import { FileItem } from './menuItems/file/FileItem';
import { ViewItem } from './menuItems/view/ViewItem';
import { EditItem } from './menuItems/edit/EditItem';
import { Shapes } from './menuItems/shapes/shapes';
import { LoginLogout } from './menuItems/loginLogout';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { selectModel } from '../../../store/modelSlice';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';
import logo from '../../../../../../assets/cadmia_logo.png';
import logo_light from '../../../../../../assets/cadmia_logo_light.png';

interface NavbarProps {
  setShowCad: (v: boolean) => void;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const Navbar: React.FC<NavbarProps> = ({ setShowCad }) => {

  const dispatch = useDispatch()
  const theme = useSelector(ThemeSelector);

  return (
    <div className={`relative h-[5vh] z-50 backdrop-blur-md border-b transition-colors duration-300 ${theme === 'light' ? 'bg-white/80 border-gray-200' : 'bg-black/80 border-white/10'}`}>
      <div className='px-4 flex flex-row items-center justify-between w-full h-full'>

        <div className="flex items-center gap-6">
          {/* Logo Section */}
          <div className="flex items-center gap-2 select-none">
            {/* <div className={`p-1.5 rounded-lg ${theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
              <MdViewInAr size={20} />
            </div>
            <span className={`text-lg font-bold tracking-tight ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
              CADmIA
            </span> */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-500 animate-gradient-shadow">
              <img
                src={theme === 'light' ? logo : logo_light}
                className={`h-10 w-auto rounded-2xl py-1 px-4 object-contain ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
                alt="logo"
              />
            </div>
          </div>

          {/* Menu Items */}
          <div className='hidden md:flex items-center gap-1 pl-4 border-l border-gray-200 dark:border-white/10'>
            <FileItem />
            <ViewItem />
            <EditItem />
            {/* <Shapes /> */}
          </div>
        </div>

        {/* Right Side Actions */}
        <button
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 
            ${theme === 'light'
              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-400 hover:bg-white/10 hover:text-gray-100'}`}
          onClick={() => {
            dispatch(selectModel(undefined))
            setShowCad(false)
          }}
        >
          <MdDashboard size={18} className="transition-transform group-hover:scale-110" />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );
};
