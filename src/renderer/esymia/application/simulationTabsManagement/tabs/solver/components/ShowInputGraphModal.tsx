import { Transition, Dialog } from '@headlessui/react';
import { Fragment } from 'react/jsx-runtime';
import { theme } from '../../../../../../../../tailwind.config';
import {
  setShowInfoModal,
  setIsConfirmedInfoModal,
  ThemeSelector,
} from '../../../../../store/tabsAndMenuItemsSlice';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { IoCloseCircleOutline } from 'react-icons/io5';

export type InputGraphData = {
  labelX: string;
  labelY: string;
  dataX: number[];
  dataY: number[];
  signalName: string;
}

type ShowInputGraphModalProps = {
  setGraphData: Function
} & InputGraphData

export const ShowInputGraphModal: React.FC<ShowInputGraphModalProps> = ({
  labelX,
  labelY,
  dataX,
  dataY,
  signalName,
  setGraphData
}) => {
  const theme = useSelector(ThemeSelector);
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => { setGraphData(undefined) }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto" data-testid="alert">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-5xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all backdrop-blur-md border ${theme === 'light'
                    ? 'bg-white/90 border-white/40 text-gray-800'
                    : 'bg-black/60 border-white/10 text-gray-200'
                  }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6">
                    INPUT SIGNAL GRAPH
                  </Dialog.Title>
                  <button
                    onClick={() => setGraphData(undefined)}
                    className={`p-1 rounded-full transition-colors ${theme === 'light'
                        ? 'hover:bg-gray-200 text-gray-500'
                        : 'hover:bg-white/10 text-gray-400'
                      }`}
                  >
                    <IoCloseCircleOutline size={28} />
                  </button>
                </div>

                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-white/50' : 'bg-white/5'}`}>
                  <Line
                    options={{
                      responsive: true,
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: labelX,
                            font: {
                              size: 14,
                              weight: 'bold',
                            },
                            color: theme === 'light' ? '#374151' : '#9ca3af',
                          },
                          grid: {
                            color: theme === 'light' ? '#e5e7eb' : '#374151',
                          },
                          ticks: {
                            color: theme === 'light' ? '#374151' : '#9ca3af',
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: labelY,
                            font: {
                              size: 14,
                              weight: 'bold',
                            },
                            color: theme === 'light' ? '#374151' : '#9ca3af',
                          },
                          grid: {
                            color: theme === 'light' ? '#e5e7eb' : '#374151',
                          },
                          ticks: {
                            color: theme === 'light' ? '#374151' : '#9ca3af',
                          }
                        },
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: theme === 'light' ? '#374151' : '#9ca3af',
                          }
                        }
                      }
                    }}
                    data={{
                      labels: dataX,
                      datasets: [
                        {
                          label: signalName,
                          data: dataY,
                          borderColor: theme === 'light' ? '#3b82f6' : '#60a5fa',
                          backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(96, 165, 250, 0.5)',
                          tension: 0.4,
                        },
                      ],
                    }}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
