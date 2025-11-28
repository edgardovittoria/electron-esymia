import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { setPortType } from '../../../../../store/projectSlice';
import { Port, Probe } from '../../../../../model/esymiaModels';
import portType1 from '../../../../../../../../assets/portType1.png';
import portType2 from '../../../../../../../../assets/portType2.png';
import portType3 from '../../../../../../../../assets/portType3.png';
import portType4 from '../../../../../../../../assets/portType4.png';
import portType5 from '../../../../../../../../assets/portType5.png';
import portType1Dark from '../../../../../../../../assets/portType1Dark.png';
import portType2Dark from '../../../../../../../../assets/portType2Dark.png';
import portType3Dark from '../../../../../../../../assets/portType3Dark.png';
import portType4Dark from '../../../../../../../../assets/portType4Dark.png';
import portType5Dark from '../../../../../../../../assets/portType5Dark.png';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';

interface ModalSelectPortTypeProps {
  show: boolean;
  setShow: Function;
  selectedPort: Port | Probe;
  setSavedPortParameters: Function;
}

export const ModalSelectPortType: React.FC<ModalSelectPortTypeProps> = ({
  show,
  setShow,
  selectedPort,
  setSavedPortParameters,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector)

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setShow(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
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
              <Dialog.Panel className={`w-full max-w-[800px] transform overflow-hidden rounded-2xl p-8 text-left align-middle shadow-2xl transition-all border ${theme === 'light'
                  ? 'bg-white/90 border-white/20 text-gray-800'
                  : 'bg-gray-900/90 border-white/10 text-white'
                } backdrop-blur-xl`}>
                <Dialog.Title
                  as="h3"
                  className={`text-xl font-bold leading-6 mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                >
                  Select Port Type
                </Dialog.Title>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  {[
                    { type: 1, img: theme === 'light' ? portType1 : portType1Dark, label: 'Type 1' },
                    { type: 2, img: theme === 'light' ? portType2 : portType2Dark, label: 'Type 2' },
                    { type: 3, img: theme === 'light' ? portType3 : portType3Dark, label: 'Type 3' },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 border ${theme === 'light'
                          ? 'hover:bg-blue-50 border-transparent hover:border-blue-200 hover:shadow-md'
                          : 'hover:bg-white/10 border-transparent hover:border-white/20 hover:shadow-lg hover:shadow-white/5'
                        }`}
                      onClick={() => {
                        dispatch(setPortType({ name: selectedPort.name, type: item.type }));
                        setSavedPortParameters(false);
                        setShow(false);
                      }}
                    >
                      <img src={item.img} className="h-32 object-contain mb-3" alt={item.label} />
                      <div className="font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { type: 4, img: theme === 'light' ? portType4 : portType4Dark, label: 'Type 4' },
                    { type: 5, img: theme === 'light' ? portType5 : portType5Dark, label: 'Type 5' },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 border ${theme === 'light'
                          ? 'hover:bg-blue-50 border-transparent hover:border-blue-200 hover:shadow-md'
                          : 'hover:bg-white/10 border-transparent hover:border-white/20 hover:shadow-lg hover:shadow-white/5'
                        }`}
                      onClick={() => {
                        dispatch(setPortType({ name: selectedPort.name, type: item.type }));
                        setSavedPortParameters(false);
                        setShow(false);
                      }}
                    >
                      <img src={item.img} className="h-32 object-contain mb-3" alt={item.label} />
                      <div className="font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
