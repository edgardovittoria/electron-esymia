import React, { ReactNode, useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { tabTitles } from './modelerTabTitlesAndIcons';
import { selectedProjectSelector } from '../../../store/projectSlice';

interface DashBoardProps {
  tabs: string[];
  selectedTab: string;
  setSelectedTab: Function;
  children: ReactNode;
  className?: string
}

export const MyPanel: React.FC<DashBoardProps> = ({
  tabs,
  children,
  selectedTab,
  setSelectedTab,
  className
}) => {
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
    (tabs[0] === 'Modeler') && setSelectedTab('Modeler');
    if (tabs[1] === 'Results') {
      setSelectedTab('Results');
    }
  }, [tabs[1]]);

  return (
    <div className={className}>
      <Tab.Group selectedIndex={tabs[1] === 'Results' ? 1 : selectedIndex}>
        <Tab.List className="flex bg-gray-300">
          {tabs.map((tab, index) => {
            return (
              <Tab
                key={index}
                className={({ selected }) =>
                  classNames(
                    'w-full py-2.5 px-2 text-[12px] xl:text-base font-medium',
                    selected
                      ? 'bg-white text-black'
                      : 'text-gray-500 hover:bg-white/[0.12]',
                  )
                }
                onClick={() => {
                  setSelectedIndex(index);
                  setSelectedTab(tab);
                }}
                disabled={selectedTab === 'Results'}
              >
                {selectedTab === tab
                  ? tabTitles.filter((tabTitle) => tabTitle.key === tab)[0]
                      .object
                  : tabTitles.filter((tabTitle) => tabTitle.key === tab)[0]
                      .object}
              </Tab>
            );
          })}
        </Tab.List>
        <Tab.Panels className="shadow-2xl">
          {tabs.map((tab, index) => (
            <Tab.Panel key={index} className="bg-white p-3">
              {children}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
