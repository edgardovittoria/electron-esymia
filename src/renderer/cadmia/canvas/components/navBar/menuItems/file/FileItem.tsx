import React, { Fragment, useRef, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/20/solid';
import {
  addComponent,
  BufferGeometryAttributes,
  CanvasState,
  canvasStateSelector,
  ComponentEntity,
  componentseSelector,
  exportToSTL,
  FaunaCadModel,
  getNewKeys,
  ImportActionParamsObject,
  ImportCadProjectButton,
  ImportModelFromDBModal,
  importStateCanvas,
  numberOfGeneratedKeySelector,
  saveNewModel,
  TRANSF_PARAMS_DEFAULTS,
  useFaunaQuery,
} from 'cad-library';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Vector3 } from 'three';
import { Dispatch } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { SaveModelWithNameModal } from './components/saveModelWithNameModal';
import { setUnit, unitSelector } from '../../../statusBar/statusBarSlice';
import { s3 } from '../../../../../aws/s3Config';
import {
  addModel,
  SelectedModelSelector,
  selectModel,
  updateModel,
} from '../../../../../store/modelSlice';
import { deleteFileS3, uploadFileS3 } from '../../../../../aws/crud';
import { updateModelInFauna } from '../../../../../faunaDB/functions';
import {
  navbarDropdownBoxStyle,
  navbarDropdownItemStyle,
  navbarDropdownPadding, navbarDropdownStyle,
  navbarShortcutStyle
} from '../../../../../config/styles';

interface FileItemProps {}

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
  const [modalLoad, setModalLoad] = useState(false);
  const { isAuthenticated } = useAuth0();
  const selectedModel = useSelector(SelectedModelSelector);
  const canvas = useSelector(canvasStateSelector);
  const unit = useSelector(unitSelector);
  const { execQuery } = useFaunaQuery();

  const inputRefSTL = useRef(null);
  const onImportSTLClick = () => {
    const input = inputRefSTL.current;
    if (input) {
      (input as HTMLInputElement).click();
    }
  };

  const importFromCadSTL = (
    STLFile: File,
    numberOfGeneratedKey: number,
    dispatch: Dispatch,
  ) => {
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
    });
  };

  return (
    <>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className="group inline-flex items-center rounded-md bg-white text-base text-black font-medium p-1 hover:bg-black hover:text-white hover:cursor-pointer">
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
                  <div className={navbarDropdownPadding}>
                    {isAuthenticated ? (
                      <span
                        className={navbarDropdownItemStyle}
                        onClick={() => {
                          deleteFileS3(
                            selectedModel?.components as string,
                          ).then(() => {
                            const model = JSON.stringify({
                              components: canvas.components,
                              unit,
                            });
                            const blobFile = new Blob([model]);
                            const modelFile = new File(
                              [blobFile],
                              `${selectedModel?.name}.json`,
                              {
                                type: 'application/json',
                              },
                            );

                            uploadFileS3(modelFile).then((res) => {
                              if (res && selectedModel) {
                                // modificare documento fauna con il nuovo riferimento a oggetto s3
                                const newModel: FaunaCadModel = {
                                  ...selectedModel,
                                  components: res.key,
                                };
                                execQuery(updateModelInFauna, newModel)
                                  .then(() => {
                                    dispatch(updateModel(newModel));
                                    toast.success('Model updated!');
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                    toast.error('Model not updated!');
                                  });
                              }
                            });
                          });
                        }}
                      >
                        <div className="flex justify-between w-full hover:cursor-pointer">
                          <div className="flex">
                            <CloudArrowDownIcon className="w-[20px] mr-4" />
                            <p className="text-base font-medium">
                              Save
                            </p>
                          </div>
                          {/* <p className="text-base font-medium text-gray-300">Ctrl + S</p> */}
                        </div>
                      </span>
                    ) : (
                      <span className={navbarDropdownItemStyle}>
                        <div className="flex justify-between w-full hover:cursor-pointer">
                          <div className="flex">
                            <CloudArrowDownIcon className="w-[20px] mr-4 text-gray-300" />
                            <p className="text-base font-medium text-gray-300">
                              Save As New Model
                            </p>
                          </div>
                          {/* <p className="text-base font-medium text-gray-300">Ctrl + S</p> */}
                        </div>
                      </span>
                    )}
                    {isAuthenticated ? (
                      <span
                        className={navbarDropdownItemStyle}
                        onClick={() => setModalSave(true)}
                      >
                        <div className="flex justify-between w-full hover:cursor-pointer">
                          <div className="flex">
                            <CloudArrowDownIcon className="w-[20px] mr-4" />
                            <p className="text-base font-medium">Save As...</p>
                          </div>
                          {/* <p className="text-base font-medium text-gray-300">Ctrl + S</p> */}
                        </div>
                      </span>
                    ) : (
                      <span className="-m-3 flex items-start rounded-lg p-2 hover:bg-black hover:text-white">
                        <div className="flex justify-between w-full hover:cursor-pointer">
                          <div className="flex">
                            <CloudArrowDownIcon className="w-[20px] mr-4 text-gray-300" />
                            <p className="text-base font-medium text-gray-300">
                              Save As New Model
                            </p>
                          </div>
                          {/* <p className="text-base font-medium text-gray-300">Ctrl + S</p> */}
                        </div>
                      </span>
                    )}
                    {isAuthenticated ? (
                      <span
                        className={navbarDropdownItemStyle}
                        onClick={() => setModalLoad(true)}
                      >
                        <div className="flex justify-between w-full hover:cursor-pointer">
                          <div className="flex">
                            <CloudArrowUpIcon className="w-[20px] mr-4" />
                            <p className="text-base font-medium">
                              Load
                            </p>
                          </div>
                          {/* <p className="text-base font-medium text-gray-300">Ctrl + S</p> */}
                        </div>
                      </span>
                    ) : (
                      <span className={navbarDropdownItemStyle}>
                        <div className="flex justify-between w-full hover:cursor-pointer">
                          <div className="flex">
                            <CloudArrowUpIcon className="w-[20px] mr-4 text-gray-300" />
                            <p className="text-base font-medium text-gray-300">
                              Load From DB
                            </p>
                          </div>
                          {/* <p className="text-base font-medium text-gray-300">Ctrl + S</p> */}
                        </div>
                      </span>
                    )}
                    <ImportCadProjectButton
                      className={navbarDropdownItemStyle}
                      actionParams={{} as ImportActionParamsObject}
                      importAction={importStateCanvas}
                    >
                      <div className="flex justify-between w-full hover:cursor-pointer">
                        <div className="flex">
                          <ArrowDownTrayIcon className="w-[20px] mr-4" />
                          <p className="text-base font-medium">
                            Import Project
                          </p>
                        </div>
                        {/* <p className="text-base font-medium text-gray-300">Ctrl + S</p> */}
                      </div>
                    </ImportCadProjectButton>
                    <div
                      className={navbarDropdownItemStyle}
                      onClick={onImportSTLClick}
                    >
                      <div className="flex justify-between w-full hover:cursor-pointer">
                        <div className="flex">
                          <ArrowDownTrayIcon className="w-[20px] mr-4" />
                          <p className="text-base font-medium">
                            Import STL File
                          </p>
                        </div>
                        {/* <p className="text-base font-medium text-gray-300">Ctrl + S</p> */}
                      </div>
                      <input
                        type="file"
                        ref={inputRefSTL}
                        style={{ display: 'none' }}
                        accept=".stl"
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
                    <span
                      className={navbarDropdownItemStyle}
                      onClick={() => {
                        exportJSONProject(canvasState);
                      }}
                    >
                      <div className="flex justify-between w-full hover:cursor-pointer">
                        <div className="flex">
                          <ArrowUpTrayIcon className="w-[20px] mr-4" />
                          <p className="text-base font-medium">
                            Export Project
                          </p>
                        </div>
                        <p className={navbarShortcutStyle}>
                          Ctrl + S
                        </p>
                      </div>
                    </span>
                    <span
                      className={navbarDropdownItemStyle}
                      onClick={() => {
                        exportToSTLFormat(entities);
                      }}
                    >
                      <div className="flex justify-between w-full hover:cursor-pointer">
                        <div className="flex">
                          <ArrowUpTrayIcon className="w-[20px] mr-4" />
                          <p className="text-base font-medium">
                            Export STL Format
                          </p>
                        </div>
                        <p className={navbarShortcutStyle}>
                          Ctrl + Alt + S
                        </p>
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
      {modalLoad && (
        <ImportModelFromDBModal
          s3Config={s3}
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
