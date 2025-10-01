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
        className="relative z-30"
        onClose={() => {}}
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
              <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <IoCloseCircleOutline
                  size={30}
                  className="absolute top-0 right-0 hover:opacity-70 hover:cursor-pointer"
                  onClick={() => showModal(false)}
                />
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Material Details
                </Dialog.Title>
                <hr className="my-4 border-gray-800" />
                <MaterialOptionMainStyle label="Name (required)">
                  <input
                    type="text"
                    value={material.name}
                    disabled
                    className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                  />
                </MaterialOptionMainStyle>
                <MaterialOptionMainStyle label="Color">
                  <ChromePicker color={material.color} />
                </MaterialOptionMainStyle>
                <MaterialOptionMainStyle label="Permeability (required)">
                  <input
                    type="number"
                    step={0.00001}
                    value={material.permeability}
                    disabled
                    className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                  />
                </MaterialOptionMainStyle>
                <MaterialOptionMainStyle label="Tangent Delta Permeability">
                  <input
                    type="number"
                    step={0.00001}
                    value={material.tangent_delta_permeability}
                    disabled
                    className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                  />
                </MaterialOptionMainStyle>
                {material.custom_permeability && (
                  <MaterialOptionMainStyle label="Custom Permeability">
                    <button
                      className="btn w-[59%] h-[2rem] min-h-[2rem] hover:cursor-pointer hover:opacity-70"
                      onClick={() => setShowModalCustomPermeability(true)}
                    >
                      VIEW
                    </button>
                  </MaterialOptionMainStyle>
                )}
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
                <MaterialOptionMainStyle label="Permittivity (required)">
                  <input
                    type="number"
                    step={0.00001}
                    value={material.permittivity}
                    disabled
                    className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                  />
                </MaterialOptionMainStyle>
                <MaterialOptionMainStyle label="Tangent Delta Permittivity">
                  <input
                    type="number"
                    step={0.00001}
                    value={material.tangent_delta_permittivity}
                    disabled
                    className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                  />
                </MaterialOptionMainStyle>
                {material.custom_permittivity && (
                  <MaterialOptionMainStyle label="Custom Permittivity">
                    <button
                      className="btn w-[59%] h-[2rem] min-h-[2rem] hover:cursor-pointer hover:opacity-70"
                      onClick={() => setShowModalCustomPermittivity(true)}
                    >
                      VIEW
                    </button>
                  </MaterialOptionMainStyle>
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
                <MaterialOptionMainStyle label="Conductivity (required)">
                  <input
                    type="number"
                    step={0.00001}
                    value={material.conductivity}
                    disabled
                    className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                  />
                </MaterialOptionMainStyle>
                <MaterialOptionMainStyle label="Tangent Delta Conductivity">
                  <input
                    type="number"
                    step={0.00001}
                    value={material.tangent_delta_conductivity}
                    disabled
                    className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                  />
                </MaterialOptionMainStyle>
                {material.custom_conductivity && (
                  <MaterialOptionMainStyle label="Custom Conductivity">
                    <button
                      className="btn w-[59%] h-[2rem] min-h-[2rem] hover:cursor-pointer hover:opacity-70"
                      onClick={() => setShowModalCustomConductivity(true)}
                    >
                      VIEW
                    </button>
                  </MaterialOptionMainStyle>
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
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <label className="ml-2 text-sm w-[40%]">{label}:</label>
        {children}
      </div>
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
