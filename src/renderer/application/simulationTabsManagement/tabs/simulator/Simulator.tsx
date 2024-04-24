import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ComponentEntity, Material } from 'cad-library';
import {
  selectedProjectSelector,
  setMeshGenerated,
} from '../../../../store/projectSlice';
import { SimulatorLeftPanelTab } from './SimulatorLeftPanelTab';
import { RightPanelSimulator } from './rightPanelSimulator/RightPanelSimulator';
import { MyPanel } from '../../sharedElements/MyPanel';
import { Models } from '../../sharedElements/Models';
import { ModelOutliner } from '../../sharedElements/ModelOutliner';
import { s3 } from '../../../../aws/s3Config';
import { ExternalGridsObject, Project } from '../../../../model/esymiaModels';
import StatusBar from '../../sharedElements/StatusBar';
import { CanvasSimulator } from './CanvasSimulator';
import { ResetFocusButton } from '../../sharedElements/ResetFocusButton';
import { simulatorLeftPanelTitle } from '../../../config/panelTitles';

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
  const toggleResetFocus = () => setResetFocus(!resetFocus)

  useEffect(() => {
    if (selectedProject?.meshData.mesh) {
      setExternalGrids(undefined);
      s3.getObject(
        {
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
          Key: selectedProject.meshData.externalGrids as string,
        },
        (err, data) => {
          if (err) {
            console.log(err);
          }
          setExternalGrids(
            JSON.parse(data.Body?.toString() as string) as ExternalGridsObject,
          );
          dispatch(setMeshGenerated('Generated'));
        },
      );
    }
  }, [selectedProject?.meshData.externalGrids]);

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
      <CanvasSimulator externalGrids={externalGrids} selectedMaterials={selectedMaterials} resetFocus={resetFocus}/>
      <StatusBar voxelsPainted={voxelsPainted} totalVoxels={totalVoxels} />
      <MyPanel
        tabs={[simulatorLeftPanelTitle.first, simulatorLeftPanelTitle.second]}
        selectedTab={selectedTabLeftPanel}
        setSelectedTab={setSelectedTabLeftPanel}
        className="absolute left-[2%] top-[160px] md:w-1/4 xl:w-1/5"
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
      <div className='absolute lg:left-[48%] left-[38%] gap-2 top-[160px] flex flex-row'>
        <ResetFocusButton toggleResetFocus={toggleResetFocus}/>
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
