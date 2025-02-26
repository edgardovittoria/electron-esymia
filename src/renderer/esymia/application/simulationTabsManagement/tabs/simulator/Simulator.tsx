import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  meshValidTopologySelector,
  pathToExternalGridsNotFoundSelector,
  SelectedFolderSelector,
  selectedProjectSelector,
  setPathToExternalGridsNotFound,
} from '../../../../store/projectSlice';
import { SimulatorLeftPanelTab } from './SimulatorLeftPanelTab';
import { RightPanelSimulator } from './rightPanelSimulator/RightPanelSimulator';
import { MyPanel } from '../../sharedElements/MyPanel';
import { Models } from '../../sharedElements/Models';
import { ModelOutliner } from '../../sharedElements/ModelOutliner';
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
import { CanvasSimulator } from './CanvasSimulator';
import { ResetFocusButton } from '../../sharedElements/ResetFocusButton';
import { simulatorLeftPanelTitle } from '../../../config/panelTitles';
import { OriginaProportionsButton } from './OriginalProportionsButton';
import { AlteredProportionsButton } from './AlteredProportionsButton';
import { ImSpinner } from 'react-icons/im';
import { useStorageData } from './rightPanelSimulator/hook/useStorageData';
import {
  AWSExternalGridsDataSelector,
  meshVisualizationSelector,
  setMeshVisualization,
  ThemeSelector,
  unsetAWSExternalGridsData,
} from '../../../../store/tabsAndMenuItemsSlice';
import { LiaFeatherSolid, LiaWeightHangingSolid } from 'react-icons/lia';
import { BiInfoCircle } from 'react-icons/bi';
import { Brick } from './rightPanelSimulator/components/createGridsExternals';
import { GiAtomicSlashes, GiCubeforce } from 'react-icons/gi';
import { GrClone } from 'react-icons/gr';
import { ComponentEntity, Material } from '../../../../../cad_library';
import { MesherStatusSelector } from '../../../../store/pluginsSlice';

interface SimulatorProps {
  selectedTabLeftPanel: string | undefined;
  setSelectedTabLeftPanel: Function;
}

export const Simulator: React.FC<SimulatorProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  const [externalGrids, setExternalGrids] = useState<
    ExternalGridsObject | ExternalGridsRisObject | undefined
  >(undefined);
  const [voxelsPainted, setVoxelsPainted] = useState(0);
  const [totalVoxels, setTotalVoxels] = useState(0);

  const [cloning, setcloning] = useState<boolean>(false)
  const selectedProject = useSelector(selectedProjectSelector)
  const selectedFolder = useSelector(SelectedFolderSelector)
  const theme = useSelector(ThemeSelector)
  const validTopology = useSelector(meshValidTopologySelector)
  const dispatch = useDispatch();
  const [resetFocus, setResetFocus] = useState(false);
  const [spinner, setSpinner] = useState<boolean>(false);
  const toggleResetFocus = () => setResetFocus(!resetFocus);
  const { loadMeshData, cloneProject } = useStorageData();
  const mesherStatus = useSelector(MesherStatusSelector)
  const pathToExternalGridsNotFound = useSelector(
    pathToExternalGridsNotFoundSelector,
  );
  const awsExternalGridsData = useSelector(AWSExternalGridsDataSelector);

  const risExternalGridsFormat = (extGridsJson: any) => {
    console.log(extGridsJson)
    let vertices: number[][] = [];
    for (let index = 0; index < extGridsJson.estremi_celle[0].length; index++) {
      vertices.push([])
    }
    (extGridsJson.estremi_celle as number[][]).forEach((row) => {
      row.forEach((element, rowIndex) => vertices[rowIndex].push(element))
    });
    return {vertices: vertices, materials: extGridsJson.materials as string[]} as ExternalGridsRisObject
  }

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

  // useEffect(() => {
  //   let subscription = client.subscribe('mesh_advices', (msg) => callback_mesh_advices(msg, dispatch), {ack: 'client'})
  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

  useEffect(() => {
    //caricamento dati nel caso il mesher è typescript
    //loadMeshData(false);
    if (
      selectedProject?.meshData.mesh && 
      //mesherStatus === "ready" &&
      (selectedProject?.meshData.meshGenerated === 'Generated' ||
        selectedProject?.meshData.meshGenerated === 'Queued')
    ) {
      setExternalGrids(undefined);
      setSpinner(true);
      if(selectedProject?.meshData.type === 'Ris') {
        loadMeshData(process.env.MESHER_RIS_MODE === 'backend');
      }else {
        loadMeshData(true);
      }
    }
  }, [selectedProject?.meshData.meshGenerated, mesherStatus]);

  useEffect(() => {
    console.log(awsExternalGridsData)
    if (awsExternalGridsData) {
      if (selectedProject?.meshData.type === 'Standard'){
        setExternalGrids(externalGridsDecode(awsExternalGridsData));
      }
      else if (selectedProject?.meshData.type === 'Ris') {
      setExternalGrids(risExternalGridsFormat(awsExternalGridsData));
      }
      dispatch(
        setPathToExternalGridsNotFound({
          status: false,
          projectToUpdate: selectedProject?.faunaDocumentId as string,
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
      const numberOfCells = Object.values((externalGrids as ExternalGridsObject).externalGrids).reduce(
        (prev, current) => {
          return prev + current.length;
        },
        0,
      );
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
  >(undefined);

  useEffect(() => {
    setSelectedTabLeftPanel(undefined)
  },[])

  return (
    <>
      {spinner && !pathToExternalGridsNotFound && (
        <div className="absolute top-1/2 left-1/2">
          <ImSpinner className="animate-spin w-8 h-8" />
        </div>
      )}
      <CanvasSimulator
        externalGrids={externalGrids}
        selectedMaterials={selectedMaterials}
        resetFocus={resetFocus}
        setResetFocus={toggleResetFocus}
      />
      <StatusBar voxelsPainted={voxelsPainted} totalVoxels={totalVoxels} />
      {/* {validTopology !== undefined &&
        <div className="tooltip tooltip-left absolute right-[2%] top-[180px]" data-tip={`${validTopology ? 'Mesh Topology Valid' : 'Mesh Topology NOT Valid try to refine or coarse the quantum'}`}>
          <div className={`badge ${validTopology ? 'bg-green-500' : 'bg-red-600'} badge-lg`}></div>
      </div>
      } */}
      <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0">
        <div
          className={`p-2 tooltip rounded-t tooltip-right ${
            selectedTabLeftPanel === simulatorLeftPanelTitle.first
              ? `${theme === 'light' ? 'text-white bg-primaryColor' : 'text-textColor bg-secondaryColorDark'}`
              : `${theme === 'light' ? 'text-primaryColor bg-white' : 'text-textColorDark bg-bgColorDark2'}`
          }`}
          data-tip="Modeler"
          onClick={() => {
            if (selectedTabLeftPanel === simulatorLeftPanelTitle.first) {
              setSelectedTabLeftPanel(undefined);
            } else {
              setSelectedTabLeftPanel(simulatorLeftPanelTitle.first);
            }
            setsidebarItemSelected(undefined)
          }}
        >
          <GiCubeforce style={{ width: '25px', height: '25px' }} />
        </div>
        <div
          className={`p-2 tooltip rounded-b tooltip-right ${
            selectedTabLeftPanel === simulatorLeftPanelTitle.second
              ? `${theme === 'light' ? 'text-white bg-primaryColor' : 'text-textColor bg-secondaryColorDark'}`
              : `${theme === 'light' ? 'text-primaryColor bg-white' : 'text-textColorDark bg-bgColorDark2'}`
          }`}
          data-tip="Materials"
          onClick={() => {
            if (selectedTabLeftPanel === simulatorLeftPanelTitle.second) {
              setSelectedTabLeftPanel(undefined);
            } else {
              setSelectedTabLeftPanel(simulatorLeftPanelTitle.second);
            }
            setsidebarItemSelected(undefined)
          }}
        >
          <GiAtomicSlashes style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      {selectedTabLeftPanel && (
        <>
          <div className={`${theme === 'light' ? 'text-textColor bg-white' : 'text-textColorDark bg-bgColorDark2'} p-3 absolute xl:left-[5%] left-[6%] top-[180px] rounded md:w-1/4 xl:w-[15%]`}>
            {selectedTabLeftPanel === simulatorLeftPanelTitle.first && (
              <Models>
                <ModelOutliner />
              </Models>
            )}
            {selectedTabLeftPanel === simulatorLeftPanelTitle.second && (
              <SimulatorLeftPanelTab
                allMaterials={allMaterials}
                selectedMaterials={selectedMaterials}
                setSelectedMaterials={setSelectedMaterials}
              />
            )}
          </div>
        </>
      )}
      <RightPanelSimulator
        selectedProject={selectedProject as Project}
        allMaterials={allMaterials}
        externalGrids={selectedProject?.meshData.type === 'Standard' ? (externalGrids as ExternalGridsObject) : undefined}
        spinnerLoadData={spinner}
        setsidebarItemSelected={setsidebarItemSelected}
        sidebarItemSelected={sidebarItemSelected}
        setSelectedTabLeftPanel={setSelectedTabLeftPanel}
      />
      <div className={`absolute left-[2%] top-[370px] rounded max-h-[500px] flex flex-col items-center gap-0 ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'}`}>
        <button
          disabled={selectedProject && selectedProject.simulation && selectedProject.simulation.status === "Running"}
          className={`p-2 tooltip rounded-t tooltip-right relative z-10 disabled:opacity-40`}
          data-tip="Clone Project"
          onClick={() => {
            setcloning(true)
            cloneProject(selectedProject as Project, selectedFolder as Folder, setcloning)
          }}
        >
          <GrClone style={{ width: '25px', height: '25px' }} className={`${cloning ? 'opacity-20' : 'opacity-100'}`} />
          {cloning && <ImSpinner className="absolute z-50 top-3 bottom-1/2 animate-spin w-5 h-5" />}
        </button>
      </div>
      {/* <MyPanel
        tabs={[simulatorLeftPanelTitle.first, simulatorLeftPanelTitle.second]}
        selectedTab={selectedTabLeftPanel}
        setSelectedTab={setSelectedTabLeftPanel}
        className="absolute left-[2%] top-[180px] md:w-1/4 xl:w-1/5"
      >
        {selectedTabLeftPanel === simulatorLeftPanelTitle.second ? (
          <SimulatorLeftPanelTab
            allMaterials={allMaterials}
            selectedMaterials={selectedMaterials}
            setSelectedMaterials={setSelectedMaterials}
          />
        ) : (
          <Models>
            <ModelOutliner />
          </Models>
        )}
      </MyPanel> */}

      <div className="absolute lg:left-[48%] left-[38%] gap-2 top-[180px] flex flex-row">
        <ResetFocusButton toggleResetFocus={toggleResetFocus} />
        <OriginaProportionsButton />
        <AlteredProportionsButton threshold={3} />
        <NormalMeshVisualizationButton />
        <LightMeshVisualizationButton />
      </div>
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
  const theme = useSelector(ThemeSelector)
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
            ? `${theme === 'light' ? 'bg-white text-green-300 hover:text-secondaryColor' : 'bg-bgColorDark2 text-secondaryColorDark'}`
            : `${theme === 'light' ? 'bg-green-300 text-secondaryColor' : 'bg-secondaryColorDark text-secondaryColor'}`
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
  const theme = useSelector(ThemeSelector)
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
            ? `${theme === 'light' ? 'bg-white text-green-300 hover:text-secondaryColor' : 'bg-bgColorDark2 text-secondaryColorDark'}`
            : `${theme === 'light' ? 'bg-green-300 text-secondaryColor' : 'bg-secondaryColorDark text-secondaryColor'}`
        }`}
        onClick={() => dispatch(setMeshVisualization('light'))}
      >
        <LiaFeatherSolid className="h-5 w-5" />
      </button>
    </div>
  );
};
