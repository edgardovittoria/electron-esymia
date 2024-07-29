import { Materials } from './Materials';
import { MyPanel } from '../../sharedElements/MyPanel';
import { Models } from '../../sharedElements/Models';
import { ModelOutliner } from '../../sharedElements/ModelOutliner';
import StatusBar from '../../sharedElements/StatusBar';
import { CanvasModeler } from './CanvasModeler';
import { modelerLeftPanelTitle } from '../../../config/panelTitles';
import { GiAtomicSlashes, GiCubeforce } from 'react-icons/gi';
import { useEffect, useState } from 'react';
import { GrClone } from 'react-icons/gr';
import { useStorageData } from '../simulator/rightPanelSimulator/hook/useStorageData';
import { useSelector } from 'react-redux';
import { SelectedFolderSelector, selectedProjectSelector } from '../../../../store/projectSlice';
import { Folder, Project } from '../../../../model/esymiaModels';
import { ImSpinner } from 'react-icons/im';

interface ModelerProps {
  selectedTabLeftPanel: string | undefined;
  setSelectedTabLeftPanel: Function;
}

export const Modeler: React.FC<ModelerProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  useEffect(() => {
    setSelectedTabLeftPanel(undefined)
  },[])

  const { cloneProject } = useStorageData()
  const [cloning, setcloning] = useState<boolean>(false)
  const selectedProject = useSelector(selectedProjectSelector)
  const selectedFolder = useSelector(SelectedFolderSelector)

  return (
    <div>
      <CanvasModeler />
      <StatusBar />
      <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0 bg-white">
        <div
          className={`p-2 tooltip rounded-t tooltip-right ${
            selectedTabLeftPanel === modelerLeftPanelTitle.first
              ? 'text-white bg-primaryColor'
              : 'text-primaryColor bg-white'
          }`}
          data-tip="Modeler"
          onClick={() => {
            if (selectedTabLeftPanel === modelerLeftPanelTitle.first) {
              setSelectedTabLeftPanel(undefined);
            } else {
              setSelectedTabLeftPanel(modelerLeftPanelTitle.first);
            }
          }}
        >
          <GiCubeforce style={{ width: '25px', height: '25px' }} />
        </div>
        <div
          className={`p-2 tooltip rounded-b tooltip-right ${
            selectedTabLeftPanel === modelerLeftPanelTitle.second
              ? 'text-white bg-primaryColor'
              : 'text-primaryColor bg-white'
          }`}
          data-tip="Materials"
          onClick={() => {
            if (selectedTabLeftPanel === modelerLeftPanelTitle.second) {
              setSelectedTabLeftPanel(undefined);
            } else {
              setSelectedTabLeftPanel(modelerLeftPanelTitle.second);
            }
          }}
        >
          <GiAtomicSlashes style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      {selectedTabLeftPanel && (
        <>
          <div className="bg-white p-3 absolute xl:left-[5%] left-[6%] top-[180px] rounded md:w-1/4 xl:w-[15%]">
            {selectedTabLeftPanel === modelerLeftPanelTitle.first && (
              <Models>
                <ModelOutliner />
              </Models>
            )}
            {selectedTabLeftPanel === modelerLeftPanelTitle.second && (
              <Materials />
            )}
          </div>
        </>
      )}
      <div className="absolute left-[2%] top-[270px] rounded max-h-[500px] flex flex-col items-center gap-0 bg-white">
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
    </div>
  );
};
