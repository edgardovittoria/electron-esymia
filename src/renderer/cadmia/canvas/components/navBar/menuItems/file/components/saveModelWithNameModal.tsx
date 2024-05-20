import { useAuth0 } from '@auth0/auth0-react';
import { canvasStateSelector, FaunaCadModel, useFaunaQuery } from 'cad-library';
import { FC, Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Transition, Dialog } from '@headlessui/react';
import faunadb from 'faunadb';
import { unitSelector } from '../../../../statusBar/statusBarSlice';
import { uploadFileS3 } from '../../../../../../aws/crud';
import { addModel } from '../../../../../../store/modelSlice';

export const SaveModelWithNameModal: FC<{ showModalSave: Function }> = ({
  showModalSave,
}) => {
  const [name, setName] = useState('');
  const { user } = useAuth0();
  const canvas = useSelector(canvasStateSelector);
  const unit = useSelector(unitSelector);
  const { execQuery } = useFaunaQuery();
  const dispatch = useDispatch();

  const saveModelInFauna = async (
    faunaClient: faunadb.Client,
    faunaQuery: typeof faunadb.query,
    modelToSave: FaunaCadModel,
  ) => {
    const response = await faunaClient
      .query(
        faunaQuery.Create(faunaQuery.Collection('CadModels'), {
          data: {
            ...modelToSave,
          },
        }),
      )
      .catch(
        (err: {
          name: any;
          message: any;
          errors: () => { description: any }[];
        }) => {
          console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
          );
          toast.error(
            'ERROR! Model not saved, please check the console log for more details.',
          );
        },
      );
    return response;
  };

  const saveModel = async () => {
    const model = JSON.stringify({ components: canvas.components, unit });
    const blobFile = new Blob([model]);
    const modelFile = new File([blobFile], `${name}.json`, {
      type: 'application/json',
    });

    uploadFileS3(modelFile).then((res) => {
      if (res) {
        const newModel = {
          name,
          components: res.key,
          owner_id: user?.sub,
          owner: user?.name,
        } as FaunaCadModel;
        execQuery(saveModelInFauna, newModel).then((res) => {
          newModel.id = res.ref.id;
          dispatch(addModel(newModel));
          toast.success('Model has been saved!');
        });
      }
    });
  };

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
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
                      className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => showModalSave(false)}
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
