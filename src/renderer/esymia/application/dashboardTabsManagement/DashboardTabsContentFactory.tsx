import React, {  } from 'react';
import { useSelector } from 'react-redux';
import { Overview } from './tabs/Overview';
import { Simulations } from './tabs/Simulations';
import { Projects } from './tabs/projects/Projects';
import { selectedMenuItemSelector } from '../../store/tabsAndMenuItemsSlice';

interface DashboardTabsContentFactoryProps {}

export const DashboardTabsContentFactory: React.FC<
  DashboardTabsContentFactoryProps
> = () => {

  const menuItemSelected = useSelector(selectedMenuItemSelector);


  switch (menuItemSelected) {
    case 'Overview':
      return (
        <div className="w-full px-10 flex mx-auto pt-5 h-[80vh]">
          <Overview />
          {/* <RightPanel /> */}
        </div>
      );

    case 'Projects':
      return (
        <div className="xl:w-[80%] w-full px-10 xl:px-0 flex mx-auto pt-10 bg-[#ececec] overflow-y-scroll h-[85vh]">
          <Projects />
          {/* <RightPanel /> */}
        </div>
      );
    case 'Simulations':
      return (
        <div className="xl:w-[80%] w-full px-10 xl:px-0 flex mx-auto pt-10 bg-[#ececec] lg:h-[60vh] h-[80vh]">
          <Simulations maxH="max-h-[750px]"/>
          {/* <RightPanel /> */}
        </div>
      );
    default:
      return <></>;
  }
};
