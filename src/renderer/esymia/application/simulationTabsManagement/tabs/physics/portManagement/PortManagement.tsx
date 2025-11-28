import React, { ReactNode, useState, Children } from 'react';
import { FaReact } from 'react-icons/fa6';
import { Port, Probe } from '../../../../../model/esymiaModels';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';

interface PortManagementProps {
  selectedPort: Port | Probe | undefined;
  children: ReactNode;
}

export const PortManagement: React.FC<PortManagementProps> = ({
  children,
  selectedPort
}) => {
  let portColor = 'text-yellow-500';
  if (selectedPort && selectedPort.category === 'lumped') {
    portColor = 'text-violet-500';
  } else if (selectedPort && selectedPort.category === 'port') {
    portColor = 'text-red-500';
  }

  const theme = useSelector(ThemeSelector);

  // Converti children in array per poterli mappare
  const childrenArray = Children.toArray(children);

  // Determina le tab in base al tipo di porta
  const getTabs = () => {
    if (selectedPort?.category === 'lumped') {
      return [
        { label: 'Type', content: childrenArray[0] },
        { label: 'RLC', content: childrenArray[1] },
        { label: 'Position', content: childrenArray[2] },
      ];
    } else if (selectedPort?.category === 'port') {
      // Se abbiamo 3 children, assumiamo che ci sia anche PortSignal
      if (childrenArray.length === 3) {
        return [
          { label: 'Scattering', content: childrenArray[0] },
          { label: 'Signal', content: childrenArray[1] },
          { label: 'Position', content: childrenArray[2] },
        ];
      } else {
        // Solo 2 children: Scattering e Position
        return [
          { label: 'Scattering', content: childrenArray[0] },
          { label: 'Position', content: childrenArray[1] },
        ];
      }
    }
    return [];
  };

  const tabs = getTabs();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {selectedPort ? (
        <div className={`w-full mt-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
          {/* Header con icona e nome */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200/50 dark:border-white/10">
            <FaReact
              className={`w-6 h-6 ${portColor}`}
            />
            <h5 className={`text-sm font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{selectedPort.name}</h5>
          </div>

          {/* Navigation tabs */}
          <div className="flex px-4 pt-2 border-b border-gray-200/50 dark:border-white/10 overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                className={`px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${activeTab === index
                    ? `border-blue-500 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`
                    : `border-transparent ${theme === 'light' ? 'text-gray-500 hover:text-gray-700 hover:border-gray-300' : 'text-gray-400 hover:text-gray-200 hover:border-gray-600'}`
                  }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">
            {tabs[activeTab]?.content}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
