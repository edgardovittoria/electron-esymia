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
  let portColor = 'yellow';
  if (selectedPort && selectedPort.category === 'lumped') {
    portColor = 'violet';
  } else if (selectedPort && selectedPort.category === 'port') {
    portColor = 'red';
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
        <div className={`w-full mt-3 border rounded ${theme === 'light' ? 'border-secondaryColor bg-[#f6f6f6]' : 'border-white bg-bgColorDark'} bg-white px-2 py-5`}>
          {/* Header con icona e nome */}
          <div className="flex items-center gap-2 px-[5px] mb-4">
            <div className="col-1 pe-0 ps-0">
              <FaReact
                color={portColor}
                style={{ width: '25px', height: '25px' }}
              />
            </div>
            <div className="col-6 text-start">
              <h5 className="mb-0 text-sm font-bold">{selectedPort.name}</h5>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b mb-4 px-[5px]">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === index
                    ? `border-b-2 ${theme === 'light' ? 'border-blue-600 text-blue-600' : 'border-blue-400 text-blue-400'}`
                    : `${theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'}`
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-[20px] pb-[20px]">
            {tabs[activeTab]?.content}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
