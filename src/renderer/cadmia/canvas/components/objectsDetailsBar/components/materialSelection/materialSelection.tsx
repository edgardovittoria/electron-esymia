import { Listbox, Transition } from '@headlessui/react';
import { Material } from 'cad-library';
import { FC, Fragment, useEffect, useState } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useMaterials } from './useMaterials';
import { AddNewMaterialModal } from './addNewMaterialModal';
import { useAuth0 } from '@auth0/auth0-react';
import { CgDetailsMore } from 'react-icons/cg';
import { useCadmiaModalityManager } from '../../../cadmiaModality/useCadmiaModalityManager';

interface MaterialSelectionProps {
  defaultMaterial?: Material;
}

export const MaterialSelection: FC<MaterialSelectionProps> = ({
  defaultMaterial,
}) => {
  const { availableMaterials, updateMaterials } = useMaterials();
  const { objectsDetailsOptsBasedOnModality } = useCadmiaModalityManager();
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [materialSelected, setMaterialSelected] = useState<
    Material | undefined
  >(defaultMaterial);
  const { user } = useAuth0();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    setMaterialSelected(defaultMaterial)
  }, [defaultMaterial])


  return (
    <div className="flex flex-col">
      <h6 className="text-black mt-[10px] text-sm font-bold">Material</h6>
      <hr className="border-amber-500 mb-2 mt-1" />
      <div className="flex flex-row">
        <Listbox
          value={defaultMaterial}
          onChange={(material) => {
            objectsDetailsOptsBasedOnModality.material.setMaterial(material);
            setMaterialSelected(material);
          }}
        >
          <div className="relative mt-1 w-5/6">
            <Listbox.Button className="relative w-full border-2 border-black cursor-default rounded-lg bg-white py-1 pl-3 x text-left shadow focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
              <span className="block truncate text-black text-xs">
                {defaultMaterial ? defaultMaterial.name : 'UNDEFINED'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={`absolute ${availableMaterials ? 'mt-[-190px]' : 'mt-[-80px]'} border-2 border-amber-400 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
              >
                {user ? (
                  availableMaterials.map((material, materialIdx) => (
                    <Listbox.Option
                      key={materialIdx}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-gray-900'
                        }`
                      }
                      value={material}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                          >
                            {material.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))
                ) : (
                  <Listbox.Option value={undefined}>
                    <span className="text-black p-2">
                      Login to access the available materials
                    </span>
                  </Listbox.Option>
                )}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <CgDetailsMore
          color="black"
          className="hover:cursor-pointer"
          onClick={() => {
            setShowDetails(!showDetails);
          }}
        />
      </div>
      {showDetails && materialSelected && (
        <div className="overflow-scroll justify-between">
          {Object.entries(materialSelected).map(([p, value]) => (
            <div className="flex flex-row justify-between text-sm">
              <div className="text-black">{p}:</div>
              <div className="text-black">{value}</div>
            </div>
          ))}
        </div>
      )}
      {user && (
        <button
          type="button"
          className="rounded bg-gray-500 shadow p-2 mt-[20px] w-full"
          onClick={() => setShowNewMaterialModal(true)}
        >
          New Material
        </button>
      )}
      {showNewMaterialModal && (
        <AddNewMaterialModal
          showModal={setShowNewMaterialModal}
          updateMaterials={updateMaterials}
        />
      )}
    </div>
  );
};
