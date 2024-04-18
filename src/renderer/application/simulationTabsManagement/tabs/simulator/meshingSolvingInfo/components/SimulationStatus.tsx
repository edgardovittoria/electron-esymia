import React, { useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { deleteSimulation, setMeshApproved } from '../../../../../../store/projectSlice';
import { useDispatch } from 'react-redux';
import useWebSocket, { SendMessage } from 'react-use-websocket';

export interface SimulationStatusProps {
  frequenciesNumber: number
}

const SimulationStatus: React.FC<SimulationStatusProps> = ({
  frequenciesNumber
                                                           }) => {

  const WS_URL = 'ws://localhost:8080';
  const [computingP, setComputingP] = useState(false);
  const [computingLpx, setComputingLpx] = useState(false);
  const [iterations, setIterations] = useState(0);

  const { sendMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    shouldReconnect: () => true,
    onMessage: (event) => {
      if (event.data === 'P Computing Completed') {
        setComputingP(true);
      } else if (event.data === 'Lp Computing Completed') {
        setComputingLpx(true);
      } else {
        setIterations(event.data);
      }
    },
    onClose: () => {
      console.log('WebSocket connection closed.');
    }
  });

  return (
    <div className='absolute right-[33%] w-1/3 top-1/3 flex flex-col justify-center items-center bg-white p-3 rounded'>
      <h5>Simulation Status</h5>
      <hr className='text-secondaryColor w-full mb-5 mt-3' />
      <div className='p-5 w-4/5 border border-secondaryColor rounded'>
        <div className='flex flex-col gap-2'>
          <span>Computing P</span>
          <div className='flex flex-row justify-between items-center w-full'>
            {computingP ? (
              <div className='flex flex-row w-full justify-between items-center'>
                <progress
                  className='progress w-full mr-4'
                  value={1}
                  max={1}
                />
                <AiOutlineCheckCircle
                  size='20px'
                  className='text-green-500'
                />
              </div>
            ) : (
              <progress className='progress w-full' />
            )}
          </div>
        </div>

        <div className='flex flex-col gap-2 mt-2'>
          <span>Computing Lp</span>
          <div className='flex flex-row justify-between items-center w-full'>
            {computingLpx ? (
              <div className='flex flex-row justify-between items-center w-full'>
                <progress
                  className='progress w-full mr-4'
                  value={1}
                  max={1}
                />
                <AiOutlineCheckCircle
                  size='20px'
                  className='text-green-500'
                />
              </div>
            ) : (
              <progress className='progress w-full' />
            )}
          </div>
        </div>

        <div className='flex flex-col gap-2 mt-2'>
          <span>Doing Iterations</span>
          <progress
            className='progress w-full'
            value={iterations}
            max={frequenciesNumber + 1}
          />
        </div>
      </div>
      <span
        className='button w-4/5 buttonPrimary text-center mt-4 mb-4'
        onClick={() => {
          const conf = confirm('Are you sure to stop the simulation?');
          if (conf) {
            sendMessage('Stop computation')
          }
        }}
      >
            Stop Simulation
          </span>
    </div>
  );
};

export default SimulationStatus;
