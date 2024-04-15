import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Physics } from './tabs/physics/Physics';
import { Results } from './tabs/results/Results';
import { Simulator } from './tabs/simulator/Simulator';
import { Modeler } from './tabs/modeler/Modeler';
import { selectedMenuItemSelector } from '../../store/tabsAndMenuItemsSlice';
import { useWindowInnerWidth } from '../../hook/useWindowInnerWidth';

interface SimulationTabsContentFactoryProps {}

export const SimulationTabsContentFactory: React.FC<
  SimulationTabsContentFactoryProps
> = () => {
  const [selectedTabLeftPanel, setSelectedTabLeftPanel] = useState('Modeler');
  const menuItemSelected = useSelector(selectedMenuItemSelector);
  const [savedPortParameters, setSavedPortParameters] = useState(true);

  const windowInnerWidth = useWindowInnerWidth();

  if (windowInnerWidth < 1024) {
    return (
      <div className="flex flex-col justify-center items-center my-auto lg:h-[70vh] xl:h-[80vh]">
        <span className="font-bold">
          Sorry this section is not available on mobile
        </span>

      </div>
    );
  }
  switch (menuItemSelected) {
    case 'Modeler':
      return (
        <Modeler
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
        />
      );
    case 'Physics':
      return (
        <Physics
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
          savedPortParameters={savedPortParameters}
          setSavedPortParameters={setSavedPortParameters}
        />
      );
    case 'Simulator':
      return (
        <Simulator
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
        />
      );
    case 'Results':
      return (
        <Results
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
        />
      );
    default:
      return <></>;
  }
};
