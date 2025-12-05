import { useAuth0 } from '@auth0/auth0-react';
import { Dialog, Transition } from '@headlessui/react';
import { FC, useEffect, useState, Fragment } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import AWS from 'aws-sdk';
import { CheckIcon } from '@heroicons/react/20/solid';
import { useDynamoDBQuery } from '../../../dynamoDB/hook/useDynamoDBQuery';
import { getModelsByOwnerDynamoDB } from '../../../dynamoDB/modelsApis';
import { convertFromDynamoDBFormat } from '../../../dynamoDB/utility/formatDynamoDBData';
import { s3 } from '../../../esymia/aws/s3Config';
import { ThemeSelector } from '../../../esymia/store/tabsAndMenuItemsSlice';
import { ComponentEntity } from '../model';
import { ImportActionParamsObject } from './importTypes';
import { DynamoDBCadModel } from '../dynamodb/api/modelsAPIs';

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
                    if (res.Items) {
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
                    importActionParams.projectName = selectedModel?.name;
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
                                <Dialog.Panel className={`w-full max-w-3xl transform overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${theme === 'light'
                                    ? 'bg-white/90 border-white/40 shadow-gray-200/50'
                                    : 'bg-black/80 border-white/10 shadow-black/50'
                                    } p-6 text-left align-middle`}>
                                    <Dialog.Title
                                        as="h3"
                                        className={`text-xl font-semibold leading-6 mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                                    >
                                        Select model to load
                                    </Dialog.Title>
                                    <div className={`rounded-xl border overflow-hidden flex flex-col max-h-[400px] relative ${theme === 'light' ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-white/5'}`}>
                                        <div className={`grid grid-cols-12 gap-4 items-center p-4 border-b text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'border-gray-200 text-gray-500' : 'border-white/10 text-gray-400'}`}>
                                            <div className="col-span-1 flex justify-center">
                                                <CheckIcon className="w-4 h-4 opacity-0" />
                                            </div>
                                            <span className="col-span-3">Name</span>
                                            <span className="col-span-5">Owner</span>
                                            <span className="col-span-3">Type</span>
                                        </div>

                                        <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                            {models.length === 0 ? (
                                                <div className={`p-8 text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {loadingMessage}
                                                </div>
                                            ) : (
                                                models.map((model) => {
                                                    const isSelected = selectedModel?.name === model.name;
                                                    return (
                                                        <div
                                                            key={model.name}
                                                            data-testid="modelChoose"
                                                            onClick={() => setSelectedModel(model)}
                                                            className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group ${isSelected
                                                                ? (theme === 'light' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/20 border border-blue-500/30')
                                                                : (theme === 'light' ? 'hover:bg-white border border-transparent hover:shadow-sm' : 'hover:bg-white/5 border border-transparent')
                                                                }`}
                                                        >
                                                            <div className="col-span-1 flex justify-center">
                                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                                    ? 'bg-blue-500 border-blue-500'
                                                                    : (theme === 'light' ? 'border-gray-300 group-hover:border-blue-400' : 'border-gray-600 group-hover:border-blue-400')
                                                                    }`}>
                                                                    {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                                                                </div>
                                                            </div>
                                                            <span className={`font-medium text-sm col-span-3 truncate ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>{model.name}</span>
                                                            <span className={`text-sm col-span-5 truncate ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{model.owner}</span>
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit col-span-3 ${model.bricks ? 'bg-green-100 text-green-600' : 'bg-violet-100 text-violet-600'}`}>
                                                                {model.bricks ? 'Ris' : 'Standard'}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${theme === 'light'
                                                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                            onClick={() => showModalLoad(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-6 py-2 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-200 ${selectedModel === undefined
                                                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                                }`}
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
                                            Load Model
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
