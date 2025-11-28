import { Dialog, Transition } from '@headlessui/react';
import { FC, Fragment, ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChromePicker } from 'react-color';
import ModalCustomAttributes, {
  CustomMaterialAttribute,
  ModalCustomAttributesProps,
} from './ModalCustomAttributes';
import { useFaunaQuery } from '../../../../../../esymia/faunadb/hook/useFaunaQuery';
import { Client, fql } from 'fauna';
import { useDynamoDBQuery } from '../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateMaterialDynamoDB } from '../../../../../../dynamoDB/MaterialsApis';
import { useDispatch } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { Material } from '../../../../../../cad_library';
import { IoCloseCircleOutline } from 'react-icons/io5';

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

export const MaterialDetailsModal: FC<{
  showModal: Function;
  material: Material;
}> = ({ showModal, material }) => {
  const [showModalCustomPermeability, setShowModalCustomPermeability] =
    useState(false);
  const [showModalCustomPermittivity, setShowModalCustomPermittivity] =
    useState(false);
  const [showModalCustomConductivity, setShowModalCustomConductivity] =
    useState(false);
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => showModal(false)}
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
              <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Material Details
                  </Dialog.Title>
                  <IoCloseCircleOutline
                    size={24}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-colors"
                    onClick={() => showModal(false)}
                  />
                </div>

                <div className="space-y-3">
                  <MaterialOptionMainStyle label="Name">
                    <input
                      type="text"
                      value={material.name}
                      disabled
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                  </MaterialOptionMainStyle>
                  <MaterialOptionMainStyle label="Color">
                    <div className="border border-gray-200 dark:border-white/10 rounded-lg p-1 inline-block">
                      <div style={{ backgroundColor: material.color, width: '30px', height: '30px', borderRadius: '4px' }} />
                    </div>
                  </MaterialOptionMainStyle>

                  <div className="grid grid-cols-2 gap-4">
                    <MaterialOptionMainStyle label="Permeability">
                      <input
                        type="number"
                        value={material.permeability}
                        disabled
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </MaterialOptionMainStyle>
                    <MaterialOptionMainStyle label="Tan δ (Permeability)">
                      <input
                        type="number"
                        value={material.tangent_delta_permeability || 0}
                        disabled
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </MaterialOptionMainStyle>
                  </div>

                  {material.custom_permeability && (
                    <div className="flex justify-end">
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        onClick={() => setShowModalCustomPermeability(true)}
                      >
                        View Custom Permeability
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <MaterialOptionMainStyle label="Permittivity">
                      <input
                        type="number"
                        value={material.permittivity}
                        disabled
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </MaterialOptionMainStyle>
                    <MaterialOptionMainStyle label="Tan δ (Permittivity)">
                      <input
                        type="number"
                        value={material.tangent_delta_permittivity || 0}
                        disabled
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </MaterialOptionMainStyle>
                  </div>

                  {material.custom_permittivity && (
                    <div className="flex justify-end">
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        onClick={() => setShowModalCustomPermittivity(true)}
                      >
                        View Custom Permittivity
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <MaterialOptionMainStyle label="Conductivity">
                      <input
                        type="number"
                        value={material.conductivity}
                        disabled
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </MaterialOptionMainStyle>
                    <MaterialOptionMainStyle label="Tan δ (Conductivity)">
                      <input
                        type="number"
                        value={material.tangent_delta_conductivity || 0}
                        disabled
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </MaterialOptionMainStyle>
                  </div>

                  {material.custom_conductivity && (
                    <div className="flex justify-end">
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        onClick={() => setShowModalCustomConductivity(true)}
                      >
                        View Custom Conductivity
                      </button>
                    </div>
                  )}
                </div>

                {showModalCustomPermeability && (
                  <ModalCustomAttributesShow
                    showModalCustomAttributes={showModalCustomPermeability}
                    setShowModalCustomAttributes={
                      setShowModalCustomPermeability
                    }
                    attribute={'Custom Permeability'}
                    customAttribute={material.custom_permeability}
                  />
                )}
                {showModalCustomPermittivity && (
                  <ModalCustomAttributesShow
                    showModalCustomAttributes={showModalCustomPermittivity}
                    setShowModalCustomAttributes={
                      setShowModalCustomPermittivity
                    }
                    attribute={'Custom Permittivity'}
                    customAttribute={material.custom_permittivity}
                  />
                )}
                {showModalCustomConductivity && (
                  <ModalCustomAttributesShow
                    showModalCustomAttributes={showModalCustomConductivity}
                    setShowModalCustomAttributes={
                      setShowModalCustomConductivity
                    }
                    attribute={'Custom Conductivity'}
                    customAttribute={material.custom_conductivity}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const MaterialOptionMainStyle: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">{label}</label>
      {children}
    </div>
  );
};

export interface ModalCustomAttributesShowProps {
  showModalCustomAttributes: boolean;
  setShowModalCustomAttributes: (v: boolean) => void;
  attribute: string;
  customAttribute?: CustomMaterialAttribute;
}

const ModalCustomAttributesShow: React.FC<ModalCustomAttributesShowProps> = ({
  showModalCustomAttributes,
  setShowModalCustomAttributes,
  attribute,
  customAttribute,
}) => {
  function onModalClose() {
    setShowModalCustomAttributes(false);
  }

  return (
    <Transition appear show={showModalCustomAttributes} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onModalClose}>
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
          <div className="flex items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl h-fit absolute top-1/2 -translate-y-1/2 bg-white transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
                {customAttribute && customAttribute.frequencies.length > 0 && (
                  <>
                    <h5>{attribute}</h5>
                    <hr className="mt-4" />
                    <div className={`flex max-h-[250px] overflow-scroll`}>
                      <table className="w-1/2 mt-1 ml-3">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Frequency</th>
                            <th>Values(Re+Im)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customAttribute.frequencies.map((value, index) => {
                            return (
                              <tr key={index}>
                                <td>{index}</td>
                                <td>{value}</td>
                                <td>
                                  {customAttribute.values[index].Re} +{' '}
                                  {customAttribute.values[index].Im}i
                                </td>
                                <td></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
