import React, { useEffect, useState } from 'react';
import { ImSpinner } from 'react-icons/im';
import {
  compressSelector,
  gridsCreationLengthSelector,
  gridsCreationValueSelector,
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  mesherProgressLengthSelector,
  mesherProgressSelector,
  mesherResultsSelector,
  meshingProgressSelector,
  setCompress,
  setGridsCreationLength,
  setGridsCreationValue,
  setIsAlertInfoModal,
  setMesherResults,
  setMeshingProgress,
  setMeshProgress,
  setMeshProgressLength,
  setMessageInfoModal,
  setShowInfoModal,
  ThemeSelector,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  setExternalGrids,
  setMesh,
  setMeshGenerated,
  setMeshValidTopology,
  setSurface,
} from '../../../../../../store/projectSlice';
import { Project } from '../../../../../../model/esymiaModels';
import { generateSTLListFromComponents } from './rightPanelFunctions';
import { TiArrowMinimise } from 'react-icons/ti';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';
import { publishMessage } from '../../../../../../../middleware/stompMiddleware';
import { Disclosure } from '@headlessui/react';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { PiClockCountdownBold } from 'react-icons/pi';
import { TbTrashXFilled } from 'react-icons/tb';
import { useFaunaQuery } from '../../../../../../faunadb/hook/useFaunaQuery';
import { ComponentEntity, Material } from '../../../../../../../cad_library';

export interface MeshingStatusProps {
  feedbackMeshingVisible: boolean;
  setFeedbackMeshingVisible: (v: boolean) => void;
  activeMeshing: {
    selectedProject: Project;
    allMaterials: Material[];
    quantum: [number, number, number];
    meshStatus: 'Not Generated' | 'Generated';
  }[];
}

const MeshingStatus: React.FC<MeshingStatusProps> = ({
  feedbackMeshingVisible,
  setFeedbackMeshingVisible,
  activeMeshing,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector)
  const [runningMesh, setrunningMesh] = useState<
    | {
        selectedProject: Project;
        allMaterials: Material[];
        quantum: [number, number, number];
        meshStatus: 'Not Generated' | 'Generated';
      }
    | undefined
  >(undefined);

  const [queuedMesh, setqueuedMesh] = useState<
    {
      selectedProject: Project;
      allMaterials: Material[];
      quantum: [number, number, number];
      meshStatus: 'Not Generated' | 'Generated';
    }[]
  >([]);

  useEffect(() => {
    if(process.env.APP_MODE !== "test"){
      window.electron.ipcRenderer.sendMessage('meshingComputation', [true])
      return () => {
        window.electron.ipcRenderer.sendMessage('meshingComputation', [false])
      }
    }
  }, [])


  useEffect(() => {
    activeMeshing.forEach((am) => {
      if (am.selectedProject.meshData.meshGenerated === 'Generating') {
        setrunningMesh(am);
      } else if (am.selectedProject.meshData.meshGenerated === 'Queued') {
        if (
          queuedMesh.filter(
            (qm) =>
              qm.selectedProject.faunaDocumentId ===
              am.selectedProject.faunaDocumentId,
          ).length === 0
        ) {
          setqueuedMesh((prev) => [...prev, am]);
        }
      }
    });
    if (!runningMesh && queuedMesh.length > 0) {
      let item = queuedMesh.pop();
      dispatch(
        setMeshGenerated({
          status: 'Generating',
          projectToUpdate: item
            ? (item.selectedProject.faunaDocumentId as string)
            : '',
        }),
      );
      if (item) {
        setqueuedMesh(
          queuedMesh.filter(
            (qm) =>
              qm.selectedProject.faunaDocumentId !==
              item.selectedProject.faunaDocumentId,
          ),
        );
        setrunningMesh({
          ...item,
          selectedProject: {
            ...item?.selectedProject,
            meshData: {
              ...item?.selectedProject.meshData,
              meshGenerated: 'Generating',
            },
          },
        });
      }
    }
  }, [activeMeshing.length]);

  return (
    <div
      className={`absolute right-10 w-1/4 bottom-10 flex flex-col justify-center items-center ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'} p-3 rounded ${
        !feedbackMeshingVisible && 'hidden'
      }`}
    >
      <div className="flex flex-row justify-between">
        <h5>Meshing Status</h5>
        <TiArrowMinimise
          className="absolute top-2 right-2 hover:cursor-pointer hover:bg-gray-200"
          size={20}
          onClick={() => setFeedbackMeshingVisible(false)}
        />
      </div>
      <hr className="text-secondaryColor w-full mb-5 mt-3" />
      <div className="max-h-[600px] overflow-y-scroll w-full">
        {/* {runningMesh && runningMesh.map((m) => (
          <MeshingStatusItem
            selectedProject={m.selectedProject}
            allMaterials={m.allMaterials}
            quantumDimsInput={m.quantum}
            activeMeshing={activeMeshing}
          />
        ))} */}
        {runningMesh && (
          <MeshingStatusItem
            selectedProject={runningMesh.selectedProject}
            allMaterials={runningMesh.allMaterials}
            quantumDimsInput={runningMesh.quantum}
            setrunningMesh={setrunningMesh}
          />
        )}
        {queuedMesh.map((qm) => (
          <QueuedMeshingStatusItem project={qm} setqueuedMeshing={setqueuedMesh} />
        ))}
      </div>
    </div>
  );
};

export default MeshingStatus;

export interface MeshingStatusItemProps {
  selectedProject: Project;
  allMaterials: Material[];
  quantumDimsInput: [number, number, number];
  setrunningMesh: Function;
}

const MeshingStatusItem: React.FC<MeshingStatusItemProps> = ({
  selectedProject,
  allMaterials,
  quantumDimsInput,
  setrunningMesh,
}) => {
  const dispatch = useDispatch();
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
  const isAlert = useSelector(isAlertInfoModalSelector);
  const checkProgressLength = useSelector(mesherProgressLengthSelector);
  const checkProgressValue = useSelector(mesherProgressSelector);
  const meshingStep = useSelector(meshingProgressSelector);
  const gridsCreationLength = useSelector(gridsCreationLengthSelector);
  const gridsCreationValue = useSelector(gridsCreationValueSelector);
  const compress = useSelector(compressSelector);
  const [stopSpinner, setStopSpinner] = useState<boolean>(false);
  const mesherResults = useSelector(mesherResultsSelector);
  const theme = useSelector(ThemeSelector)

  useEffect(() => {
    if(selectedProject.meshData.type === 'Standard'){
      const components = selectedProject?.model?.components as ComponentEntity[];
    const objToSendToMesher = {
      STLList:
        components &&
        allMaterials &&
        generateSTLListFromComponents(allMaterials, components),
      quantum: quantumDimsInput,
      fileName: selectedProject.faunaDocumentId as string,
    };
    dispatch(
      publishMessage({
        queue: 'management',
        body: {
          message: 'compute mesh',
          body: objToSendToMesher,
        },
      }),
    );
    }else{
      dispatch(
        publishMessage({
          queue: 'management',
          body: {
            message: 'compute mesh ris',
            body: {
              fileNameRisGeometry: selectedProject.bricks as string,
              fileName: selectedProject.faunaDocumentId as string,
              density: selectedProject.meshData.lambdaFactor,
              freqMax: selectedProject.frequencies && selectedProject.frequencies[selectedProject.frequencies.length - 1],
            }
          },
        }),
      );
    }
  }, []);

  // useEffect(() => {
  //   if (
  //     activeMeshing.length > 1 &&
  //     activeMeshing.filter(
  //       (am) => am.selectedProject.meshData.meshGenerated === 'Generating',
  //     ).length === 0
  //   ) {
  //     dispatch(
  //       setMeshGenerated({
  //         status: 'Generating',
  //         projectToUpdate: selectedProject.faunaDocumentId as string,
  //       }),
  //     );
  //   }
  // }, [activeMeshing.length]);

  const { execQuery } = useFaunaQuery();

  useEffect(() => {
    if (mesherResults && mesherResults.id === selectedProject.faunaDocumentId) {
      if (mesherResults.isStopped) {
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
        dispatch(setMeshValidTopology({
          status: mesherResults.validTopology,
          projectToUpdate: selectedProject.faunaDocumentId as string,
        }))
      } else if (mesherResults.isValid.valid === false) {
        dispatch(
          setMessageInfoModal(
            'Error! Mesh not valid. Please adjust quantum along ' +
              mesherResults.isValid.axis +
              ' axis.',
          ),
        );
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
        dispatch(setMeshValidTopology({
          status: mesherResults.validTopology,
          projectToUpdate: selectedProject.faunaDocumentId as string,
        }))
      } else if (
        mesherResults.error &&
        mesherResults.error === 'out of memory'
      ) {
        dispatch(
          setMessageInfoModal(
            'Memory error, the requested mesh cannot be generated, try a larger quantum if possible!',
          ),
        );
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
        dispatch(setMeshValidTopology({
          status: mesherResults.validTopology,
          projectToUpdate: selectedProject.faunaDocumentId as string,
        }))
      } else {
        if(selectedProject.meshData.type === 'Standard'){
          dispatch(setMeshValidTopology({
            status: mesherResults.validTopology,
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }))
          dispatch(
            setExternalGrids({
              extGrids: mesherResults.gridsPath,
              projectToUpdate: selectedProject.faunaDocumentId as string,
            }),
          );
        }else{
          dispatch(
            setSurface({
              surface: mesherResults.surfacePath,
              projectToUpdate: selectedProject.faunaDocumentId as string,
            }),
          );
        }
        dispatch(
          setMeshGenerated({
            status: 'Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
        dispatch(
          setMesh({
            mesh: mesherResults.meshPath,
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
        execQuery(
          updateProjectInFauna,
          convertInFaunaProjectThis({
            ...selectedProject,
            meshData: {
              ...selectedProject.meshData,
              mesh: mesherResults.meshPath,
              externalGrids: mesherResults.gridsPath,
              surface: mesherResults.surfacePath,
              meshGenerated: 'Generated',
              validTopology: mesherResults.validTopology
            },
          }),
          dispatch
        ).then(() => {});
      }
      dispatch(setMeshingProgress(undefined));
      dispatch(setMeshProgressLength(undefined));
      dispatch(setMeshProgress(undefined));
      dispatch(setGridsCreationValue(undefined));
      dispatch(setGridsCreationLength(undefined));
      dispatch(setCompress(undefined));
      dispatch(setMesherResults(undefined));
      setrunningMesh(undefined);
    }
  }, [mesherResults]);

  useEffect(() => {
    if (isAlertConfirmed) {
      if (!isAlert) {
        dispatch(
          publishMessage({
            queue: 'management',
            body: {
              message: 'stop computation',
              id: selectedProject.faunaDocumentId as string,
            },
          }),
        );
      } else {
        dispatch(
          setMeshGenerated({
            status: 'Not Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string,
          }),
        );
      }
    }
  }, [isAlertConfirmed]);

  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <>
          <Disclosure.Button className={`flex w-full justify-between items-center rounded-lg border ${theme === 'light' ? 'border-secondaryColor text-secondaryColor hover:bg-green-100' : 'border-textColorDark text-textColorDark hover:bg-bgColorDark'} px-4 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-green-500/75`}>
            <span>{selectedProject.name}</span>
            <div className="badge bg-green-500 text-white flex flex-row gap-2 items-center py-3">
              <ImSpinner className="w-4 h-4 animate-spin" />
              <span>generating</span>
            </div>
            <MdKeyboardArrowUp
              className={`${
                open ? 'rotate-180 transform' : ''
              } h-5 w-5 ${theme === 'light' ? 'text-secondaryColor' : 'text-textColorDark'} `}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
            {selectedProject.meshData.meshGenerated === 'Generating' ? (
              <div
                className={`p-5 ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'} rounded-xl flex flex-col gap-4 items-center justify-center w-full`}
              >
                {stopSpinner && (
                  <ImSpinner className="animate-spin w-8 h-8 absolute top-1/2 left-1/2" />
                )}
                <div
                  className={`flex flex-col gap-2 w-full ${
                    stopSpinner ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <span>Meshing</span>
                  <div className="flex flex-row justify-between items-center w-full">
                    {meshingStep ? (
                      <>
                        {((selectedProject.meshData.type === 'Standard' && meshingStep.meshingStep === 4) || (selectedProject.meshData.type === 'Ris' && meshingStep.meshingStep === 2)) ? (
                          <div className="flex flex-row w-full justify-between items-center">
                            <progress
                              className={`progress w-full mr-4`}
                              value={1}
                              max={1}
                            />
                            <AiOutlineCheckCircle
                              size="20px"
                              className="text-green-500"
                            />
                          </div>
                        ) : (
                          <progress
                          className={`progress w-full`}
                            value={meshingStep.meshingStep}
                            max={selectedProject.meshData.type === 'Standard' ? 4 : 2}
                          />
                        )}
                      </>
                    ) : (
                      <progress className={`progress w-full`} />
                    )}
                  </div>
                </div>
                {selectedProject.meshData.type === 'Standard' &&
                  <>
                    <div
                  className={`flex flex-col gap-2 w-full ${
                    stopSpinner ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <span>Check mesh validity</span>
                  <div className="flex flex-row justify-between items-center w-full">
                    {checkProgressValue &&
                    checkProgressLength &&
                    checkProgressLength.length > 0 ? (
                      <div className="flex flex-row w-full justify-between items-center">
                        <progress
                          className={`progress w-full mr-4`}
                          value={checkProgressValue.index}
                          max={checkProgressLength.length}
                        />
                        {gridsCreationValue !== undefined && (
                          <AiOutlineCheckCircle
                            size="20px"
                            className="text-green-500"
                          />
                        )}
                      </div>
                    ) : (
                      <progress className={`progress w-full`} />
                    )}
                  </div>
                </div>
                <div
                  className={`flex flex-col gap-2 w-full ${
                    stopSpinner ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <span>Grids creation</span>
                  <div className="flex flex-row justify-between items-center w-full">
                    {gridsCreationLength && gridsCreationValue ? (
                      <>
                        {compress !== undefined ? (
                          <div className="flex flex-row w-full justify-between items-center">
                            <progress
                              className={`progress w-full mr-4`}
                              value={1}
                              max={1}
                            />
                            <AiOutlineCheckCircle
                              size="20px"
                              className="text-green-500"
                            />
                          </div>
                        ) : (
                          <progress
                          className={`progress w-full`}
                            max={gridsCreationLength.gridsCreationLength}
                            value={gridsCreationValue.gridsCreationValue}
                          />
                        )}
                      </>
                    ) : (
                      <progress className={`progress w-full`} />
                    )}
                  </div>
                </div>
                  </>
                }
                <div
                  className={`flex flex-col gap-2 w-full ${
                    stopSpinner ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <span>Loading Data</span>
                  <div className="flex flex-row justify-between items-center w-full">
                    {compress !== undefined ? (
                      <>
                        {!compress ? (
                          <div className="flex flex-row w-full justify-between items-center">
                            <progress
                              className={`progress w-full mr-4`}
                              value={1}
                              max={1}
                            />
                            <AiOutlineCheckCircle
                              size="20px"
                              className="text-green-500"
                            />
                          </div>
                        ) : (
                          <progress className={`progress w-full`} />
                        )}
                      </>
                    ) : (
                      <progress className={`progress w-full`} />
                    )}
                  </div>
                </div>
                <div
                  className={`button w-full buttonPrimary ${theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'} text-center mt-4 mb-4`}
                  onClick={() => {
                    dispatch(
                      setMessageInfoModal('Are you sure to stop the meshing?'),
                    );
                    dispatch(setIsAlertInfoModal(false));
                    dispatch(setShowInfoModal(true));
                    setStopSpinner(true);
                  }}
                >
                  Stop Meshing
                </div>
              </div>
            ) : (
              <span>Wait</span>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export interface QueuedMeshingStatusItemProps {
  project: {
    selectedProject: Project;
    allMaterials: Material[];
    quantum: [number, number, number];
    meshStatus: 'Not Generated' | 'Generated';
  };
  setqueuedMeshing: React.Dispatch<
    React.SetStateAction<
      {
        selectedProject: Project;
        allMaterials: Material[];
        quantum: [number, number, number];
        meshStatus: 'Not Generated' | 'Generated';
      }[]
    >
  >;
}

const QueuedMeshingStatusItem: React.FC<QueuedMeshingStatusItemProps> = ({
  project,
  setqueuedMeshing,
}) => {
  const dispatch = useDispatch();

  return (
    <div className="flex my-2 w-full justify-between items-center rounded-lg border border-secondaryColor px-4 py-2 text-left text-sm font-medium text-secondaryColor hover:bg-green-100 focus:outline-none focus-visible:ring focus-visible:ring-green-500/75">
      <span>{project.selectedProject.name}</span>
      <div className="badge bg-amber-500 text-white flex flex-row gap-2 items-center py-3">
        <PiClockCountdownBold className="w-4 h-4" />
        <span>queued</span>
      </div>
      <div
        className="tooltip tooltip-left hover:cursor-pointer"
        data-tip="Remuove queued meshing"
        onClick={() => {
          setqueuedMeshing((prev) =>
            prev.filter(
              (item) =>
                item.selectedProject.faunaDocumentId !== project.selectedProject.faunaDocumentId,
            ),
          );
          dispatch(
            setMeshGenerated({
              status: project.meshStatus,
              projectToUpdate: project.selectedProject.faunaDocumentId as string,
            }),
          );
        }}
      >
        <TbTrashXFilled className="w-6 h-6 text-red-500 hover:text-red-800" />
      </div>
    </div>
  );
};
