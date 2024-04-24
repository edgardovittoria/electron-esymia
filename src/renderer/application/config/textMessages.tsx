import { FC } from 'react';
import { BiHide } from 'react-icons/bi';

export const comeBackToModelerMessage = 'Go Back to Modeler tab to load a model';
export const emptyResultsMessage = 'Launch a simulation and come back here to visualize the results';
export const alertMessageStyle = 'text-xl font-semibold';
export const infoSavePhysicsParamsButton = 'Saving parameters on server now is not necessary in order to launch a simulation. Use this button if you are not intended to launch a simulation now.';
export const PositioningPortsInfo: FC = () => {
  return (
    <div className='flex flex-col text-sm text-start p-[10px]'>
      <span className="font-semibold">Once you have added a new termination, you can place it in the following ways:</span>
      <div className='list-decimal ml-3 mt-2'>
        <li>double clicking on model surface point of interest;</li>
        <li>
          <span className="w-full">enabling termination location suggestions by clicking on</span>
          <div className="inline mx-2"><BiHide className="w-5 h-5 inline text-green-300"/></div>
          <span className="w-full">button on top of the model, then double clicking on suggestions shown;</span>

        </li>
        <li>using controls shown directly on the selected port (discouraged).</li>
      </div>
    </div>
  );
};
