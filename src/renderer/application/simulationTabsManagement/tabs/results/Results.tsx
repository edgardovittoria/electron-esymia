import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteSimulation,
  findSelectedPort,
  selectedProjectSelector,
  selectPort, setMeshApproved,
} from "../../../../store/projectSlice";
import { ChartVisualizationMode } from "./ChartVisualizationMode";
import {ChartsList} from "./ChartsList";
import { ResultsLeftPanelTab } from "./ResultsLeftPanelTab";
import { Models } from "../../sharedElements/Models";
import { ModelOutliner } from "../../sharedElements/ModelOutliner";
import { MyPanel } from "../../sharedElements/MyPanel";
import { useFaunaQuery } from "cad-library";
import { updateProjectInFauna } from "../../../../faunadb/projectsFolderAPIs";
import { convertInFaunaProjectThis } from "../../../../faunadb/apiAuxiliaryFunctions";
import {Project} from "../../../../model/esymiaModels";
import { alertMessageStyle, comeBackToModelerMessage, emptyResultsMessage } from '../../../config/textMessages';

interface ResultsProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}

export const Results: React.FC<ResultsProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  let selectedPort = findSelectedPort(selectedProject);
  const dispatch = useDispatch();
  const [selectedLabel, setSelectedLabel] = useState<{ label: string, id: number }[]>([{label: "All Ports", id: 0}])
  const [chartsScaleMode, setChartsScaleMode] = useState<
    "logarithmic" | "linear"
  >("logarithmic");
  const [chartVisualizationMode, setChartVisualizationMode] = useState<
    "grid" | "full"
  >("grid");
  const [graphToVisualize, setGraphToVisualize] = useState<"All Graph" | "Z" | "S" | "Y">("All Graph")
  const { execQuery } = useFaunaQuery();

  return (
    <div className="flex">
      <div className="w-[20%]">
        <MyPanel
          tabs={["Modeler", "Results"]}
          selectedTab={selectedTabLeftPanel}
          setSelectedTab={setSelectedTabLeftPanel}
          className="absolute left-[2%] top-[160px] w-1/6"
        >
          {selectedTabLeftPanel === "Results" ? (
            <ResultsLeftPanelTab
              selectedPort={selectedPort ? selectedPort.name : "undefined"}
              setSelectedPort={(portName: string) =>
                dispatch(selectPort(portName))
              }
            />
          ) : (
            <Models>
              <ModelOutliner />
            </Models>
          )}
          {(selectedProject?.simulation) &&
            <button
              type="button"
              className="button buttonPrimary w-full mt-2 hover:opacity-80 disabled:opacity-60 text-sm"
              onClick={() => {
                dispatch(deleteSimulation(selectedProject.faunaDocumentId))
                dispatch(setMeshApproved(false));
                execQuery(updateProjectInFauna,
                  convertInFaunaProjectThis(
                    { ...selectedProject, simulation: undefined, meshData: { ...selectedProject?.meshData, meshApproved: false } } as Project
                  )
                )
              }
              }
            >
              REMOVE RESULTS
            </button>}
        </MyPanel>
      </div>
      <div className="w-[78%]">
        {selectedProject && selectedProject.simulation ? (
            <>
              {selectedTabLeftPanel === "Results" && (
                <ChartVisualizationMode
                  chartVisualizationMode={chartVisualizationMode}
                  setChartVisualizationMode={setChartVisualizationMode}
                  chartsScaleMode={chartsScaleMode}
                  setChartsScaleMode={setChartsScaleMode}
                  setGraphToVisualize={setGraphToVisualize}
                  selectedLabel={selectedLabel}
                  setSelectedLabel={setSelectedLabel}
                />
              )}
              <div className={chartVisualizationMode === "full" ? "overflow-scroll grid grid-cols-1 gap-4 max-h-[77vh] pb-10": "grid grid-cols-2 gap-4 overflow-scroll max-h-[77vh] pb-10"}>
                <ChartsList
                  scaleMode={chartsScaleMode}
                  graphToVisualize={graphToVisualize}
                  selectedLabel={selectedLabel}
                />
              </div>
            </>
        ) : (
          <div className="absolute top-1/2 flex justify-center w-[78%]">
            <span className={alertMessageStyle}>{emptyResultsMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
