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
    <div className="flex flex-col gap-2 mt-4">
      <h6 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Material</h6>
      <div className="flex flex-row items-center gap-2">
        <Listbox
          value={defaultMaterial}
          onChange={(material) => {
            objectsDetailsOptsBasedOnModality.material.setMaterial(material);
            setMaterialSelected(material);
          }}
        >
          <div className="relative w-full">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm transition-all">
              <span className="block truncate text-xs font-medium text-gray-700 dark:text-gray-200">
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
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
              >
                {user ? (
                  availableMaterials.map((material, materialIdx) => (
                    <Listbox.Option
                      key={materialIdx}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                        }`
                      }
                      value={material}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`flex flex-row gap-2 items-center truncate ${selected ? 'font-medium' : 'font-normal'
                              }`}
                          >
                            <MdCircle color={material.color} className="w-3 h-3" />
                            <span className="text-xs">{material.name}</span>
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <CheckIcon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))
                ) : (
                  <Listbox.Option value={undefined} disabled>
                    <span className="text-gray-500 dark:text-gray-400 p-2 text-xs italic">
                      Login to access materials
                    </span>
                  </Listbox.Option>
                )}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <div className="tooltip tooltip-left" data-tip="Material Details">
          <TbInfoSquareRounded
            className="hover:cursor-pointer w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            onClick={() => {
              setShowDetails(!showDetails);
            }}
          />
        </div>
      </div>

      {user && (
        <button
          type="button"
          className="w-full py-1.5 px-3 bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 text-white text-xs font-medium rounded-lg shadow-sm transition-all duration-200"
          onClick={() => setShowManageMaterialModal(true)}
        >
          Manage Materials
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
        <MaterialDetailsModal showModal={setShowDetails} material={materialSelected as Material} />
      )}
    </div>
  );
};
