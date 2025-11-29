import React, { Fragment, useEffect } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  infoModalSelector,
  setIsConfirmedInfoModal, setMessageInfoModal,
  setShowInfoModal,
  ThemeSelector
} from '../../store/tabsAndMenuItemsSlice';

export interface InfoModalProps {

}

const InfoModal: React.FC<InfoModalProps> = ({ }) => {
  const infoModal = useSelector(infoModalSelector)
  const theme = useSelector(ThemeSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    return () => {
      dispatch(setIsConfirmedInfoModal(false))
      dispatch(setMessageInfoModal(""))
    }
  }, []);

  return (
    <Transition appear show={infoModal.showInfoModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => { }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                className={`w-full max-w-md transform overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl p-6 text-left align-middle transition-all ${theme === 'light'
                  ? 'bg-white/80 border-white/40 text-gray-800'
                  : 'bg-black/60 border-white/10 text-gray-200'
                  }`}
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 flex items-center gap-2"
                >
                  <MdInfoOutline className="text-blue-500" size={24} />
                  INFO
                </Dialog.Title>
                <div className={`mt-2 mb-4 h-px w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`} />

                <div className="mt-2">
                  <span data-testid="alertMessage" className="text-sm opacity-90">
                    {infoModal.message}
                  </span>
                </div>

                {infoModal.isAlert ? (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg ${theme === 'light'
                        ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/30'
                        : 'bg-red-600 text-white hover:bg-red-500 hover:shadow-red-600/30'
                        }`}
                      onClick={() => {
                        dispatch(setShowInfoModal(false));
                        dispatch(setIsConfirmedInfoModal(true));
                      }}
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${theme === 'light'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      onClick={() => {
                        dispatch(setShowInfoModal(false));
                        dispatch(setIsConfirmedInfoModal(false));
                      }}
                    >
                      CANCEL
                    </button>

                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg ${theme === 'light'
                        ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-blue-500/30'
                        : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-600/30'
                        }`}
                      onClick={() => {
                        dispatch(setShowInfoModal(false));
                        dispatch(setIsConfirmedInfoModal(true));
                      }}
                    >
                      CONFIRM
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InfoModal
