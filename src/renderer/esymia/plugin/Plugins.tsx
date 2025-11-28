import React from 'react';
import { IoClose } from 'react-icons/io5';
import ServerGUI from './serverGUI/ServerGUI';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../store/tabsAndMenuItemsSlice';

export interface PluginsProps {
  pluginsVisible: boolean;
  setPluginsVisible: (v: boolean) => void;
  activePlugins: string[]
}

const pluginsFactory = (name: string, index: number) => {
  switch (name) {
    case 'serverGUI': return <ServerGUI index={index} />
  }
}
const Plugins: React.FC<PluginsProps> = ({ pluginsVisible, setPluginsVisible, activePlugins }) => {
  const theme = useSelector(ThemeSelector)
  const isDark = theme !== 'light';

  return (
    <div
      className={`absolute right-0 top-full mt-2 w-[600px] flex flex-col p-6 rounded-2xl shadow-2xl z-50 transition-all duration-300 transform origin-top-right ${isDark
        ? 'glass-panel-dark border border-white/10'
        : 'glass-panel-light border border-white/40'
        } ${pluginsVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
    >
      <div className="flex flex-row justify-between items-center mb-4">
        <h5 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Mesher & Solver
        </h5>
        <button
          className={`p-2 rounded-lg transition-all duration-200 ${isDark
            ? 'hover:bg-white/10 text-gray-400 hover:text-white'
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          onClick={() => setPluginsVisible(false)}
        >
          <IoClose size={20} />
        </button>
      </div>
      <hr className={`w-full mb-5 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
      <div className="w-full max-h-[600px] overflow-y-auto custom-scrollbar">
        {activePlugins.map((p, index) => (
          <React.Fragment key={index}>
            {pluginsFactory(p, index)}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default Plugins
