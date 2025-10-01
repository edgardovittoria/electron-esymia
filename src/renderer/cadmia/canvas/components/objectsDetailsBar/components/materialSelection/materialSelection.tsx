import { Listbox, Transition } from '@headlessui/react';
import { FC, Fragment, useEffect, useState } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useMaterials } from './useMaterials';
import { AddNewMaterialModal } from './addNewMaterialModal';
import { useAuth0 } from '@auth0/auth0-react';
import { CgDetailsMore } from 'react-icons/cg';
import { useCadmiaModalityManager } from '../../../cadmiaModality/useCadmiaModalityManager';
import { Material } from '../../../../../../cad_library';
import { MdCircle } from 'react-icons/md';
import { TbInfoSquareRounded, TbInfoSquareRoundedFilled } from 'react-icons/tb';
import { MaterialDetailsModal } from './MaterialDetailsModal';
import { ManageMaterialModal } from './manageMaterialModal';

interface MaterialSelectionProps {
  defaultMaterial?: Material;
}

export const MaterialSelection: FC<MaterialSelectionProps> = ({
  defaultMaterial,
}) => {
  const { availableMaterials, updateMaterials, deleteMaterial } = useMaterials();
  const { objectsDetailsOptsBasedOnModality } = useCadmiaModalityManager();
  const [showManageMaterialModal, setShowManageMaterialModal] = useState(false);
  const [materialSelected, setMaterialSelected] = useState<
    Material | undefined
  >(defaultMaterial);
  const { user } = useAuth0();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);

  useEffect(() => {
    setMaterialSelected(defaultMaterial);
  }, [defaultMaterial]);

  return (
    <div className="flex flex-col">
      <h6 className="text-black mt-[10px] text-sm font-bold">Material</h6>
      <hr className="border-black mb-2 mt-1" />
      <div className="flex flex-row items-center gap-4">
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
                {defaultMaterial && availableMaterials.filter(am => am.id === defaultMaterial.id).length > 0 ? defaultMaterial.name : 'UNDEFINED'}
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
                className={`absolute border-2 border-amber-400 max-h-[120px] w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
              >
                {user ? (
                  availableMaterials.map((material, materialIdx) => (
                    <Listbox.Option
                      key={materialIdx}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-5 pr-4 ${
                          (active || materialSelected?.name === material.name)
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-gray-900'
                        }`
                      }
                      value={material}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`flex flex-row gap-2 items-center truncate ${
                              (selected || materialSelected?.name === material.name) ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            <MdCircle color={material.color}/>
                            <span>{material.name}</span>
                          </span>
                          {(selected || materialSelected?.name === material.name) ? (
                            <span className="absolute inset-y-0 right-3 flex items-center pl-3 text-amber-600">
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
        <div className="tooltip tooltip-left" data-tip="Material Details">
          <TbInfoSquareRounded
            color="black"
            className="hover:cursor-pointer w-5 h-5 "
            onClick={() => {
              setShowDetails(!showDetails);
            }}
          />
        </div>
      </div>
      {/* {showDetails && materialSelected && (
        <div className="overflow-scroll max-h-[200px] justify-between mt-2 px-2">
          {Object.entries(materialSelected).map(([p, value]) => (
            <>
              {p !== 'coll' && p !== 'ts' && p !== 'ttl' && p !== "id" && (
                <div className="flex flex-row justify-between text-sm leading-tight">
                  <div className="text-black text-[12px]">{p}:</div>
                  <div className="text-black text-[12px]">{value}</div>
                </div>
              )}
            </>
          ))}
        </div>
      )} */}
      {user && (
        <button
          type="button"
          className="rounded bg-black hover:opacity-75 hover:cursor-pointer text-sm capitalize shadow p-2 mt-5 w-full"
          onClick={() => setShowManageMaterialModal(true)}
        >
          Manage Material
        </button>
      )}
      {showManageMaterialModal && !showNewMaterialModal && (
        <ManageMaterialModal
          showModal={setShowManageMaterialModal}
          setShowDetails={setShowDetails}
          showDetails={showDetails}
          setShowNewMaterialModal={setShowNewMaterialModal}
          availableMaterials={availableMaterials}
          deleteMaterial={deleteMaterial}
        />
      )}
      {showNewMaterialModal && (
        <AddNewMaterialModal
          showModal={setShowNewMaterialModal}
          updateMaterials={updateMaterials}
        />
      )}
      {showDetails && (
        <MaterialDetailsModal showModal={setShowDetails} material={materialSelected as Material}/>
      )}
    </div>
  );
};
