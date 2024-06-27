import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ComponentEntity, Material } from 'cad-library';
import {
  selectedProjectSelector,
} from '../../../../store/projectSlice';
import { SimulatorLeftPanelTab } from './SimulatorLeftPanelTab';
import { RightPanelSimulator } from './rightPanelSimulator/RightPanelSimulator';
import { MyPanel } from '../../sharedElements/MyPanel';
import { Models } from '../../sharedElements/Models';
import { ModelOutliner } from '../../sharedElements/ModelOutliner';
import { ExternalGridsObject, Project } from '../../../../model/esymiaModels';
import StatusBar from '../../sharedElements/StatusBar';
import { CanvasSimulator } from './CanvasSimulator';
import { ResetFocusButton } from '../../sharedElements/ResetFocusButton';
import { simulatorLeftPanelTitle } from '../../../config/panelTitles';
import { OriginaProportionsButton } from './OriginalProportionsButton';
import { AlteredProportionsButton } from './AlteredProportionsButton';
import { ImSpinner } from 'react-icons/im';
import { useStorageData } from './rightPanelSimulator/hook/useStorageData';
import { meshVisualizationSelector, setMeshVisualization } from '../../../../store/tabsAndMenuItemsSlice';
import { LiaFeatherSolid, LiaWeightHangingSolid } from "react-icons/lia";


interface SimulatorProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}

export const Simulator: React.FC<SimulatorProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  const [externalGrids, setExternalGrids] = useState<
    ExternalGridsObject | undefined
  >(undefined);
  const [voxelsPainted, setVoxelsPainted] = useState(0);
  const [totalVoxels, setTotalVoxels] = useState(0);

  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();
  const [resetFocus, setResetFocus] = useState(false)
  const [spinner, setSpinner] = useState<boolean>(false);
  const toggleResetFocus = () => setResetFocus(!resetFocus)
  const { loadMeshData } = useStorageData()

  // useEffect(() => {
  //   let subscription = client.subscribe('mesh_advices', (msg) => callback_mesh_advices(msg, dispatch), {ack: 'client'})
  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

  useEffect(() => {
    if (selectedProject?.meshData.mesh && selectedProject?.meshData.meshGenerated === "Generated") {
      setExternalGrids(undefined);
      setSpinner(true)
      loadMeshData(setSpinner, setExternalGrids)
    }
  }, [selectedProject?.meshData.meshGenerated]);

  useEffect(() => {
    setVoxelsPainted(0);
    if (externalGrids) {
      const numberOfCells = Object.values(externalGrids.externalGrids).reduce(
        (prev, current) => {
          return prev + current.length;
        },
        0,
      );
      setVoxelsPainted(numberOfCells);
      setTotalVoxels(
        externalGrids.n_cells.n_cells_x *
          externalGrids.n_cells.n_cells_y *
          externalGrids.n_cells.n_cells_z,
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

  return (
    <>
      {spinner &&
        <div className="absolute top-1/2 left-1/2">
          <ImSpinner className="animate-spin w-8 h-8" />
        </div>
      }
      <CanvasSimulator externalGrids={externalGrids} selectedMaterials={selectedMaterials} resetFocus={resetFocus} setResetFocus={toggleResetFocus}/>
      <StatusBar voxelsPainted={voxelsPainted} totalVoxels={totalVoxels} />
      <MyPanel
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
      </MyPanel>
      <RightPanelSimulator
        selectedProject={selectedProject as Project}
        allMaterials={allMaterials}
        externalGrids={externalGrids}
      />
      <div className='absolute lg:left-[48%] left-[38%] gap-2 top-[180px] flex flex-row'>
        <ResetFocusButton toggleResetFocus={toggleResetFocus}/>
        <OriginaProportionsButton />
        <AlteredProportionsButton threshold={3}/>
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
  const dispatch = useDispatch()
  const meshVisualization = useSelector(meshVisualizationSelector)
  return (
    <div
      className='tooltip'
      data-tip={
        'Normal mesh visualization. It is the most detaild modality, but it can become heavy for big meshes.'
      }
    >
      <button
        className={`rounded p-2 ${meshVisualization !== 'normal' ? 'bg-white text-green-300 hover:text-secondaryColor' : 'bg-green-300 text-secondaryColor'}`}
        onClick={() => dispatch(setMeshVisualization('normal'))}
      >
      <LiaWeightHangingSolid className='h-5 w-5'/>
      </button>
    </div>
  );
};

const LightMeshVisualizationButton: FC<{}> = () => {
  const dispatch = useDispatch()
  const meshVisualization = useSelector(meshVisualizationSelector)
  return (
    <div
      className='tooltip'
      data-tip={
        'Light mesh visualization. It is suggested for very big meshes, in order to keep a seamless navigation.'
      }
    >
      <button
        className={`rounded p-2 ${meshVisualization !== 'light' ? 'bg-white text-green-300 hover:text-secondaryColor' : 'bg-green-300 text-secondaryColor'}`}
        onClick={() => dispatch(setMeshVisualization('light'))}
      >
      <LiaFeatherSolid className='h-5 w-5'/>
      </button>
    </div>
  );
};
