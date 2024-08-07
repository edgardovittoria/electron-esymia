import React, { ReactNode } from 'react';
import { FaReact } from 'react-icons/fa6';
import { Port, Probe } from '../../../../../model/esymiaModels';

interface PortManagementProps {
  selectedPort: Port | Probe | undefined;
  children: ReactNode;
}

export const PortManagement: React.FC<PortManagementProps> = ({
  children,
  selectedPort
}) => {
  let portColor = 'yellow';
  if (selectedPort && selectedPort.category === 'lumped') {
    portColor = 'violet';
  } else if (selectedPort && selectedPort.category === 'port') {
    portColor = 'red';
  }
  return (
    <>
      {selectedPort ? (
        <div className='max-w-[350px] max-h-[400px]'>
          <div className="flex items-center gap-2 px-[5px]">
            <div className="col-1 pe-0 ps-0">
              <FaReact
                color={portColor}
                style={{ width: '25px', height: '25px' }}
              />
            </div>
            <div className="col-6 text-start">
              <h5 className="mb-0 xl:text-md text-sm font-bold">{selectedPort.name}</h5>
            </div>
          </div>
          <div className="flex-col px-[20px] pb-[20px] max-h-[400px] overflow-y-scroll overflow-x-hidden">
            {children}
          </div>
        </div>
      ) : (
        <div className="flex p-[10px]">
          <span>No Port Selected</span>
        </div>
      )}
    </>
  );
};
