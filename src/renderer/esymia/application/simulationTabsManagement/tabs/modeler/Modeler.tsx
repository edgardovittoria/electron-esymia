import { Materials } from './Materials';
import { Models } from '../../sharedElements/Models';
import { ModelOutliner } from '../../sharedElements/ModelOutliner';
import StatusBar from '../../sharedElements/StatusBar';
import { CanvasModeler } from './CanvasModeler';
import { modelerLeftPanelTitle } from '../../../config/panelTitles';
import { GiAtomicSlashes, GiCubeforce } from 'react-icons/gi';
import { useEffect, useState } from 'react';
import { GrClone } from 'react-icons/gr';
import { useDispatch, useSelector } from 'react-redux';
import {
  importModel,
  SelectedFolderSelector,
  selectedProjectSelector,
  setBricksS3,
  setModelS3,
  setModelUnit,
} from '../../../../store/projectSlice';
import { Folder, Project } from '../../../../model/esymiaModels';
import { ImSpinner } from 'react-icons/im';
import { FiEdit } from 'react-icons/fi';
import { ImportActionParamsObject, ImportModelFromDBModal, CanvasState } from "../../../../../cad_library";
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { ResetFocusButton } from '../../sharedElements/ResetFocusButton';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../dynamoDB/projectsFolderApi';
import { s3 } from '../../../../../cadmia/aws/s3Config';
import { useStorageData } from '../../hook/useStorageData';


interface ModelerProps {
  selectedTabLeftPanel: string | undefined;
  setSelectedTabLeftPanel: Function;
}

export const Modeler: React.FC<ModelerProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  const { cloneProject } = useStorageData();
  const [cloning, setcloning] = useState<boolean>(false);
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedFolder = useSelector(SelectedFolderSelector);
  const theme = useSelector(ThemeSelector)
  const { execQuery2 } = useDynamoDBQuery()
  const dispatch = useDispatch();
  const [resetFocus, setResetFocus] = useState(false);
  const toggleResetFocus = () => setResetFocus(!resetFocus);

  const [showModalLoadFromDB, setShowModalLoadFromDB] = useState(false);

  useEffect(() => {
    setSelectedTabLeftPanel(undefined);
  }, []);

  return (
    <div>
      <CanvasModeler setShowModalLoadFromDB={setShowModalLoadFromDB} resetFocus={resetFocus} />
      <StatusBar />
      <div className="absolute left-[2%] top-4 flex flex-col items-center gap-2">
        <div
          className={`p-3 rounded-xl transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md ${selectedTabLeftPanel === modelerLeftPanelTitle.first
            ? (theme === 'light' ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-blue-600 text-white shadow-blue-600/30')
            : (theme === 'light' ? 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500' : 'bg-black/40 text-gray-400 hover:bg-black/60 hover:text-blue-400 border border-white/10')
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
          <GiCubeforce size={24} />
        </div>
        <div
          className={`p-3 rounded-xl transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md ${selectedTabLeftPanel === modelerLeftPanelTitle.second
            ? (theme === 'light' ? 'bg-purple-500 text-white shadow-purple-500/30' : 'bg-purple-600 text-white shadow-purple-600/30')
            : (theme === 'light' ? 'bg-white/80 text-gray-600 hover:bg-white hover:text-purple-500' : 'bg-black/40 text-gray-400 hover:bg-black/60 hover:text-purple-400 border border-white/10')
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
          <GiAtomicSlashes size={24} />
        </div>
        <button
          disabled={
            selectedProject &&
            (typeof (selectedProject.portsS3) === "string" || typeof (selectedProject.meshData.mesh) === "string")
          }
          className={`p-3 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${theme === 'light'
            ? 'bg-white/80 text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-blue-500/20'
            : 'bg-black/40 text-gray-300 border border-white/10 hover:bg-black/60 hover:text-blue-400 hover:border-blue-500/30'
            }`}
          data-tip="Change Model"
          onClick={() => {
            setShowModalLoadFromDB(true)
          }}
        >
          <FiEdit size={24} className={`${cloning ? 'opacity-20' : 'opacity-100'}`} />
        </button>

        <button
          disabled={
            (selectedProject &&
              selectedProject.simulation &&
              selectedProject.simulation.status === 'Running') ||
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
      {selectedTabLeftPanel && (
        <>
          <div className={`absolute left-[6%] max-h-[calc(100vh-600px)] xl:left-[5%] top-4 bottom-4 p-4 rounded-2xl shadow-2xl backdrop-blur-md border transition-all duration-300 md:w-1/4 xl:w-[15%] overflow-hidden flex flex-col ${theme === 'light'
            ? 'bg-white/90 border-white/40'
            : 'bg-black/60 border-white/10 text-gray-200'
            }`}>
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
      {showModalLoadFromDB && (
        <ImportModelFromDBModal
          bucket={process.env.REACT_APP_AWS_BUCKET_NAME as string}
          showModalLoad={setShowModalLoadFromDB}
          importAction={(importActionParamsObject) => {
            dispatch(importModel(importActionParamsObject))
            dispatch(setModelUnit(importActionParamsObject.unit))
            dispatch(setModelS3(importActionParamsObject.modelS3 as string))
            dispatch(setBricksS3(importActionParamsObject.bricks as string))
            execQuery2(
              createOrUpdateProjectInDynamoDB,
              {
                ...selectedProject,
                modelS3: importActionParamsObject.modelS3,
                bricks: importActionParamsObject.bricks,
                modelUnit: importActionParamsObject.unit,
              } as Project,
              dispatch,
            ).then(() => { });
          }}
          importActionParams={
            {
              canvas: {
                components: [],
                lastActionType: "",
                numberOfGeneratedKey: 0,
                selectedComponentKey: 0,
              } as CanvasState,
              unit: "mm",
              id: selectedProject?.id,
            } as ImportActionParamsObject
          }
        />
      )}
      <div className="absolute lg:left-[48%] left-[38%] gap-2 top-0 flex flex-row">
        <ResetFocusButton toggleResetFocus={toggleResetFocus} />
      </div>
    </div>
  );
};
