import React from 'react';
import { Popover } from '@headlessui/react';
import { MdDashboard } from 'react-icons/md';
import { FileItem } from './menuItems/file/FileItem';
import { ViewItem } from './menuItems/view/ViewItem';
import { EditItem } from './menuItems/edit/EditItem';
import { Shapes } from './menuItems/shapes/shapes';
import { LoginLogout } from './menuItems/loginLogout';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { selectModel } from '../../../store/modelSlice';

interface NavbarProps {
  setShowCad: (v: boolean) => void;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const Navbar: React.FC<NavbarProps> = ({ setShowCad }) => {

  const dispatch = useDispatch()
  // Assuming theme selector is available or we default to light/dark support via CSS variables or similar if not passed.
  // Since this is inside CAD, we might want to use the ThemeSelector if we want explicit control, 
  // but for now let's use standard tailwind classes that can be augmented with dark: prefix if the parent has 'dark' class.
  // However, the user didn't explicitly ask for dark mode support in CAD, but we should try to be consistent.
  // Let's assume the parent app handles the 'dark' class on the body or html.

  return (
    <div className='relative h-[4vh] z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200/50 dark:border-white/10 transition-colors duration-300'>
      <div className='px-4 flex flex-row items-center justify-between w-full h-full'>
        <div className='hidden space-x-1 md:flex'>
          <FileItem />
          <ViewItem />
          <EditItem />
          {/* <Shapes /> */}
        </div>

        {/* <span className='text-2xl font-semibold'>CADmIA</span> */}

        <button
          className='flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 
            text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
          onClick={() => {
            dispatch(selectModel(undefined))
            setShowCad(false)
          }}
        >
          <MdDashboard size={18} />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );
};
