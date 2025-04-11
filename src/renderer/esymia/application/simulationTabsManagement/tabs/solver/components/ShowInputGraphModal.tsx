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
      <Dialog as="div" className="relative z-10" onClose={() => {setGraphData(undefined)}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                className={`w-full max-w-5xl transform overflow-hidden rounded-2xl ${
                  theme === 'light'
                    ? 'bg-white text-textColor'
                    : 'bg-bgColorDark2 text-textColorDark '
                } p-6 text-left align-middle shadow-xl transition-all relative`}
              >
                <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                  INPUT SIGNAL GRAPH
                </Dialog.Title>
                <IoCloseCircleOutline size={25} className='absolute top-1 right-1 cursor-pointer' onClick={() => setGraphData(undefined)}/>
                <hr className="mt-2 mb-3" />
                <Line
                  options={{
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: labelX,
                          font: {
                            size: 15,
                            weight: 'bold',
                            lineHeight: 1.2,
                          },
                          padding: { top: 2, bottom: 0 },
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: labelY,
                          font: {
                            size: 15,
                            weight: 'bold',
                            lineHeight: 1.2,
                          },
                          padding: { top: 2, bottom: 0 },
                        },
                      },
                    },
                  }}
                  data={{
                    labels: dataX,
                    datasets: [
                      {
                        label: signalName,
                        data: dataY,
                        borderColor: '#000',
                      },
                    ],
                  }}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
