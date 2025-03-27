import { Materials } from './Materials';
import { Models } from '../../sharedElements/Models';
import { ModelOutliner } from '../../sharedElements/ModelOutliner';
import StatusBar from '../../sharedElements/StatusBar';
import { CanvasModeler } from './CanvasModeler';
import { modelerLeftPanelTitle } from '../../../config/panelTitles';
import { GiAtomicSlashes, GiCubeforce } from 'react-icons/gi';
import { useEffect, useState } from 'react';
import { GrClone } from 'react-icons/gr';
import { useStorageData } from '../simulator/rightPanelSimulator/hook/useStorageData';
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
import { s3 } from '../../../../aws/s3Config';
import { ImportActionParamsObject, ImportModelFromDBModal, CanvasState } from "../../../../../cad_library";
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { ResetFocusButton } from '../../sharedElements/ResetFocusButton';
import { useDynamoDBQuery } from '../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../dynamoDB/projectsFolderApi';
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
      <CanvasModeler setShowModalLoadFromDB={setShowModalLoadFromDB} resetFocus={resetFocus}/>
      <StatusBar />
      <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0">
        <div
          className={`p-2 tooltip rounded-t tooltip-right ${
            selectedTabLeftPanel === modelerLeftPanelTitle.first
              ? `${theme === 'light' ? 'text-white bg-primaryColor' : 'text-textColor bg-secondaryColorDark'}`
              : `${theme === 'light' ? 'text-primaryColor bg-white' : 'text-textColorDark bg-bgColorDark2'}`
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
              ? `${theme === 'light' ? 'text-white bg-primaryColor' : 'text-textColor bg-secondaryColorDark'}`
              : `${theme === 'light' ? 'text-primaryColor bg-white' : 'text-textColorDark bg-bgColorDark2'}`
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
          <div className={`${theme === 'light' ? 'text-textColor bg-white' : 'text-textColorDark bg-bgColorDark2'} p-3 absolute xl:left-[5%] left-[6%] top-[180px] rounded md:w-1/4 xl:w-[15%]`}>
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
      <div className="absolute left-[2%] top-[270px] rounded max-h-[500px] flex flex-col items-center gap-0">
        <button
          disabled={
            selectedProject &&
            (typeof(selectedProject.portsS3) === "string" || typeof(selectedProject.meshData.mesh) === "string")
          }
          className={`p-2 tooltip rounded-t tooltip-right relative z-10 disabled:opacity-40 ${theme === 'light' ? 'text-primaryColor bg-white' : 'text-textColorDark bg-bgColorDark2'}`}
          data-tip="Change Model"
          onClick={() => {
            setShowModalLoadFromDB(true)
          }}
        >
          <FiEdit
            style={{ width: '25px', height: '25px' }}
            className={`${cloning ? 'opacity-20' : 'opacity-100'}`}
          />
        </button>
      </div>
      <div className="absolute left-[2%] top-[320px] rounded max-h-[500px] flex flex-col items-center gap-0">
        <button
          disabled={
            selectedProject &&
            selectedProject.simulation &&
            selectedProject.simulation.status === 'Running'
          }
          className={`p-2 tooltip rounded tooltip-right relative z-10 disabled:opacity-40 ${theme === 'light' ? 'text-primaryColor bg-white' : 'text-textColorDark bg-bgColorDark2'}`}
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
      {showModalLoadFromDB && (
        <ImportModelFromDBModal
          s3Config={s3}
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
                  ).then(() => {});
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
      <div className="absolute lg:left-[48%] left-[38%] gap-2 top-[180px] flex flex-row">
        <ResetFocusButton toggleResetFocus={toggleResetFocus} />
      </div>
    </div>
  );
};
