import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteSimulation,
  findSelectedPort,
  selectedProjectSelector,
  selectPort, selectProject, setMeshApproved,
} from "../../../../store/projectSlice";
import { ChartVisualizationMode } from "./ChartVisualizationMode";
import {ChartsList} from "./ChartsList";
import { ResultsLeftPanelTab } from "./ResultsLeftPanelTab";
import { MyPanel } from "../../sharedElements/MyPanel";
import { useFaunaQuery } from "cad-library";
import { updateProjectInFauna } from "../../../../faunadb/projectsFolderAPIs";
import { convertInFaunaProjectThis } from "../../../../faunadb/apiAuxiliaryFunctions";
import {Project} from "../../../../model/esymiaModels";
import { alertMessageStyle, emptyResultsMessage, runningSimulationMessageOnResults } from '../../../config/textMessages';
import { resultsLeftPanelTitle } from '../../../config/panelTitles';
import { Dataset } from "./sharedElements";

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
  const [graphDataToExport, setGraphDataToExport] = useState<{ data: { datasets: Dataset[]; labels: number[] }; options: {}, representedFunction: string }[]>([])
  const { execQuery } = useFaunaQuery();

  useEffect(() => {
    setSelectedLabel([{label: "All Ports", id: 0}])
  }, [selectedProject])


  return (
    <div className="flex">
      <div className="w-[20%]">
        <MyPanel
          tabs={[resultsLeftPanelTitle.first]}
          selectedTab={selectedTabLeftPanel}
          setSelectedTab={setSelectedTabLeftPanel}
          className="absolute left-[2%] top-[180px] w-1/6"
        >
          <ResultsLeftPanelTab
            selectedPort={selectedPort ? selectedPort.name : "undefined"}
            setSelectedPort={(portName: string) =>
              dispatch(selectPort(portName))
            }
          />
        </MyPanel>
      </div>
      <div className="w-[78%]">
        {selectedProject && selectedProject.simulation && selectedProject.simulation.results.matrix_S ? (
            <>
              <ChartVisualizationMode
                chartVisualizationMode={chartVisualizationMode}
                setChartVisualizationMode={setChartVisualizationMode}
                chartsScaleMode={chartsScaleMode}
                setChartsScaleMode={setChartsScaleMode}
                setGraphToVisualize={setGraphToVisualize}
                selectedLabel={selectedLabel}
                setSelectedLabel={setSelectedLabel}
                graphDataToExport={graphDataToExport}
              />
              <div className={chartVisualizationMode === "full" ? "overflow-scroll grid grid-cols-1 gap-4 max-h-[77vh] pb-10": "grid grid-cols-2 gap-4 overflow-scroll max-h-[77vh] pb-10"}>
                <ChartsList
                  graphToVisualize={graphToVisualize}
                  selectedLabel={selectedLabel}
                  setGraphsData={setGraphDataToExport}
                  currentFreIndexq={selectedProject.simulation.results.freqIndex}
                />
              </div>
            </>
        ) : (
          <div className="absolute top-1/2 flex justify-center w-[78%]">
            <span className={alertMessageStyle}>{(selectedProject && selectedProject.simulation && selectedProject.simulation.status == 'Queued') ? runningSimulationMessageOnResults : emptyResultsMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
