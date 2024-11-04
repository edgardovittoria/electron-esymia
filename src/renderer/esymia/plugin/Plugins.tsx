import React from 'react';
import { TiArrowMinimise } from 'react-icons/ti';
import ServerGUI from './serverGUI/ServerGUI';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../store/tabsAndMenuItemsSlice';

export interface PluginsProps{
  pluginsVisible: boolean;
  setPluginsVisible: (v: boolean) => void;
  activePlugins: string[]
}

const pluginsFactory = (name:string) => {
  switch (name) {
    case 'serverGUI': return <ServerGUI/>
  }
}
const Plugins: React.FC<PluginsProps> = ({pluginsVisible, setPluginsVisible, activePlugins}) => {
  const theme = useSelector(ThemeSelector)
  return(
      <div
        className={`absolute right-10 w-[30%] top-44 border flex flex-col justify-center items-center ${theme === 'light' ? 'bg-white border-secondaryColor text-textColor' : 'bg-bgColorDark2 border-secondaryColorDark text-textColorDark'} p-3 rounded ${
          !pluginsVisible && 'hidden'
        }`}
      >
        <div className="flex flex-row justify-between">
          <h5>Mesher & Solver</h5>
          <TiArrowMinimise
            className={`absolute top-2 right-2 hover:cursor-pointer ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-bgColorDark'}`}
            size={20}
            onClick={() => setPluginsVisible(false)}
          />
        </div>
        <hr className={`${theme === 'light' ? 'text-secondaryColor' : 'text-secondaryColorDark'} w-full mb-5 mt-3`} />
        <div className="w-full">
          {activePlugins.map((p) => (
            <>
              {pluginsFactory(p)}
            </>
          ))}
        </div>
      </div>
    )
}

export default Plugins
