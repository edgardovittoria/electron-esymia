import React, { ReactNode } from 'react';
import { FaReact } from 'react-icons/fa6';
import { Port, Probe } from '../../../../../model/esymiaModels';

interface PortManagementProps {
  selectedPort: Port | Probe | undefined;
  savedPortParameters: boolean;
  setSavedPortParameters: Function;
  children: ReactNode;
}

export const PortManagement: React.FC<PortManagementProps> = ({
  children,
  selectedPort,
  savedPortParameters,
  setSavedPortParameters,
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
        <>
          <div className="flex items-center gap-2 p-[5px]">
            <div className="col-1 pe-0 ps-0">
              <FaReact
                color={portColor}
                style={{ width: '25px', height: '25px' }}
              />
            </div>
            <div className="col-6 text-start">
              <h5 className="mb-0 xl:text-md text-sm">{selectedPort.name}</h5>
            </div>
          </div>
          <div className="flex-col p-[10px] max-h-[300px] overflow-y-scroll overflow-x-hidden">
            {children}
          </div>
          <div
            className={`flex p-[10px]`}
          >
            <button
              type="button"
              className="button buttonPrimary w-full mt-2 hover:opacity-80 disabled:opacity-60"
              onClick={() => setSavedPortParameters(true)}
              disabled={savedPortParameters}
            >
              SAVE
            </button>
          </div>
        </>
      ) : (
        <div className="flex p-[10px]">
          <span>No Port Selected</span>
        </div>
      )}
    </>
  );
};
