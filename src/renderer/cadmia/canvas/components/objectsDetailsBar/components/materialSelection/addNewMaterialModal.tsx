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
import { createOrUpdateMaterialDynamoDB } from '../../../../../../dynamoDB/MaterialsApis';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { ThemeSelector } from '../../../../../../esymia/store/tabsAndMenuItemsSlice';

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

export const AddNewMaterialModal: FC<{
  showModal: Function;
  updateMaterials: Function;
}> = ({ showModal, updateMaterials }) => {
  const { execQuery2 } = useDynamoDBQuery();
  const { user } = useAuth0();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#333');
  const [permeability, setPermeability] = useState<number | undefined>(
    undefined,
  );
  const [tangentDeltaPermeability, setTangentDeltaPermeability] = useState<
    number | undefined
  >(undefined);
  const [customPermeability, setCustomPermeability] =
    useState<CustomMaterialAttribute>({ frequencies: [], values: [] });
  const [permittivity, setPermittivity] = useState<number | undefined>(
    undefined,
  );
  const [tangentDeltaPermittivity, setTangentDeltaPermittivity] = useState<
    number | undefined
  >(undefined);
  const [customPermittivity, setCustomPermittivity] =
    useState<CustomMaterialAttribute>({ frequencies: [], values: [] });
  const [conductivity, setConductivity] = useState<number | undefined>(
    undefined,
  );
  const [tangentDeltaConductivity, setTangentDeltaConductivity] = useState<
    number | undefined
  >(undefined);
  const [customConductivity, setCustomConductivity] =
    useState<CustomMaterialAttribute>({ frequencies: [], values: [] });
  const [valueErrorMessage, setValueErrorMessage] = useState<
    string | undefined
  >(undefined);
  const [saveMaterialFlag, setSaveMaterialFlag] = useState(false);
  const [showModalCustomPermeability, setShowModalCustomPermeability] =
    useState(false);
  const [showModalCustomPermittivity, setShowModalCustomPermittivity] =
    useState(false);
  const [showModalCustomConductivity, setShowModalCustomConductivity] =
    useState(false);
  const theme = useSelector(ThemeSelector);

  const checkForValueErrors = () => {
    let error = undefined;
    if (name === '') {
      error = 'You must insert a valid name for the new material.';
    } else if (permeability === undefined) {
      error = 'You must insert a permeability value.';
    } else if (permittivity === undefined) {
      error = 'You must insert a permittivity value.';
    } else if (conductivity === undefined) {
      error = 'You must insert a conductivity value.';
    }

    if (error !== undefined) {
      setValueErrorMessage(error);
      setSaveMaterialFlag(false);
    } else {
      setValueErrorMessage(error);
      setSaveMaterialFlag(true);
    }
  };

  const adjustNumberFormatForThis = (stringValue: string) => {
    return !Number.isNaN(parseFloat(stringValue))
      ? parseFloat(stringValue)
      : undefined;
  };

  useEffect(() => {
    if (valueErrorMessage) {
      toast.error(valueErrorMessage);
      setValueErrorMessage(undefined);
    }
  }, [valueErrorMessage]);

  useEffect(() => {
    if (saveMaterialFlag) {
      setSaveMaterialFlag(false);
      execQuery2(
        createOrUpdateMaterialDynamoDB,
        {
          id: crypto.randomUUID(),
          name: name,
          ownerEmail: (process.env.APP_VERSION === 'demo') ? user?.name : user?.email,
          color: color,
          permeability: permeability,
          tangent_delta_permeability: tangentDeltaPermeability,
          custom_permeability:
            customPermeability.frequencies.length !== 0
              ? customPermeability
              : undefined,
          permittivity: permittivity,
          tangent_delta_permittivity: tangentDeltaPermittivity,
          custom_permittivity:
            customPermittivity.frequencies.length !== 0
              ? customPermittivity
              : undefined,
          conductivity: conductivity,
          tangent_delta_conductivity: tangentDeltaConductivity,
          custom_conductivity:
            customConductivity.frequencies.length !== 0
              ? customConductivity
              : undefined,
        } as MaterialDynamoDB,
        dispatch,
      ).then(() => {
        toast.success('Material successfully saved!');
        updateMaterials().then(() => { showModal(false); });
      });
    }
  }, [saveMaterialFlag]);

  return (
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
                    Add New Material
                  </Dialog.Title>
                  <IoCloseCircleOutline
                    size={24}
                    className={`cursor-pointer transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => showModal(false)}
                  />
                </div>

                <div className="space-y-4">
                  <MaterialOptionMainStyle label="Name (required)">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                    />
                  </MaterialOptionMainStyle>

                  <MaterialOptionMainStyle label="Color">
                    <div className="mt-1">
                      <ChromePicker
                        color={color}
                        onChangeComplete={(color) => setColor(color.hex)}
                        disableAlpha={true}
                        styles={{ default: { picker: { boxShadow: 'none', border: '1px solid #e5e7eb', borderRadius: '0.5rem' } } }}
                      />
                    </div>
                  </MaterialOptionMainStyle>

                  <div className="grid grid-cols-2 gap-4">
                    <MaterialOptionMainStyle label="Permeability (required)">
                      <input
                        type="number"
                        step={0.00001}
                        value={permeability}
                        required
                        onChange={(e) => setPermeability(adjustNumberFormatForThis(e.target.value))}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                      />
                    </MaterialOptionMainStyle>
                    <MaterialOptionMainStyle label="Tan δ (Permeability)">
                      <input
                        type="number"
                        step={0.00001}
                        value={tangentDeltaPermeability}
                        onChange={(e) => setTangentDeltaPermeability(adjustNumberFormatForThis(e.target.value))}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                      />
                    </MaterialOptionMainStyle>
                  </div>

                  <div className="flex justify-end">
                    <button
                      className={`text-xs font-medium ${theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-300'}`}
                      onClick={() => setShowModalCustomPermeability(true)}
                    >
                      {customPermeability.frequencies.length === 0 ? '+ Set Custom Permeability' : 'Edit Custom Permeability'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <MaterialOptionMainStyle label="Permittivity (required)">
                      <input
                        type="number"
                        step={0.00001}
                        value={permittivity}
                        required
                        onChange={(e) => setPermittivity(adjustNumberFormatForThis(e.target.value))}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                      />
                    </MaterialOptionMainStyle>
                    <MaterialOptionMainStyle label="Tan δ (Permittivity)">
                      <input
                        type="number"
                        step={0.00001}
                        value={tangentDeltaPermittivity}
                        onChange={(e) => setTangentDeltaPermittivity(adjustNumberFormatForThis(e.target.value))}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                      />
                    </MaterialOptionMainStyle>
                  </div>

                  <div className="flex justify-end">
                    <button
                      className={`text-xs font-medium ${theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-300'}`}
                      onClick={() => setShowModalCustomPermittivity(true)}
                    >
                      {customPermittivity.frequencies.length === 0 ? '+ Set Custom Permittivity' : 'Edit Custom Permittivity'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <MaterialOptionMainStyle label="Conductivity (required)">
                      <input
                        type="number"
                        step={0.00001}
                        value={conductivity}
                        required
                        onChange={(e) => setConductivity(adjustNumberFormatForThis(e.target.value))}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                      />
                    </MaterialOptionMainStyle>
                    <MaterialOptionMainStyle label="Tan δ (Conductivity)">
                      <input
                        type="number"
                        step={0.00001}
                        value={tangentDeltaConductivity}
                        onChange={(e) => setTangentDeltaConductivity(adjustNumberFormatForThis(e.target.value))}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                      />
                    </MaterialOptionMainStyle>
                  </div>

                  <div className="flex justify-end">
                    <button
                      className={`text-xs font-medium ${theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-300'}`}
                      onClick={() => setShowModalCustomConductivity(true)}
                    >
                      {customConductivity.frequencies.length === 0 ? '+ Set Custom Conductivity' : 'Edit Custom Conductivity'}
                    </button>
                  </div>
                </div>

                {showModalCustomPermeability && (
                  <ModalCustomAttributes
                    showModalCustomAttributes={showModalCustomPermeability}
                    setShowModalCustomAttributes={setShowModalCustomPermeability}
                    attribute={'Custom Permeability'}
                    setCustomAttribute={setCustomPermeability}
                    customAttribute={customPermeability}
                  />
                )}
                {showModalCustomPermittivity && (
                  <ModalCustomAttributes
                    showModalCustomAttributes={showModalCustomPermittivity}
                    setShowModalCustomAttributes={setShowModalCustomPermittivity}
                    attribute={'Custom Permittivity'}
                    setCustomAttribute={setCustomPermittivity}
                    customAttribute={customPermittivity}
                  />
                )}
                {showModalCustomConductivity && (
                  <ModalCustomAttributes
                    showModalCustomAttributes={showModalCustomConductivity}
                    setShowModalCustomAttributes={setShowModalCustomConductivity}
                    attribute={'Custom Conductivity'}
                    setCustomAttribute={setCustomConductivity}
                    customAttribute={customConductivity}
                  />
                )}

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${theme === 'light' ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-gray-300 bg-white/10 hover:bg-white/20'}`}
                    onClick={() => showModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all focus:outline-none"
                    onClick={() => checkForValueErrors()}
                  >
                    Add Material
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

const MaterialOptionMainStyle: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => {
  const theme = useSelector(ThemeSelector);
  return (
    <div className="flex flex-col gap-1">
      <label className={`text-xs font-medium ml-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{label}</label>
      {children}
    </div>
  );
};
