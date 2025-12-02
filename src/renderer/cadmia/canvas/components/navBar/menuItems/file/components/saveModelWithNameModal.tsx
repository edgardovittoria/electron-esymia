import { useAuth0 } from '@auth0/auth0-react';
import { FC, Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Transition, Dialog } from '@headlessui/react';
import { unitSelector } from '../../../../statusBar/statusBarSlice';
import { uploadFileS3 } from '../../../../../../aws/crud';
import { addModel, setLoadingSpinner } from '../../../../../../store/modelSlice';
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal, ThemeSelector } from '../../../../../../../esymia/store/tabsAndMenuItemsSlice';
import { useFaunaQuery } from '../../../../../../../esymia/faunadb/hook/useFaunaQuery';
import { Client, fql, QuerySuccess } from 'fauna';
import { canvasStateSelector } from '../../../../../../../cad_library';
import { useDynamoDBQuery } from '../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateModelInDynamoDB } from '../../../../../../../dynamoDB/modelsApis';
import { DynamoDBCadModel } from '../../../../../../../cad_library/components/dynamodb/api/modelsAPIs';
import { ComponentEntity } from '../../../../../../../cad_library';

export const SaveModelWithNameModal: FC<{ showModalSave: Function }> = ({
  showModalSave,
}) => {
  const [name, setName] = useState('');
  const { user } = useAuth0();
  const canvas = useSelector(canvasStateSelector);
  const unit = useSelector(unitSelector);
  const { execQuery2 } = useDynamoDBQuery();
  const dispatch = useDispatch();

  const saveModelInFauna = async (
    faunaClient: Client,
    faunaQuery: typeof fql,
    modelToSave: DynamoDBCadModel,
  ) => {
    const response = await faunaClient
      .query(
        faunaQuery`CadModels.create(${modelToSave})`
      )
      .catch(
        (err: {
          name: any;
          message: any;
          errors: () => { description: any }[];
        }) => {
          dispatch(setLoadingSpinner(false))
          toast.error(
            'ERROR! Model not saved.',
          );
          dispatch(setMessageInfoModal('Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.'));
          dispatch(setIsAlertInfoModal(false));
          dispatch(setShowInfoModal(true));
        },
      );
    return (response as QuerySuccess<any>).data;
  };

  const flattenComponents = (components: ComponentEntity[]): ComponentEntity[] => {
    let flatList: ComponentEntity[] = [];
    components.forEach((component) => {
      if (component.type === 'GROUP' && component.children) {
        flatList = [...flatList, ...flattenComponents(component.children)];
      } else {
        flatList.push(component);
      }
    });
    return flatList;
  };

  const saveModel = async () => {
    const componentsToSave = flattenComponents(canvas.components);
    const model = JSON.stringify({ components: componentsToSave, unit });
    const blobFile = new Blob([model]);
    const modelFile = new File([blobFile], `${name}_model_cadmia.json`, {
      type: 'application/json',
    });
    dispatch(setLoadingSpinner(true))
    uploadFileS3(modelFile).then((res) => {
      if (res) {
        const newModel = {
          id: crypto.randomUUID(),
          name,
          components: res.key,
          owner_id: user?.sub,
          owner: user?.name,
        } as DynamoDBCadModel;
        execQuery2(createOrUpdateModelInDynamoDB, newModel, dispatch).then(() => {
          dispatch(addModel(newModel));
          toast.success('Model has been saved!');
          dispatch(setLoadingSpinner(false))
        });
      }
    });
  };

  const theme = useSelector(ThemeSelector);

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => showModalSave(false)}
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
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all backdrop-blur-xl border ${theme === 'light' ? 'bg-white/90 border-gray-200 text-gray-900' : 'bg-black/80 border-white/10 text-gray-200'}`}>
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6 ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}
                >
                  Save Model to database
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
                      className={`border rounded shadow p-1 w-[80%] text-left ${theme === 'light' ? 'border-black text-black' : 'border-gray-600 bg-gray-700 text-white'}`}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme === 'light' ? 'bg-blue-100 text-blue-900 hover:bg-blue-200 focus-visible:ring-blue-500' : 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus-visible:ring-gray-500'}`}
                    onClick={() => showModalSave(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme === 'light' ? 'bg-blue-100 text-blue-900 hover:bg-blue-200 focus-visible:ring-blue-500' : 'bg-blue-900 text-blue-100 hover:bg-blue-800 focus-visible:ring-blue-500'}`}
                    onClick={
                      name === ''
                        ? () => {
                          toast.error(
                            'You must insert a valid name for the model.',
                          );
                        }
                        : () => {
                          showModalSave(false);
                          saveModel();
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
