import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  infoModalSelector,
  setIsConfirmedInfoModal, setMessageInfoModal,
  setShowInfoModal,
  ThemeSelector
} from '../../store/tabsAndMenuItemsSlice';

export interface InfoModalProps{

}

const InfoModal: React.FC<InfoModalProps> = ({}) => {
    const infoModal = useSelector(infoModalSelector)
    const theme = useSelector(ThemeSelector)
    const dispatch = useDispatch()

  useEffect(() => {
    return () => {
      dispatch(setIsConfirmedInfoModal(false))
      dispatch(setMessageInfoModal(""))
    }
  }, []);

    return(
      <Transition appear show={infoModal.showInfoModal} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto' data-testid="alert">
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark '} p-6 text-left align-middle shadow-xl transition-all`}>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6'
                  >
                    INFO
                  </Dialog.Title>
                  <hr className='mt-2 mb-3' />
                  <span data-testid="alertMessage">{infoModal.message}</span>
                  {infoModal.isAlert ?
                    <div className='mt-4 flex justify-end'>
                      <button
                        type='button'
                        className='button bg-red-500 text-white'
                        onClick={() => {
                          dispatch(setShowInfoModal(false));
                          dispatch(setIsConfirmedInfoModal(true))
                        }}
                      >
                        OK
                      </button>
                    </div>
                    :
                    <div className='mt-4 flex justify-between'>
                      <button
                        type='button'
                        className='button bg-gray-300 text-white'
                        onClick={() => {
                          dispatch(setShowInfoModal(false))
                          dispatch(setIsConfirmedInfoModal(false))
                        }}
                      >
                        CANCEL
                      </button>

                      <button
                        type='button'
                        className='button bg-red-500 text-white'
                        onClick={() => {
                          dispatch(setShowInfoModal(false));
                          dispatch(setIsConfirmedInfoModal(true))
                        }}
                      >
                        CONFIRM
                      </button>
                    </div>
                  }
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
}

export default InfoModal
