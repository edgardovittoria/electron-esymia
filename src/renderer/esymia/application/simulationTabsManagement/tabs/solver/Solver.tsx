import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SelectedFolderSelector,
  selectedProjectSelector,
  setPathToExternalGridsNotFound,
} from '../../../../store/projectSlice';
import {
  CellSize,
  CellsNumber,
  ExternalGridsObject,
  ExternalGridsRisObject,
  Folder,
  OriginPoint,
  Project,
} from '../../../../model/esymiaModels';
import StatusBar from '../../sharedElements/StatusBar';
import { CanvasSolver } from './components/CanvasSolver';
import { ResetFocusButton } from '../../sharedElements/ResetFocusButton';
import { ImSpinner } from 'react-icons/im';
import { useStorageData } from '../mesher/components/rightPanelSimulator/hook/useStorageData';
import {
  AWSExternalGridsDataSelector,
  meshVisualizationSelector,
  setMeshVisualization,
  ThemeSelector,
  unsetAWSExternalGridsData,
} from '../../../../store/tabsAndMenuItemsSlice';
import { LiaFeatherSolid, LiaWeightHangingSolid } from 'react-icons/lia';
import { BiHide, BiShow } from 'react-icons/bi';
import { Brick } from '../mesher/components/rightPanelSimulator/components/createGridsExternals';
import { GrClone, GrStatusInfo } from 'react-icons/gr';
import { ComponentEntity, Material } from '../../../../../cad_library';
import { MesherStatusSelector } from '../../../../store/pluginsSlice';
import * as THREE from 'three';
import { ViewMesh } from './components/ViewMesh';
import { OriginaProportionsButton } from '../mesher/components/OriginalProportionsButton';
import { AlteredProportionsButton } from '../mesher/components/AlteredProportionsButton';
import { createOrUpdateProjectInDynamoDB } from '../../../../../dynamoDB/projectsFolderApi';
import { useEffectNotOnMount } from '../../../../hook/useEffectNotOnMount';
import { savePortsOnS3 } from '../physics/savePortsOnS3';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { TiArrowMinimise } from 'react-icons/ti';
import { LuClipboardList } from 'react-icons/lu';
import { SolverSettings } from './components/SolverSettings';

interface SolverProps {
  selectedTab?: string;
  setSelectedTab: Function;
}

export const Solver: React.FC<SolverProps> = ({
  selectedTab,
  setSelectedTab,
}) => {
  const [externalGrids, setExternalGrids] = useState<
    ExternalGridsObject | ExternalGridsRisObject | undefined
  >(undefined);
  const [voxelsPainted, setVoxelsPainted] = useState(0);
  const [totalVoxels, setTotalVoxels] = useState(0);
  const { execQuery2 } = useDynamoDBQuery();
  const [cloning, setcloning] = useState<boolean>(false);
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedFolder = useSelector(SelectedFolderSelector);
  const theme = useSelector(ThemeSelector);
  const dispatch = useDispatch();
  const [showAdvices, setShowAdvices] = useState<boolean>(false);
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0, 0),
  );
  const [surfaceAdvices, setSurfaceAdvices] = useState<boolean>(false);
  const [resetFocus, setResetFocus] = useState(false);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [viewMesh, setViewMesh] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const toggleResetFocus = () => setResetFocus(!resetFocus);
  const { loadMeshData, cloneProject } = useStorageData();
  const mesherStatus = useSelector(MesherStatusSelector);
  const [selectedTabRightPanel, setSelectedTabRightPanel] = useState<
    string | undefined
  >(undefined);
  const [savedPhysicsParameters, setSavedPhysicsParameters] = useState(true);
  const [simulationType, setsimulationType] = useState<
    'Matrix' | 'Electric Fields'
  >(
    selectedProject?.simulation
      ? selectedProject.simulation.simulationType
      : 'Matrix',
  );
  const awsExternalGridsData = useSelector(AWSExternalGridsDataSelector);

  const risExternalGridsFormat = (extGridsJson: any) => {
    let vertices: number[][] = [];
    for (let index = 0; index < extGridsJson.estremi_celle[0].length; index++) {
      vertices.push([]);
    }
    (extGridsJson.estremi_celle as number[][]).forEach((row) => {
      row.forEach((element, rowIndex) => vertices[rowIndex].push(element));
    });
    return {
      vertices: vertices,
      materials: extGridsJson.materials as string[],
    } as ExternalGridsRisObject;
  };

  const externalGridsDecode = (extGridsJson: any) => {
    let gridsPairs: [string, Brick[]][] = [];
    Object.entries(extGridsJson.externalGrids).forEach((material) =>
      gridsPairs.push([
        material[0],
        (material[1] as string).split('A').map((brString) => {
          let coords = brString.split('-').map((c) => parseInt(c));
          return { x: coords[0], y: coords[1], z: coords[2] } as Brick;
        }),
      ]),
    );
    let externalGrids = Object.fromEntries(gridsPairs);
    let cellSizeCoords = (extGridsJson.cell_size as string)
      .split('-')
      .map((c) => parseFloat(c) / 1000);
    let cell_size = {
      cell_size_x: cellSizeCoords[0],
      cell_size_y: cellSizeCoords[1],
      cell_size_z: cellSizeCoords[2],
    } as CellSize;
    let nCellsCoords = (extGridsJson.n_cells as string)
      .split('-')
      .map((c) => parseFloat(c));
    let n_cells = {
      n_cells_x: nCellsCoords[0],
      n_cells_y: nCellsCoords[1],
      n_cells_z: nCellsCoords[2],
    } as CellsNumber;
    let originCoords = (extGridsJson.origin as string)
      .split('-')
      .map((c) => parseFloat(c));
    let origin = {
      origin_x: originCoords[0],
      origin_y: originCoords[1],
      origin_z: originCoords[2],
    } as OriginPoint;
    return {
      cell_size: cell_size,
      externalGrids: externalGrids,
      n_cells: n_cells,
      origin: origin,
    } as ExternalGridsObject;
  };

  useEffect(() => {
    if (
      selectedProject?.meshData.mesh &&
      (selectedProject?.meshData.meshGenerated === 'Generated' ||
        selectedProject?.meshData.meshGenerated === 'Queued')
    ) {
      setExternalGrids(undefined);
      setSpinner(true);
      if (selectedProject?.meshData.type === 'Ris') {
        loadMeshData(process.env.MESHER_RIS_MODE === 'backend');
      } else {
        if (mesherStatus === "ready") {
          loadMeshData(true);
        }
      }
    }
  }, [selectedProject?.meshData.meshGenerated, mesherStatus]);

  useEffect(() => {
    if (awsExternalGridsData) {
      if (selectedProject?.meshData.type === 'Standard') {
        setExternalGrids(externalGridsDecode(awsExternalGridsData));
      } else if (selectedProject?.meshData.type === 'Ris') {
        setExternalGrids(risExternalGridsFormat(awsExternalGridsData));
      }
      dispatch(
        setPathToExternalGridsNotFound({
          status: false,
          projectToUpdate: selectedProject?.id as string,
        }),
      );
      setSpinner(false);
    }
    return () => {
      dispatch(unsetAWSExternalGridsData());
    };
  }, [awsExternalGridsData]);

  useEffect(() => {
    setVoxelsPainted(0);
    if (externalGrids && selectedProject?.meshData.type === 'Standard') {
      const numberOfCells = Object.values(
        (externalGrids as ExternalGridsObject).externalGrids,
      ).reduce((prev, current) => {
        return prev + current.length;
      }, 0);
      setVoxelsPainted(numberOfCells);
      setTotalVoxels(
        (externalGrids as ExternalGridsObject).n_cells.n_cells_x *
        (externalGrids as ExternalGridsObject).n_cells.n_cells_y *
        (externalGrids as ExternalGridsObject).n_cells.n_cells_z,
      );
    }
  }, [externalGrids]);

  let materialsNames: string[] = [];
  let allMaterials: Material[] = [];
  if (selectedProject?.model?.components) {
    allMaterials = getMaterialListFrom(
      selectedProject?.model.components as ComponentEntity[],
    );

    materialsNames = [allMaterials[0].name];
    allMaterials.forEach((m) => {
      if (materialsNames.filter((mat) => mat !== m.name).length > 0)
        materialsNames.push(m.name);
    });
  }

  const [selectedMaterials, setSelectedMaterials] =
    useState<string[]>(materialsNames);

  const [sidebarItemSelected, setsidebarItemSelected] = useState<
    string | undefined
  >('Solver');

  useEffect(() => {
    setSelectedTab(undefined);
  }, []);

  useEffectNotOnMount(() => {
    if (selectedProject && savedPhysicsParameters) {
      if (selectedProject.ports.length > 0) {
        savePortsOnS3(
          selectedProject.ports,
          selectedProject,
          dispatch,
          execQuery2,
        );
      } else {
        execQuery2(
          createOrUpdateProjectInDynamoDB,
          selectedProject,
          dispatch,
        ).then(() => { });
      }
    }
  }, [savedPhysicsParameters]);

  return (
    <>
      {spinner && mesherStatus === 'ready' && viewMesh && (
        <div className="absolute top-1/2 left-1/2">
          <ImSpinner className={`animate-spin w-8 h-8 ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`} />
        </div>
      )}
      {(process.env.MESHER_RIS_MODE === 'backend' || selectedProject?.meshData.type === "Standard") &&
        (mesherStatus === 'idle' || mesherStatus === 'starting') && viewMesh && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
            Mesher Down: start mesher or wait until started to visualize the
            mesh!
          </div>
        )}
      <CanvasSolver
        externalGrids={externalGrids}
        selectedMaterials={selectedMaterials}
        resetFocus={resetFocus}
        setResetFocus={toggleResetFocus}
        setSavedPortParameters={setSavedPhysicsParameters}
        setCameraPosition={setCameraPosition}
        setSurfaceAdvices={setSurfaceAdvices}
        surfaceAdvices={surfaceAdvices}
        simulationType={simulationType}
        viewMesh={viewMesh}
      />
      <StatusBar voxelsPainted={voxelsPainted} totalVoxels={totalVoxels} />
      <ViewMesh
        viewMesh={viewMesh}
        setViewMesh={setViewMesh}
        setResetFocus={setResetFocus}
      />
      <SolverSettings
        selectedProject={selectedProject as Project}
        setsidebarItemSelected={setsidebarItemSelected}
        sidebarItemSelected={sidebarItemSelected}
        setSelectedTabLeftPanel={setSelectedTab}
        setSelectedTabRightPanel={setSelectedTabRightPanel}
        simulationType={simulationType}
        setsimulationType={setsimulationType}
        setSavedPhysicsParameters={setSavedPhysicsParameters}
        savedPhysicsParameters={savedPhysicsParameters}
        cameraPosition={cameraPosition}
        setResetFocus={toggleResetFocus}
      />
      <div className="absolute left-[2%] top-[60px] flex flex-col items-center gap-0">
        <button
          disabled={
            selectedProject &&
            selectedProject.simulation &&
            selectedProject.simulation.status === 'Running' ||
            (process.env.APP_VERSION === 'demo' && selectedFolder?.projectList.length === 3)
          }
          className={`p-3 tooltip tooltip-right rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 relative disabled:opacity-40 disabled:cursor-not-allowed ${theme === 'light'
            ? 'bg-white/80 text-gray-700 hover:bg-white hover:text-green-600 hover:shadow-green-500/20'
            : 'bg-black/40 text-gray-300 border border-white/10 hover:bg-black/60 hover:text-green-400 hover:border-green-500/30'
            }`}
          data-tip="Clone Project"
          onClick={() => {
            setcloning(true);
            cloneProject(
              selectedProject as Project,
              selectedFolder as Folder,
              setcloning,
            );
          }}
        >
          <GrClone size={24} className={`${cloning ? 'opacity-20' : 'opacity-100'}`} />
          {cloning && (
            <ImSpinner className={`absolute inset-0 m-auto animate-spin w-5 h-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
          )}
        </button>
      </div>
      {showAdvices && <PositioningPortsInfo />}
      <div className="absolute left-1/2 -translate-x-1/2 gap-4 top-4 flex flex-col items-center">
        <div className="gap-4 flex flex-row items-center p-2 rounded-2xl backdrop-blur-md border transition-all duration-300 shadow-lg bg-white/10 border-white/20">
          {selectedProject?.model.components && (
            <>
              <SurfaceAdvicesButton
                surfaceAdvices={surfaceAdvices}
                setSurfaceAdvices={setSurfaceAdvices}
              />
              <div className={`w-px h-8 ${theme === 'light' ? 'bg-gray-300/50' : 'bg-white/10'}`} />
              <ResetFocusButton toggleResetFocus={toggleResetFocus} />
              <div className={`w-px h-8 ${theme === 'light' ? 'bg-gray-300/50' : 'bg-white/10'}`} />
              <div>
                <div
                  className={`p-3 rounded-xl transition-all duration-300 cursor-pointer ${theme === 'light'
                    ? 'bg-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    : 'bg-transparent text-gray-400 hover:text-blue-400 hover:bg-white/5'
                    }`}
                  data-tip="Port Positioning Info"
                  onClick={() => setShowAdvices(!showAdvices)}
                >
                  <GrStatusInfo size={24} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {viewMesh && (
        <div className="absolute left-1/2 -translate-x-1/2 gap-4 top-20 flex flex-row items-center p-2 rounded-2xl backdrop-blur-md border transition-all duration-300 shadow-lg bg-white/10 border-white/20">
          <ResetFocusButton toggleResetFocus={toggleResetFocus} />
          <div className={`w-px h-8 ${theme === 'light' ? 'bg-gray-300/50' : 'bg-white/10'}`} />
          <OriginaProportionsButton />
          <AlteredProportionsButton threshold={3} />
          <div className={`w-px h-8 ${theme === 'light' ? 'bg-gray-300/50' : 'bg-white/10'}`} />
          <NormalMeshVisualizationButton />
          <LightMeshVisualizationButton />
        </div>
      )}
      {showLegend ? (
        <>
          {!viewMesh &&
            selectedProject?.planeWaveParameters &&
            simulationType === 'Electric Fields' && (
              <div className={`absolute right-[2%] gap-2 bottom-[50px] flex flex-col p-5 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${theme === 'light'
                ? 'bg-white/90 border-white/40 text-gray-800'
                : 'bg-black/60 border-white/10 text-gray-200'
                }`}>
                <div className="flex flex-row justify-between items-center gap-10 mb-2">
                  <span className="font-semibold">Electric Fields Legend</span>
                  <TiArrowMinimise
                    className="hover:cursor-pointer hover:opacity-50 w-6 h-6"
                    onClick={() => setShowLegend(false)}
                  />
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex flex-row items-center">
                    <span className="w-1/5 uppercase font-bold">K̂</span>
                    <hr className="w-4/5 border-2 border-gray-400 rounded-full" />
                  </div>
                  <div className="flex flex-row items-center">
                    <span className="w-1/5 font-bold">Êθ</span>
                    <hr className="w-4/5 border-2 border-green-600 rounded-full" />
                  </div>
                  <div className="flex flex-row items-center">
                    <span className="w-1/5 font-bold">Êφ</span>
                    <hr className="w-4/5 border-2 border-fuchsia-700 rounded-full" />
                  </div>
                  <div className="flex flex-row items-center">
                    <span className="w-1/5 font-bold">Ĥ</span>
                    <hr className="w-4/5 border-2 border-red-500 rounded-full" />
                  </div>
                  <div className="flex flex-row items-center">
                    <span className="w-1/5 font-bold">Ê</span>
                    <hr className="w-4/5 border-2 border-blue-600 rounded-full" />
                  </div>
                  <div className="flex flex-row items-center">
                    <span className="w-1/5 font-bold">θ</span>
                    <hr className="w-4/5 border-2 border-dashed border-green-600" />
                  </div>
                  <div className="flex flex-row items-center">
                    <span className="w-1/5 font-bold">φ</span>
                    <hr className="w-4/5 border-2 border-dashed border-fuchsia-700" />
                  </div>
                </div>
              </div>
            )}
        </>
      ) : (
        <>
          {!viewMesh &&
            selectedProject?.planeWaveParameters &&
            simulationType === 'Electric Fields' && (
              <div
                className={`absolute right-[2%] gap-2 bottom-[50px] p-3 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer ${theme === 'light'
                  ? 'bg-white/80 text-gray-700 hover:bg-white hover:text-blue-600'
                  : 'bg-black/40 text-gray-300 border border-white/10 hover:bg-black/60 hover:text-blue-400'
                  }`}
                data-tip="Electric Fields Legend"
                onClick={() => setShowLegend(true)}
              >
                <LuClipboardList size={24} />
              </div>
            )}
        </>
      )}
    </>
  );
};

export function getMaterialListFrom(components: ComponentEntity[]) {
  const materialList: Material[] = [];
  components?.forEach((c) => {
    if (
      c.material?.name &&
      materialList.filter((m) => m.name === c.material?.name).length === 0
    ) {
      materialList.push(c.material);
    }
  });
  return materialList;
}

const NormalMeshVisualizationButton: FC<{}> = () => {
  const dispatch = useDispatch();
  const meshVisualization = useSelector(meshVisualizationSelector);
  const theme = useSelector(ThemeSelector);
  return (
    <div
      className="tooltip"
      data-tip={
        'Normal mesh visualization. It is the most detaild modality, but it can become heavy for big meshes.'
      }
    >
      <button
        className={`p-3 rounded-xl transition-all duration-300 ${meshVisualization !== 'normal'
          ? `${theme === 'light'
            ? 'bg-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            : 'bg-transparent text-gray-400 hover:text-blue-400 hover:bg-white/5'
          }`
          : `${theme === 'light'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
          }`
          }`}
        onClick={() => dispatch(setMeshVisualization('normal'))}
      >
        <LiaWeightHangingSolid className="h-6 w-6" />
      </button>
    </div>
  );
};

const LightMeshVisualizationButton: FC<{}> = () => {
  const dispatch = useDispatch();
  const meshVisualization = useSelector(meshVisualizationSelector);
  const theme = useSelector(ThemeSelector);
  return (
    <div
      className="tooltip"
      data-tip={
        'Light mesh visualization. It is suggested for very big meshes, in order to keep a seamless navigation.'
      }
    >
      <button
        className={`p-3 rounded-xl transition-all duration-300 ${meshVisualization !== 'light'
          ? `${theme === 'light'
            ? 'bg-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            : 'bg-transparent text-gray-400 hover:text-blue-400 hover:bg-white/5'
          }`
          : `${theme === 'light'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
          }`
          }`}
        onClick={() => dispatch(setMeshVisualization('light'))}
      >
        <LiaFeatherSolid className="h-6 w-6" />
      </button>
    </div>
  );
};

const SurfaceAdvicesButton: FC<{
  surfaceAdvices: boolean;
  setSurfaceAdvices: Function;
}> = ({ surfaceAdvices, setSurfaceAdvices }) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  return (
    <div
      className="tooltip tooltip-bottom"
      data-tip={
        surfaceAdvices ? 'Hide Surface Advices' : 'Show Surface Advices'
      }
    >
      <button
        className={`p-3 rounded-xl transition-all duration-300 ${theme === 'light'
          ? 'bg-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          : 'bg-transparent text-gray-400 hover:text-blue-400 hover:bg-white/5'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        onClick={() => setSurfaceAdvices(!surfaceAdvices)}
        disabled={
          (selectedProject && selectedProject?.simulation?.resultS3
            ? true
            : false) || (process.env.APP_VERSION === 'demo')
        }
      >
        {surfaceAdvices ? (
          <BiShow className="h-6 w-6" />
        ) : (
          <BiHide className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

const PositioningPortsInfo: FC = () => {
  const theme = useSelector(ThemeSelector);
  return (
    <div
      className={`absolute bottom-20 right-5 flex flex-col rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${theme === 'light'
        ? 'bg-white/90 border-white/40 text-gray-800'
        : 'bg-black/60 border-white/10 text-gray-200'
        } text-sm text-start p-4 max-w-[300px] max-h-[300px] overflow-y-scroll custom-scrollbar`}
    >
      <span className="font-semibold mb-2">
        Once you have added a new termination, you can place it in the following
        ways:
      </span>
      <ul className="list-decimal ml-4 space-y-1 opacity-80">
        <li>double clicking on model surface point of interest;</li>
        <li>
          <span className="w-full">
            enabling termination location suggestions by clicking on
          </span>
          <div className="inline mx-2 align-middle">
            <BiHide className="w-5 h-5 inline text-blue-500" />
          </div>
          <span className="w-full">
            button on top of the model, then double clicking on suggestions
            shown;
          </span>
        </li>
        <li>
          using the input fields in the terminations section in the right
          sidebar
        </li>
        <li>
          using controls shown directly on the selected port (discouraged).
        </li>
      </ul>
    </div>
  );
};
