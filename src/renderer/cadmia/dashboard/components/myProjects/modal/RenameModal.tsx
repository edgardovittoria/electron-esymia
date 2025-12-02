import { FC, Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { ThemeSelector } from '../../../../../esymia/store/tabsAndMenuItemsSlice';
import toast from 'react-hot-toast';
import { updateModel } from '../../../../store/modelSlice';
import { DynamoDBCadModel } from '../../../../../cad_library/components/dynamodb/api/modelsAPIs';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateModelInDynamoDB } from '../../../../../dynamoDB/modelsApis';

const RenameModal: FC<{
  setRenameModalShow: Function;
  model: DynamoDBCadModel;
}> = ({ setRenameModalShow, model }) => {
  const [name, setName] = useState('');
  const { execQuery2 } = useDynamoDBQuery();
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl p-8 text-left align-middle shadow-2xl transition-all border backdrop-blur-xl ${isDark ? 'bg-gray-900/90 border-white/10' : 'bg-white/90 border-white/40'}`}>
                <Dialog.Title
                  as="h3"
                  className={`text-xl font-bold leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Rename Project
                </Dialog.Title>
                <div className="mt-6">
                  <div className="flex flex-col gap-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Project Name</label>
                    <input
                      type="text"
                      value={name}
                      required
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 ${isDark
                        ? 'bg-black/20 border-white/10 text-white focus:border-blue-500/50 focus:bg-black/40'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500/50 focus:bg-white'
                        }`}
                      placeholder="Enter new name..."
                      autoFocus
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${isDark
                      ? 'text-gray-300 hover:bg-white/10'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    onClick={() => setRenameModalShow(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${isDark
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/20'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/20'
                      }`}
                    onClick={
                      name === ''
                        ? () => {
                          toast.error(
                            'You must insert a valid name for the model.',
                          );
                        }
                        : () => {
                          setRenameModalShow(false);
                          const newModel: DynamoDBCadModel = {
                            ...model,
                            name,
                          };
                          execQuery2(createOrUpdateModelInDynamoDB, newModel, dispatch)
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
                    Save Changes
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
