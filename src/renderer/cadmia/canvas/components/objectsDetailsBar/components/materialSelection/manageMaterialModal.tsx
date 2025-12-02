import { Dialog, Transition } from '@headlessui/react';
import { FC, Fragment, ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChromePicker } from 'react-color';
import ModalCustomAttributes, {
  CustomMaterialAttribute,
} from './ModalCustomAttributes';
import { useFaunaQuery } from '../../../../../../esymia/faunadb/hook/useFaunaQuery';
import { Client, fql } from 'fauna';
import { useDynamoDBQuery } from '../../../../../../dynamoDB/hook/useDynamoDBQuery';
import {
  createOrUpdateMaterialDynamoDB,
  deleteMaterialDynamoDB,
} from '../../../../../../dynamoDB/MaterialsApis';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import {
  ComponentEntity,
  componentseSelector,
  Material,
} from '../../../../../../cad_library';
import { MdCircle } from 'react-icons/md';
import { PiTrash } from 'react-icons/pi';
import { useMaterials } from './useMaterials';
import { AddNewMaterialModal } from './addNewMaterialModal';
import { TbInfoSquareRounded } from 'react-icons/tb';
import { IoCloseCircleOutline } from 'react-icons/io5';
import InfoModal from '../../../../../../esymia/application/sharedModals/InfoModal';
import {
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal,
  ThemeSelector,
} from '../../../../../../esymia/store/tabsAndMenuItemsSlice';
import { ModelsSelector } from '../../../../../store/modelSlice';
import { s3 } from '../../../../../aws/s3Config';
import { DynamoDBCadModel } from '../../../../../../cad_library/components/dynamodb/api/modelsAPIs';
import { S3 } from 'aws-sdk';

export type MaterialDynamoDB = {
  id: string;
  name: string;
  color: string;
  permeability: number;
  tangent_delta_permeability?: number;
  custom_permeability?: CustomMaterialAttribute;
  permittivity: number;
  tangent_delta_permittivity?: number;
  custom_permittivity?: CustomMaterialAttribute;
  conductivity: number;
  tangent_delta_conductivity?: number;
  custom_conductivity?: CustomMaterialAttribute;
  ownerEmail: string;
};

export const ManageMaterialModal: FC<{
  showModal: Function;
  setShowDetails: Function;
  setShowNewMaterialModal: Function;
  showDetails: boolean;
  availableMaterials: Material[];
  deleteMaterial: Function;
}> = ({
  showModal,
  setShowDetails,
  showDetails,
  setShowNewMaterialModal,
  availableMaterials,
  deleteMaterial,
}) => {
    const models = useSelector(ModelsSelector);
    const dispatch = useDispatch();
    const theme = useSelector(ThemeSelector);

    async function isMaterialUsed(
      models: DynamoDBCadModel[],
      m: Material,
      s3: S3,
    ) {
      // 1. Mappa ogni modello a una Promise che scarica e controlla i componenti
      const usageChecks = models.map((model) => {
        const params = {
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
          Key: model.components,
        };

        // Chiama s3.getObject e la converte in una Promise con .promise()
        return s3
          .getObject(params)
          .promise()
          .then((data: any) => {
            // Logica di controllo all'interno del .then()
            const parsedModel = JSON.parse(data.Body?.toString() as string) as {
              components: ComponentEntity[];
              unit: string;
            };

            // Restituisce true se il materiale è trovato, altrimenti false
            return parsedModel.components.some((c) => c.material?.id === m.id);
          })
          .catch((err: any) => {
            console.error('Errore nel recupero da S3:', err);
            return false; // Gestisce l'errore come "non in uso" per sicurezza o logica specifica
          });
      });

      // 2. Aspetta che TUTTE le Promise siano risolte
      const results = await Promise.all(usageChecks);

      // 3. Controlla se almeno uno dei risultati è TRUE
      const isMaterialUsed = results.some((isUsed) => isUsed === true);

      // A questo punto puoi eseguire la logica di cancellazione
      if (isMaterialUsed) {
        // Non cancellare
        console.log('Materiale in uso, non cancellabile.');
        return true;
      } else {
        // Cancellare il materiale
        console.log('Materiale non in uso, cancellabile.');
        return false;
      }
    }

    return (
      <>
        <Transition appear show={true} as={Fragment}>
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
                  <Dialog.Panel className={`w-full max-w-xl transform overflow-hidden rounded-2xl backdrop-blur-md border p-6 text-left align-middle shadow-xl transition-all ${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <Dialog.Title
                        as="h3"
                        className={`text-lg font-medium leading-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                      >
                        Manage Materials
                      </Dialog.Title>
                      <IoCloseCircleOutline
                        size={24}
                        className={`cursor-pointer transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => showModal(false)}
                      />
                    </div>

                    <div className={`max-h-[300px] overflow-y-auto pr-2 scrollbar-thin space-y-2 ${theme === 'light' ? 'scrollbar-thumb-gray-300' : 'scrollbar-thumb-gray-600'}`}>
                      {availableMaterials.map((m, index) => {
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-row items-center justify-between p-3 rounded-lg transition-colors border ${theme === 'light' ? 'bg-white/50 hover:bg-gray-100 border-gray-100' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}
                          >
                            <div className="flex flex-row gap-3 items-center">
                              <MdCircle color={m.color} className="w-4 h-4 shadow-sm rounded-full" />
                              <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>{m.name}</span>
                            </div>
                            <div className="flex flex-row items-center gap-3">
                              <div className="tooltip tooltip-left" data-tip="Details">
                                <TbInfoSquareRounded
                                  className={`w-5 h-5 cursor-pointer transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
                                  onClick={() => {
                                    setShowDetails(!showDetails);
                                  }}
                                />
                              </div>
                              <div className="tooltip tooltip-left" data-tip="Delete">
                                <PiTrash
                                  className={`w-5 h-5 cursor-pointer transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                  onClick={async () => {
                                    let materialUsed = await isMaterialUsed(models, m, s3)
                                    if (!materialUsed) {
                                      let confirm = window.confirm(
                                        `Are You sure to delete ${m.name} ?`,
                                      );
                                      confirm && deleteMaterial(m.id);
                                    } else {
                                      dispatch(
                                        setMessageInfoModal(
                                          'Material used in a model, you can not delete it!',
                                        ),
                                      );
                                      dispatch(setIsAlertInfoModal(false));
                                      dispatch(setShowInfoModal(true));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all focus:outline-none flex items-center gap-2"
                        onClick={() => setShowNewMaterialModal(true)}
                      >
                        <span>+</span> Add New Material
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  };
