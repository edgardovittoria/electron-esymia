import { FC, Fragment, useState } from 'react';
import { FaunaCadModel, useFaunaQuery } from 'cad-library';
import { useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { updateModelInFauna } from '../../../../faunaDB/functions';
import { updateModel } from '../../../../store/modelSlice';

const RenameModal: FC<{
  setRenameModalShow: Function;
  model: FaunaCadModel;
}> = ({ setRenameModalShow, model }) => {
  const [name, setName] = useState('');
  const { execQuery } = useFaunaQuery();
  const dispatch = useDispatch();

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setRenameModalShow(false)}
      >
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Rename Model
                </Dialog.Title>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <label className="ml-2">Name:</label>
                    <input
                      type="text"
                      value={name}
                      required
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => setRenameModalShow(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={
                      name === ''
                        ? () => {
                            toast.error(
                              'You must insert a valid name for the model.',
                            );
                          }
                        : () => {
                            setRenameModalShow(false);
                            const newModel: FaunaCadModel = {
                              ...model,
                              name,
                            };
                            execQuery(updateModelInFauna, newModel)
                              .then(() => {
                                dispatch(updateModel(newModel));
                                toast.success('Model Name Updated!');
                              })
                              .catch((err) => {
                                console.log(err);
                                toast.error('Model Name Not Updated!');
                              });
                          }
                    }
                  >
                    Save
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RenameModal;
