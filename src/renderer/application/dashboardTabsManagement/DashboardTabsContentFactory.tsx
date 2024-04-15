import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Overview } from './tabs/Overview';
import { Simulations } from './tabs/Simulations';
import { CreateNewProjectModal } from '../sharedModals/CreateNewProjectModal';
import { Projects } from './tabs/projects/Projects';
import { selectedMenuItemSelector } from '../../store/tabsAndMenuItemsSlice';

interface DashboardTabsContentFactoryProps {}

export const DashboardTabsContentFactory: React.FC<
  DashboardTabsContentFactoryProps
> = () => {
  const [showCreateNewProjectModal, setShowCreateNewProjectModal] =
    useState(false);
  const menuItemSelected = useSelector(selectedMenuItemSelector);

  switch (menuItemSelected) {
    case 'Overview':
      return (
        <div className="xl:w-[80%] w-full px-10 xl:px-0 flex mx-auto pt-10 bg-[#ececec] lg:h-[72vh] h-[80vh]">
          <Overview setShowModal={setShowCreateNewProjectModal} />
          {/* <RightPanel /> */}
          {showCreateNewProjectModal && (
            <CreateNewProjectModal setShow={setShowCreateNewProjectModal} />
          )}
        </div>
      );

    case 'Projects':
      return (
        <div className="xl:w-[80%] w-full px-10 xl:px-0 flex mx-auto pt-10 bg-[#ececec] overflow-y-scroll h-[85vh]">
          <Projects setShowModal={setShowCreateNewProjectModal} />
          {/* <RightPanel /> */}
          {showCreateNewProjectModal && (
            <CreateNewProjectModal setShow={setShowCreateNewProjectModal} />
          )}
        </div>
      );
    case 'Simulations':
      return (
        <div className="xl:w-[80%] w-full px-10 xl:px-0 flex mx-auto pt-10 bg-[#ececec] overflow-y-scroll lg:h-[60vh] h-[80vh]">
          <Simulations maxH="max-h-[600px]"/>
          {/* <RightPanel /> */}
        </div>
      );
    default:
      return <></>;
  }
};
