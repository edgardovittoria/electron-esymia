import React, { useState } from 'react';
import CAD from './canvas/CAD';
import Dashboard from './dashboard/Dashboard';


export interface CadmiaProps{

}

const Cadmia: React.FC<CadmiaProps> = ({}) => {
  const [showCad, setShowCad] = useState<boolean>(false);
  return (
    <div>
      {showCad ? (
        <CAD setShowCad={setShowCad} />
      ) : (
        <Dashboard showCad={showCad} setShowCad={setShowCad} />
      )}
    </div>
  );
}

export default Cadmia
