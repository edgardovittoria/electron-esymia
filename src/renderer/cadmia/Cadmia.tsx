import React, { useState } from 'react';
import CAD from './canvas/CAD';
import Dashboard from './dashboard/Dashboard';

export interface CadmiaProps {
  selectedTab: string;
}

const Cadmia: React.FC<CadmiaProps> = ({ selectedTab }) => {
  const [showCad, setShowCad] = useState<boolean>(false);
  return (
    <>
      {selectedTab === 'cadmia' && (
        <div>
          {showCad ? (
            <CAD setShowCad={setShowCad} />
          ) : (
            <Dashboard showCad={showCad} setShowCad={setShowCad} />
          )}
        </div>
      )}
    </>
  );
};

export default Cadmia;
