import React from 'react';
import { TiArrowMinimise } from 'react-icons/ti';
import ServerGUI from './serverGUI/ServerGUI';

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
    return(
      <div
        className={`absolute right-10 w-[40%] bottom-16 border border-secondaryColor flex flex-col justify-center items-center bg-white p-3 rounded ${
          !pluginsVisible && 'hidden'
        }`}
      >
        <div className="flex flex-row justify-between">
          <h5>Plugins</h5>
          <TiArrowMinimise
            className="absolute top-2 right-2 hover:cursor-pointer hover:bg-gray-200"
            size={20}
            onClick={() => setPluginsVisible(false)}
          />
        </div>
        <hr className="text-secondaryColor w-full mb-5 mt-3" />
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
