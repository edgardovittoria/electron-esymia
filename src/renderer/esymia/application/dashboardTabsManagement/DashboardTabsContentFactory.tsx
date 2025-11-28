import React, { } from 'react';
import { useSelector } from 'react-redux';
import { Overview } from './tabs/Overview';
import { Simulations } from './tabs/Simulations';
import { Projects } from './tabs/projects/Projects';
import { selectedMenuItemSelector } from '../../store/tabsAndMenuItemsSlice';

interface DashboardTabsContentFactoryProps {
  setLoadingSpinner: (value: boolean) => void;
}

export const DashboardTabsContentFactory: React.FC<
  DashboardTabsContentFactoryProps
> = ({ setLoadingSpinner }) => {

  const menuItemSelected = useSelector(selectedMenuItemSelector);

  switch (menuItemSelected) {
    case 'Overview':
      return (
        <div className="w-full h-full p-6 overflow-y-auto">
          <Overview setLoadingSpinner={setLoadingSpinner} />
        </div>
      );

    case 'Projects':
      return (
        <div className="w-full h-full p-6 overflow-y-auto">
          <Projects setLoadingSpinner={setLoadingSpinner} />
        </div>
      );
    case 'Simulations':
      return (
        <div className="w-full h-full p-6 overflow-y-auto">
          <Simulations maxH="h-full" />
        </div>
      );
    default:
      return <></>;
  }
};
