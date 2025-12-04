import React, { useState } from 'react';
import CAD from './canvas/CAD';
import Dashboard from './dashboard/Dashboard';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../esymia/store/tabsAndMenuItemsSlice';
import logo from '../../../assets/cadmia_logo.png';
import logo_light from '../../../assets/cadmia_logo_light.png';

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
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-500 animate-gradient-shadow">
                  <img
                    src={theme === 'light' ? logo : logo_light}
                    className={`h-12 w-auto rounded-2xl py-2 px-4 object-contain ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
                    alt="logo"
                  />
                </div>
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
