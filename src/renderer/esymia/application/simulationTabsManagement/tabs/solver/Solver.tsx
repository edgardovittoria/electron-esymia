import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SelectedFolderSelector,
  selectedProjectSelector,
  setPathToExternalGridsNotFound,
} from '../../../../store/projectSlice';
import { SolverSettings } from './components/SolverSettings';
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
  const toggleResetFocus = () => setResetFocus(!resetFocus);
  const { loadMeshData, cloneProject } = useStorageData();
  const mesherStatus = useSelector(MesherStatusSelector);
  const [selectedTabRightPanel, setSelectedTabRightPanel] = useState<
    string | undefined
  >(undefined);
  const [savedPhysicsParameters, setSavedPhysicsParameters] = useState(true);
  const [simulationType, setsimulationType] = useState<
    'Matrix' | 'Electric Fields'
  >(selectedProject?.simulation ? selectedProject.simulation.simulationType : "Matrix");
  const awsExternalGridsData = useSelector(AWSExternalGridsDataSelector);

  const risExternalGridsFormat = (extGridsJson: any) => {
    console.log(extGridsJson);
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
        loadMeshData(true);
      }
    }
  }, [selectedProject?.meshData.meshGenerated, mesherStatus]);

  useEffect(() => {
    console.log(awsExternalGridsData);
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
        ).then(() => {});
      }
    }
  }, [savedPhysicsParameters]);

  return (
    <>
      {spinner && mesherStatus === 'ready' && (
        <div className="absolute top-1/2 left-1/2">
          <ImSpinner className="animate-spin w-8 h-8" />
        </div>
      )}
      {process.env.MESHER_RIS_MODE === 'backend' &&
        (mesherStatus === 'idle' || mesherStatus === 'starting') && (
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
      />
      <div
        className={`absolute left-[2%] top-[230px] rounded max-h-[500px] flex flex-col items-center gap-0 ${
          theme === 'light'
            ? 'bg-white text-textColor'
            : 'bg-bgColorDark2 text-textColorDark'
        }`}
      >
        <button
          disabled={
            selectedProject &&
            selectedProject.simulation &&
            selectedProject.simulation.status === 'Running'
          }
          className={`p-2 tooltip rounded-t tooltip-right relative z-10 disabled:opacity-40`}
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
          <GrClone
            style={{ width: '25px', height: '25px' }}
            className={`${cloning ? 'opacity-20' : 'opacity-100'}`}
          />
          {cloning && (
            <ImSpinner className="absolute z-50 top-3 bottom-1/2 animate-spin w-5 h-5" />
          )}
        </button>
      </div>
      {showAdvices && <PositioningPortsInfo />}
      <div className="absolute left-1/2 -translate-x-1/2 gap-2 top-[180px] flex flex-col items-center">
        <div className="gap-2 flex flex-row">
          {selectedProject?.model.components && (
            <>
              <SurfaceAdvicesButton
                surfaceAdvices={surfaceAdvices}
                setSurfaceAdvices={setSurfaceAdvices}
              />
              <ResetFocusButton toggleResetFocus={toggleResetFocus} />
              <div>
                <div
                  className={`tooltip rounded tooltip-right ${
                    theme === 'light'
                      ? 'bg-white text-blue-500'
                      : 'bg-bgColorDark2 text-blue-300'
                  } p-2`}
                  data-tip="Port Positioning Info"
                  onClick={() => setShowAdvices(!showAdvices)}
                >
                  <GrStatusInfo size={18} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {viewMesh && (
        <div className="absolute left-1/2 -translate-x-1/2 gap-2 top-[180px] flex flex-row">
          <ResetFocusButton toggleResetFocus={toggleResetFocus} />
          <OriginaProportionsButton />
          <AlteredProportionsButton threshold={3} />
          <NormalMeshVisualizationButton />
          <LightMeshVisualizationButton />
        </div>
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
        className={`rounded p-2 ${
          meshVisualization !== 'normal'
            ? `${
                theme === 'light'
                  ? 'bg-white text-green-300 hover:text-secondaryColor'
                  : 'bg-bgColorDark2 text-secondaryColorDark'
              }`
            : `${
                theme === 'light'
                  ? 'bg-green-300 text-secondaryColor'
                  : 'bg-secondaryColorDark text-secondaryColor'
              }`
        }`}
        onClick={() => dispatch(setMeshVisualization('normal'))}
      >
        <LiaWeightHangingSolid className="h-5 w-5" />
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
        className={`rounded p-2 ${
          meshVisualization !== 'light'
            ? `${
                theme === 'light'
                  ? 'bg-white text-green-300 hover:text-secondaryColor'
                  : 'bg-bgColorDark2 text-secondaryColorDark'
              }`
            : `${
                theme === 'light'
                  ? 'bg-green-300 text-secondaryColor'
                  : 'bg-secondaryColorDark text-secondaryColor'
              }`
        }`}
        onClick={() => dispatch(setMeshVisualization('light'))}
      >
        <LiaFeatherSolid className="h-5 w-5" />
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
      className="tooltip"
      data-tip={
        surfaceAdvices ? 'Hide Surface Advices' : 'Show Surface Advices'
      }
    >
      <button
        className={`${
          theme === 'light'
            ? 'bg-white text-textColor'
            : 'bg-bgColorDark2 text-textColorDark'
        } rounded p-2 disabled:opacity-40`}
        onClick={() => setSurfaceAdvices(!surfaceAdvices)}
        disabled={
          selectedProject && selectedProject?.simulation?.resultS3
            ? true
            : false
        }
      >
        {surfaceAdvices ? (
          <BiShow className="h-5 w-5 text-green-300 hover:text-secondaryColor" />
        ) : (
          <BiHide className="h-5 w-5 text-green-300 hover:text-secondaryColor" />
        )}
      </button>
    </div>
  );
};

const PositioningPortsInfo: FC = () => {
  const theme = useSelector(ThemeSelector);
  return (
    <div
      className={`absolute bottom-20 right-5 flex flex-col ${
        theme === 'light'
          ? 'bg-white text-textColor'
          : 'bg-bgColorDark2 text-textColorDark'
      } shadow-2xl text-sm text-start p-[10px] max-w-[300px] max-h-[300px] overflow-y-scroll`}
    >
      <span className="font-semibold">
        Once you have added a new termination, you can place it in the following
        ways:
      </span>
      <div className="list-decimal ml-3 mt-2">
        <li>double clicking on model surface point of interest;</li>
        <li>
          <span className="w-full">
            enabling termination location suggestions by clicking on
          </span>
          <div className="inline mx-2">
            <BiHide className="w-5 h-5 inline text-green-300" />
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
      </div>
    </div>
  );
};
