import React from 'react';
import { Simulations } from './Simulations';
import { Projects } from './projects/Projects';

interface OverviewProps {
  setLoadingSpinner: (value: boolean) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setLoadingSpinner }) => {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full relative z-20">
        <Projects setLoadingSpinner={setLoadingSpinner} />
      </div>
      <div className="w-full relative z-10">
        <Simulations maxH="max-h-[400px]" />
      </div>
    </div>
  );
};
