import { useAuth0 } from '@auth0/auth0-react';
import { Dialog, Transition } from '@headlessui/react';
import { FC, useEffect, useState, Fragment } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { ImportActionParamsObject } from '../../importFunctions/importFunctions';
import { DynamoDBCadModel, getModelsByOwner } from '../api/modelsAPIs';
import { ComponentEntity } from '../../model/componentEntity/componentEntity';
import AWS from 'aws-sdk';
import { useFaunaQuery } from '../../../../esymia/faunadb/hook/useFaunaQuery';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../dynamoDB/hook/useDynamoDBQuery';
import { getModelsByOwnerDynamoDB } from '../../../../dynamoDB/modelsApis';
import { convertFromDynamoDBFormat } from '../../../../dynamoDB/utility/formatDynamoDBData';
import { s3 } from '../../../../cadmia/aws/s3Config';

export const ImportModelFromDBModal: FC<{
  showModalLoad: Function;
  importActionParams: ImportActionParamsObject;
  importAction: (params: ImportActionParamsObject) => any;
  bucket: string;
}> = ({
  showModalLoad,
  importActionParams,
  importAction,
  bucket,
}) => {
  const [models, setModels] = useState<DynamoDBCadModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<DynamoDBCadModel | undefined>(
    undefined,
  );
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const { user } = useAuth0();
  const { execQuery2 } = useDynamoDBQuery();
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector)

  useEffect(() => {
    user !== undefined &&
      user.sub !== undefined &&
      execQuery2(getModelsByOwnerDynamoDB, user.sub, dispatch).then((res) => {
        let mods: any[] = []
        if(res.Items){
          res.Items.forEach((i: any) => mods.push(convertFromDynamoDBFormat(i)))
        }
        setModels(mods);
        models.length === 0 &&
          setLoadingMessage('No models to load form database.');
      });
  }, []);

  const getFileS3 = async (
    s3Config: AWS.S3,
    bucket: string,
    fileKey: string,
    importActionParams: ImportActionParamsObject,
    importAction: (params: ImportActionParamsObject) => any,
  ) => {
    try {
      const params = {
        Bucket: bucket,
        Key: fileKey,
      };
      s3Config.getObject(params, (err, data) => {
        if (err) {
          console.log(err);
        }
        let model = JSON.parse(data.Body?.toString() as string) as {
          components: ComponentEntity[];
          unit: string;
        };
        importActionParams.canvas.components = model.components;
        importActionParams.unit = model.unit;
        importActionParams.modelS3 = selectedModel?.components;
        importActionParams.bricks = selectedModel?.bricks
        importAction(importActionParams);
      });
    } catch (exception) {
      console.log(exception);
      return [] as ComponentEntity[];
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => showModalLoad(false)}
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
              <Dialog.Panel className={`w-full max-w-3xl transform overflow-hidden rounded-2xl ${theme === 'light' ? 'bg-white' : 'bg-bgColorDark2 text-textColorDark'} p-6 text-left align-middle shadow-xl transition-all`}>
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6 ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}
                >
                  Select model to load
                </Dialog.Title>
                <div className="py-2 mt-3 px-2 border border-gray-300 z-20 rounded-xl flex flex-col gap-2 max-h-[400px] overflow-y-scroll relative">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <CheckIcon className="col-span-1 text-secondaryColor"/>
                    <span className="font-semibold col-span-3">name</span>
                    <span className="font-semibold col-span-5">owner</span>
                    <span className="font-semibold col-span-3">type</span>
                  </div>

                  <hr />
                  {models.length === 0 ? (
                    <div>{loadingMessage}</div>
                  ) : (
                    models.map((model) => {
                      return (
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <input
                            key={model.name}
                            type="radio"
                            data-testid="modelChoose"
                            value={model.name}
                            name="modelSelection"
                            onChange={() => setSelectedModel(model)}
                            className='col-span-1'
                          />
                          <span className="font-semibold text-sm col-span-3">{model.name}</span>
                          <span className="text-sm col-span-5">{model.owner}</span>
                          <span className="text-sm col-span-3">{model.bricks ? 'Ris' : 'Standard'}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent ${theme === 'light' ? 'bg-blue-100 text-blue-900' : 'bg-secondaryColorDark text-textColor'} px-4 py-2 text-sm font-medium  hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                    onClick={() => showModalLoad(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent ${theme === 'light' ? 'bg-blue-100 text-blue-900' : 'bg-secondaryColorDark text-textColor'} px-4 py-2 text-sm font-medium hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                    onClick={
                      selectedModel === undefined
                        ? () => {
                            toast.error('You must select a model to load.');
                          }
                        : () => {
                            getFileS3(
                              s3,
                              bucket,
                              selectedModel.components,
                              importActionParams,
                              importAction,
                            ).then(() => {
                              showModalLoad(false);
                              toast.success('Model successfully loaded');
                            });
                          }
                    }
                  >
                    Load
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
