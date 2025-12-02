import React, { Fragment, useRef, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/20/solid';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Vector3 } from 'three';
import { Dispatch } from '@reduxjs/toolkit';
import { SaveModelWithNameModal } from './components/saveModelWithNameModal';
import { setUnit, unitSelector } from '../../../statusBar/statusBarSlice';
import {
  ModelsSelector,
  SelectedModelSelector,
  setLoadingSpinner,
} from '../../../../../store/modelSlice';
import {
  navbarDropdownBoxStyle,
  navbarDropdownStyle, 
  navbarShortcutStyle
} from '../../../../../config/styles';
import { setModality } from '../../../cadmiaModality/cadmiaModalitySlice';
import { useFaunaQuery } from '../../../../../../esymia/faunadb/hook/useFaunaQuery';
import { addComponent, BufferGeometryAttributes, canvasStateSelector, ComponentEntity, componentseSelector, exportToSTL, getNewKeys, ImportActionParamsObject, ImportCadProjectButton, ImportModelFromDBModal, importStateCanvas, numberOfGeneratedKeySelector, TRANSF_PARAMS_DEFAULTS, CanvasState } from '../../../../../../cad_library';
import { importRisGeometry } from '../../../../../../cad_library/components/importFunctions/importFunctions';
import { SaveRisModelWithNameModal } from './components/saveRisModelWithNameModal';
import { ThemeSelector } from '../../../../../../esymia/store/tabsAndMenuItemsSlice';

interface FileItemProps { }

export const exportJSONProject = (canvas: CanvasState) => {
  const link = document.createElement('a');
  link.href = `data:application/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(canvas),
  )}`;
  link.download = 'project.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToSTLFormat = (components: ComponentEntity[]) => {
  const link = document.createElement('a');
  link.href = `data:model/stl;charset=utf-8,${encodeURIComponent(
    exportToSTL(components),
  )}`;
  link.download = 'model.stl';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const FileItem: React.FC<FileItemProps> = () => {
  const dispatch = useDispatch();
  const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector);
  const canvasState = useSelector(canvasStateSelector);
  const entities = useSelector(componentseSelector);
  const [modalSave, setModalSave] = useState(false);
  const [modalRisSave, setModalRisSave] = useState(false);
  const [modalLoad, setModalLoad] = useState(false);
  const { isAuthenticated } = useAuth0();
  const models = useSelector(ModelsSelector);
  const selectedModel = useSelector(SelectedModelSelector);
  const canvas = useSelector(canvasStateSelector);
  const unit = useSelector(unitSelector);
  const { execQuery } = useFaunaQuery();

  const inputRefSTL = useRef(null);
  const inputRefRis = useRef(null);
  const onImportSTLClick = () => {
    const input = inputRefSTL.current;
    if (input) {
      (input as HTMLInputElement).click();
    }
  };
  const onImportRisClick = () => {
    const input = inputRefRis.current;
    if (input) {
      (input as HTMLInputElement).click();
    }
  };

  const importFromCadSTL = (
    STLFile: File,
    numberOfGeneratedKey: number,
    dispatch: Dispatch,
  ) => {
    dispatch(setLoadingSpinner(true))
    const loader = new STLLoader();

    STLFile.arrayBuffer().then((value) => {
      const res = loader.parse(value);
      res.computeBoundingBox();
      const center = new Vector3();
      res.boundingBox?.getCenter(center);
      res.center();
      const entity: ComponentEntity = {
        type: 'BUFFER',
        name: 'BUFFER',
        keyComponent: getNewKeys(numberOfGeneratedKey, dispatch)[0],
        orbitEnabled: true,
        transformationParams: {
          ...TRANSF_PARAMS_DEFAULTS,
          position: [center.x, center.y, center.z],
        },
        previousTransformationParams: TRANSF_PARAMS_DEFAULTS,
        geometryAttributes: {
          positionVertices: res.attributes.position.array,
          normalVertices: res.attributes.normal.array,
          uvVertices: undefined,
        } as BufferGeometryAttributes,
        transparency: true,
        opacity: 1,
      };
      dispatch(addComponent(entity));
      dispatch(setLoadingSpinner(false))
    });
  };

  const theme = useSelector(ThemeSelector);

  return (
    <>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className={`group inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:cursor-pointer ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white/10'}`}>
              <span>File</span>
              <ChevronDownIcon className="ml-2 h-5 w-5" aria-hidden="true" />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className={navbarDropdownStyle}>
                <div className={navbarDropdownBoxStyle}>
                  <div className={`relative grid gap-1 p-2 backdrop-blur-md rounded-xl border shadow-xl ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/10'}`}>

                    {isAuthenticated && (
                      <button
                        className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
                        onClick={() => setModalSave(true)}
                        disabled={(process.env.APP_VERSION === 'demo' && models.length === 3)}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CloudArrowDownIcon className="h-5 w-5" />
                            <span>Save As...</span>
                          </div>
                        </div>
                      </button>
                    )}
                    {isAuthenticated && (
                      <button
                        className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
                        onClick={() => setModalRisSave(true)}
                        disabled={(process.env.APP_VERSION === 'demo' && models.length === 3)}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CloudArrowDownIcon className="h-5 w-5" />
                            <span>Save With Ris Geometry Data</span>
                          </div>
                        </div>
                      </button>
                    )}
                    {isAuthenticated && (
                      <span
                        className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
                        onClick={() => setModalLoad(true)}
                      >
                        <div className="flex w-full items-center justify-between cursor-pointer"
                          onClick={() => dispatch(setModality("NormalSelection"))}
                        >
                          <div className="flex items-center gap-3">
                            <CloudArrowUpIcon className="h-5 w-5" />
                            <span>Load</span>
                          </div>
                        </div>
                      </span>
                    )}
                    <ImportCadProjectButton
                      className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
                      actionParams={{} as ImportActionParamsObject}
                      importAction={importStateCanvas}
                    >
                      <div className="flex w-full items-center justify-between cursor-pointer"
                        onClick={() => dispatch(setModality("NormalSelection"))}
                      >
                        <div className="flex items-center gap-3">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          <span>Import Project</span>
                        </div>
                      </div>
                    </ImportCadProjectButton>
                    <div
                      className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
                      onClick={onImportSTLClick}
                    >
                      <div className="flex w-full items-center justify-between cursor-pointer"
                        onClick={() => dispatch(setModality("NormalSelection"))}
                      >
                        <div className="flex items-center gap-3">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          <span>Import STL File</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={inputRefSTL}
                        style={{ display: 'none' }}
                        accept='.stl'
                        onChange={(e) => {
                          const STLFiles = e.target.files;
                          STLFiles &&
                            importFromCadSTL(
                              STLFiles[0],
                              numberOfGeneratedKey,
                              dispatch,
                            );
                        }}
                      />
                    </div>
                    <div
                      className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
                      onClick={onImportRisClick}
                    >
                      <div className="flex w-full items-center justify-between cursor-pointer"
                        onClick={() => dispatch(setModality("NormalSelection"))}
                      >
                        <div className="flex items-center gap-3">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          <span>Import Ris Geometry</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={inputRefRis}
                        style={{ display: 'none' }}
                        accept=".txt"
                        onChange={(e) => {
                          const RisFile = e.target.files;
                          RisFile &&
                            importRisGeometry(RisFile[0], dispatch, numberOfGeneratedKey)
                        }}
                      />
                    </div>
                    <span
                      className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
                      onClick={() => {
                        exportJSONProject(canvasState);
                      }}
                    >
                      <div className="flex w-full items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <ArrowUpTrayIcon className="h-5 w-5" />
                          <span>Export Project</span>
                        </div>
                        <span className={navbarShortcutStyle}>Ctrl + S</span>
                      </div>
                    </span>
                    <span
                      className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
                      onClick={() => {
                        exportToSTLFormat(entities);
                      }}
                    >
                      <div className="flex w-full items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <ArrowUpTrayIcon className="h-5 w-5" />
                          <span>Export STL Format</span>
                        </div>
                        <span className={navbarShortcutStyle}>Ctrl + Alt + S</span>
                      </div>
                    </span>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
      {modalSave && <SaveModelWithNameModal showModalSave={setModalSave} />}
      {modalRisSave && <SaveRisModelWithNameModal showModalSave={setModalRisSave} />}
      {modalLoad && (
        <ImportModelFromDBModal
          bucket={process.env.REACT_APP_AWS_BUCKET_NAME as string}
          showModalLoad={setModalLoad}
          importAction={(importActionParams: ImportActionParamsObject) => {
            dispatch(importStateCanvas(importActionParams));
            dispatch(setUnit(importActionParams.unit));
          }}
          importActionParams={
            {
              canvas: {
                numberOfGeneratedKey: 0,
                components: [],
                lastActionType: '',
                selectedComponentKey: 0,
              } as CanvasState,
              unit: 'mm',
            } as ImportActionParamsObject
          }
        />
      )}
    </>
  );
};
