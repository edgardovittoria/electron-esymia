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
      <Dialog as="div" className="relative z-10" onClose={() => setShow(false)}>
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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-[800px] h-[450px] mt-14 transform overflow-hidden rounded-2xl ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'} p-6 text-left align-middle shadow-xl transition-all`}>
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6`}
                >
                  SELECT PORT TYPE
                </Dialog.Title>
                <hr className="mt-2 mb-3" />
                <div className="flex">
                  <div
                    className={`w-1/3 text-center ${theme === 'light' ? 'hover:ng-green-100' : 'hover:bg-bgColorDark'}`}
                    onClick={() => {
                      dispatch(
                        setPortType({ name: selectedPort.name, type: 1 }),
                      );
                      setSavedPortParameters(false);
                      setShow(false);
                    }}
                  >
                    <img src={theme === 'light' ? portType1 : portType1Dark} className="mx-auto" alt="img" />
                    <div>Type 1</div>
                  </div>
                  <div
                    className={`w-1/3 text-center ${theme === 'light' ? 'hover:ng-green-100' : 'hover:bg-bgColorDark'}`}
                    onClick={() => {
                      dispatch(
                        setPortType({ name: selectedPort.name, type: 2 }),
                      );
                      setSavedPortParameters(false);
                      setShow(false);
                    }}
                  >
                    <img src={theme === 'light' ? portType2 : portType2Dark} className="mx-auto" alt="img" />
                    <div>Type 2</div>
                  </div>
                  <div
                    className={`w-1/3 text-center ${theme === 'light' ? 'hover:ng-green-100' : 'hover:bg-bgColorDark'}`}
                    onClick={() => {
                      dispatch(
                        setPortType({ name: selectedPort.name, type: 3 }),
                      );
                      setSavedPortParameters(false);
                      setShow(false);
                    }}
                  >
                    <img src={theme === 'light' ? portType3 : portType3Dark} className="mx-auto" alt="img" />
                    <div>Type 3</div>
                  </div>
                </div>
                <div className="flex items-baseline">
                  <div
                    className={`w-1/2 text-center ${theme === 'light' ? 'hover:ng-green-100' : 'hover:bg-bgColorDark'}`}
                    onClick={() => {
                      dispatch(
                        setPortType({ name: selectedPort.name, type: 4 }),
                      );
                      setSavedPortParameters(false);
                      setShow(false);
                    }}
                  >
                    <img src={theme === 'light' ? portType4 : portType4Dark} className="mx-auto" alt="img" />
                    <div>Type 4</div>
                  </div>
                  <div
                    className={`w-1/2 text-center ${theme === 'light' ? 'hover:ng-green-100' : 'hover:bg-bgColorDark'}`}
                    onClick={() => {
                      dispatch(
                        setPortType({ name: selectedPort.name, type: 5 }),
                      );
                      setSavedPortParameters(false);
                      setShow(false);
                    }}
                  >
                    <img src={theme === 'light' ? portType5 : portType5Dark} className="mx-auto" alt="img" />
                    <div>Type 5</div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
    /* <Modal show={show} onHide={() => setShow(false)} size="lg" >
            <Modal.Header closeButton>
                <Modal.Title>SELECT PORT TYPE</Modal.Title>
            </Modal.Header>
            <Modal.Body>

            </Modal.Body>
        </Modal> */
  );
};
