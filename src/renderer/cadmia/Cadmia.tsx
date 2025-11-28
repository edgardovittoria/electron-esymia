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
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  return (
    <>
      {selectedTab === 'cadmia' && (
        <div className="h-full flex flex-col animate-fade-in-up">
          {showCad ? (
            <CAD setShowCad={setShowCad} />
          ) : (
            <>
              <div className="w-full px-8 py-6 flex items-center justify-between">
                <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  CADmIA
                </h1>
              </div>
              <div className="flex-1 px-8 pb-8 overflow-auto">
                <Dashboard showCad={showCad} setShowCad={setShowCad} />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Cadmia;
