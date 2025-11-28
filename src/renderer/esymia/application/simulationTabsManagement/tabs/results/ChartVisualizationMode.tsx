import React from 'react';
import { BsGrid3X3Gap } from 'react-icons/bs';
import { GiHamburgerMenu } from 'react-icons/gi';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../store/projectSlice';
import { Port } from '../../../../model/esymiaModels';
import { Dataset, pairs } from './sharedElements';
import { removeItemToResultsView, setSpinnerSolverResults, ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import axios from 'axios';

interface ChartVisualizationModeProps {
  chartVisualizationMode: 'grid' | 'full';
  setChartVisualizationMode: Function;
  chartsScaleMode: 'logarithmic' | 'linear';
  setChartsScaleMode: Function;
  setGraphToVisualize: Function;
  selectedLabel: { label: string; id: number }[];
  setSelectedLabel: Function;
  graphDataToExport: {
    data: { datasets: Dataset[]; labels: number[] };
    options: {};
    representedFunction: string;
  }[];
}

export const ChartVisualizationMode: React.FC<ChartVisualizationModeProps> = ({
  chartVisualizationMode,
  setChartVisualizationMode,
  chartsScaleMode,
  setChartsScaleMode,
  setGraphToVisualize,
  selectedLabel,
  setSelectedLabel,
  graphDataToExport,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  const ports = selectedProject?.ports.filter(
    (p) => p.category === 'port',
  ) as Port[];
  const labels = pairs(ports.map((p) => p.name));
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (labels.length > 0 && selectedLabel.length === 0) {
      // Default to the first label if nothing is selected
      const defaultLabel = `${labels[0][0]} - ${labels[0][1]}`;
      setSelectedLabel([{ label: defaultLabel, id: 0 }]);

      // Trigger data fetch for the default label
      dispatch(setSpinnerSolverResults(true));
      axios.post('http://127.0.0.1:8001/get_results_matrix?file_id=' + selectedProject?.simulation?.resultS3, {
        fileId: selectedProject?.simulation?.resultS3,
        port_index: 0
      }).then(res => console.log(res)).catch(err => console.log(err));
    }
  }, [labels.length, selectedLabel.length, selectedProject?.simulation?.resultS3, dispatch, setSelectedLabel]);

  return (
    <div className="mt-8 flex justify-between items-center">
      <div className="flex gap-2">
        <div
          className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${chartVisualizationMode === 'grid'
            ? (theme === 'light' ? 'bg-green-50 border-green-500 text-green-600' : 'bg-green-900/20 border-green-500 text-green-400')
            : (theme === 'light' ? 'bg-white border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600' : 'bg-white/5 border-white/10 text-gray-500 hover:border-green-500 hover:text-green-400')
            }`}
          onClick={() => setChartVisualizationMode('grid')}
        >
          <BsGrid3X3Gap size={20} />
        </div>
        <div
          className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${chartVisualizationMode === 'full'
            ? (theme === 'light' ? 'bg-green-50 border-green-500 text-green-600' : 'bg-green-900/20 border-green-500 text-green-400')
            : (theme === 'light' ? 'bg-white border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600' : 'bg-white/5 border-white/10 text-gray-500 hover:border-green-500 hover:text-green-400')
            }`}
          onClick={() => setChartVisualizationMode('full')}
        >
          <GiHamburgerMenu size={20} />
        </div>
      </div>
      <div className="flex justify-center items-center gap-2">
        <select
          className={`select select-sm w-full max-w-xs h-[40px] text-sm rounded-xl border outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${theme === 'light'
            ? 'bg-white text-gray-700 border-gray-200 focus:border-green-500'
            : 'bg-black/20 text-gray-200 border-white/10 focus:border-green-500'
            } disabled:opacity-35 disabled:cursor-not-allowed`}
          onChange={(e) => setGraphToVisualize(e.currentTarget.value)}
          disabled={selectedProject?.simulation?.status !== "Completed"}
          defaultValue={'All Graph'}
        >
          <option>All Graph</option>
          <option>Z</option>
          <option>Y</option>
          <option>S</option>
        </select>

        <div className="dropdown dropdown-bottom dropdown-end z-40">
          <label
            tabIndex={0}
            className={`flex items-center justify-between px-4 h-[40px] w-[300px] text-sm rounded-xl border cursor-pointer transition-all ${theme === 'light'
              ? 'bg-white text-gray-700 border-gray-200 hover:border-green-500'
              : 'bg-black/20 text-gray-200 border-white/10 hover:border-green-500'
              } ${selectedProject?.simulation?.status !== "Completed" ? 'opacity-35 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <span className="truncate">
              {selectedLabel.length > 0
                ? selectedLabel.map(l => l.label).join(', ')
                : 'Select ports...'}
            </span>
            <span className="text-xs opacity-50">▼</span>
          </label>
          <ul
            tabIndex={0}
            className={`dropdown-content mt-2 p-2 shadow-xl rounded-xl w-[300px] max-h-[400px] overflow-y-auto custom-scrollbar backdrop-blur-md border ${theme === 'light'
              ? 'bg-white/95 text-gray-700 border-gray-100'
              : 'bg-black/80 text-gray-200 border-white/10'
              }`}
          >
            {labels.map((l, index) => {
              const labelString = `${l[0]} - ${l[1]}`;
              const isChecked = selectedLabel.some(pc => pc.label === labelString);
              return (
                <li
                  className={`flex flex-row items-center justify-between p-3 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                    }`}
                  key={labelString}
                >
                  <span className="text-sm font-medium">{labelString}</span>
                  <input
                    type="checkbox"
                    className={`checkbox checkbox-xs rounded ${theme === 'light'
                      ? 'checkbox-success'
                      : 'checkbox-success border-white/30'
                      }`}
                    checked={isChecked}
                    value={labelString}
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        dispatch(setSpinnerSolverResults(true))
                        axios.post('http://127.0.0.1:8001/get_results_matrix?file_id=' + selectedProject?.simulation?.resultS3, {
                          fileId: selectedProject?.simulation?.resultS3,
                          port_index: index
                        }).then(res => console.log(res)).catch(err => console.log(err));
                        setSelectedLabel([
                          ...selectedLabel.filter(
                            (sl) => sl.label !== 'All Ports',
                          ),
                          { label: labelString, id: index },
                        ]);
                      } else {
                        dispatch(removeItemToResultsView(index))
                        setSelectedLabel(
                          selectedLabel.filter(
                            (l) => l.label !== labelString,
                          ),
                        );
                      }
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {/* <ExportToCsvZippedButton
        buttonLabel="Export all graphs to csv"
        graphDataToExport={graphDataToExport}
        zipFilename="graphs_data"
      /> */}
      {/* <ExportTouchstoneButton selectedProject={selectedProject as Project} /> */}
    </div>
  );
};
