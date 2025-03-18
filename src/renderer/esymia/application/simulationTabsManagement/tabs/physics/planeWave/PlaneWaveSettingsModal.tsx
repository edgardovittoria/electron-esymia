import { Transition, Dialog } from '@headlessui/react'
import { FC, Fragment, useState } from 'react'
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice'
import { useSelector } from 'react-redux'

interface PlaneWaveSettingsModalProps {
    setModalOpen: (v: boolean) => void
}

export const PlaneWaveSettingsModal:React.FC<PlaneWaveSettingsModalProps> = ({
    setModalOpen
}) => {

    const theme = useSelector(ThemeSelector)
    const [propertyX, setpropertyX] = useState(0)

  return (
    <>
        <Transition appear show={true} as={Fragment}>
                <Dialog as='div' className='relative z-10' onClose={() => setModalOpen(false)}>
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
        
                  <div className='fixed inset-0 overflow-y-auto' data-testid="createNewProjectModal">
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
                            className='text-lg font-medium leading-6 '
                          >
                            PLANE WAVE SETTINGS
                          </Dialog.Title>
                          <hr className='mt-2 mb-3' />
                          <div className='flex flex-col'>
                              <div className='p-2'>
                                <h6>Insert property x</h6>
                                <input
                                  type='number'
                                  className={`formControl ${theme === 'light' ? 'bg-gray-100 text-textColor' : 'bg-bgColorDark text-textColorDark'}  rounded p-2 w-full mt-3`}
                                  placeholder="property x"
                                  value={propertyX}
                                  onChange={(e) => setpropertyX(parseFloat(e.target.value))}
                                />
                              </div>
                            </div>
        
                          <div className='mt-4 flex justify-between'>
                            <button
                              type='button'
                              className='button bg-red-500 text-white'
                              onClick={() => {
                                setModalOpen(false)
                              }}
                            >
                              CANCEL
                            </button>
                            <button
                                type='button'
                                className={`button buttonPrimary ${theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'}`}
                                onClick={() => {
                                    setModalOpen(false)
                                }}
                              >
                                SET
                              </button>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition>
    </>
  )
}
