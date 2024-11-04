import React, { useState } from 'react';
import CAD from './canvas/CAD';
import Dashboard from './dashboard/Dashboard';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../esymia/store/tabsAndMenuItemsSlice';

export interface CadmiaProps {
  selectedTab: string;
}

const Cadmia: React.FC<CadmiaProps> = ({ selectedTab }) => {
  const [showCad, setShowCad] = useState<boolean>(false);
  const theme = useSelector(ThemeSelector)
  return (
    <>
      {selectedTab === 'cadmia' && (
        <div>
          {showCad ? (
            <CAD setShowCad={setShowCad} />
          ) : (
            <>
              <div className="grid grid-cols-12 px-8 pt-6 items-center">
                <span className={`xl:col-span-1 sm:col-span-2 col-span-3 ${theme === 'light' ? 'text-secondaryColor' : 'text-secondaryColorDark'} text-2xl font-semibold mr-4 ml-4 flex justify-center pb-1`}>
                  CADmIA
                </span>
              </div>
              <Dashboard showCad={showCad} setShowCad={setShowCad} />
            </>

          )}
        </div>
      )}
    </>
  );
};

export default Cadmia;
