import React from 'react';
import { BsGrid3X3Gap } from 'react-icons/bs';
import { GiHamburgerMenu } from 'react-icons/gi';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../store/projectSlice';
import { Port, Project } from '../../../../model/esymiaModels';
import { Dataset, pairs } from './sharedElements';
import { ExportToCsvZippedButton } from './ExportToCsvZippedButton';
import { ExportTouchstoneButton } from './ExportTouchstoneButton';
import { removeItemToResultsView, setSpinnerSolverResults, ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { publishMessage } from '../../../../../middleware/stompMiddleware';

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
  const dispatch = useDispatch()

  return (
    <div className="mt-8 flex justify-between">
      <div className="flex">
        <div
          className={`box p-[5px] ${
            theme === 'light' ? '' : 'bg-bgColorDark2'
          } mb-3 flex flex-col items-center border-2 hover:cursor-pointer hover:border-[#0fb25b] ${
            chartVisualizationMode === 'grid'
              ? 'border-[#0fb25b]'
              : 'border-bgColorDark'
          }`}
          onClick={() => setChartVisualizationMode('grid')}
        >
          <BsGrid3X3Gap size={20} color="#0fb25b" />
        </div>
        <div
          className={`box p-[5px] ${
            theme === 'light' ? '' : 'bg-bgColorDark2'
          } ml-2 mb-3 flex flex-col items-center border-2 hover:cursor-pointer hover:border-[#0fb25b] ${
            chartVisualizationMode === 'full'
              ? 'border-[#0fb25b]'
              : 'border-bgColorDark'
          }`}
          onClick={() => setChartVisualizationMode('full')}
        >
          <GiHamburgerMenu size={20} color="#0fb25b" />
        </div>
      </div>
      <div className="flex justify-center items-center">
        <select
          className={`select select-success disabled:opacity-35 disabled:hover:cursor-not-allowed w-full max-w-xs h-[35px] min-h-[35px] mr-2 text-sm ${
            theme === 'light'
              ? 'bg-white text-textColor'
              : 'bg-bgColorDark2 text-textColorDark'
          }`}
          onChange={(e) => setGraphToVisualize(e.currentTarget.value)}
          disabled={selectedProject?.simulation?.status !== "Completed"}
          defaultValue={'All Graph'}
        >
          <option>All Graph</option>
          <option>Z</option>
          <option>Y</option>
          <option>S</option>
        </select>
        <button className={`dropdown dropdown-bottom disabled:opacity-35 disabled:hover:cursor-not-allowed`} 
          disabled={selectedProject?.simulation?.status !== "Completed"}
        >
          <label
            tabIndex={0}
            className={`select select-success ${
              theme === 'light'
                ? 'bg-white text-textColor'
                : 'bg-bgColorDark2 text-textColorDark'
            } h-[35px] w-[300px] min-h-[35px] mr-2 flex items-center`}
          >
            {selectedLabel.length > 2
              ? 'Open to see and select ports...'
              : selectedLabel.reduce(
                  (label, currentPc) => label + currentPc.label + ' ',
                  '',
                )}
          </label>
          <ul
            tabIndex={0}
            className={`dropdown-content ${
              theme === 'light'
                ? 'bg-white text-textColor'
                : 'bg-bgColorDark2 text-textColorDark'
            } p-2 shadow rounded-box w-full h-fit max-h-[500px] overflow-y-scroll`}
          >
            {labels.map((l, index) => {
              return (
                <li
                  className="flex flex-row items-center justify-between p-2"
                  key={`${l[0]} - ${l[1]}`}
                >
                  <span>{`${l[0]} - ${l[1]}`}</span>
                  <input
                    type="checkbox"
                    className={`checkbox checkbox-xs ${
                      theme === 'light' ? '' : 'border-textColorDark'
                    }`}
                    checked={
                      selectedLabel.filter(
                        (pc) => pc.label === `${l[0]} - ${l[1]}`,
                      ).length > 0
                    }
                    value={`${l[0]} - ${l[1]}`}
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        dispatch(setSpinnerSolverResults(true))
                        dispatch(
                          publishMessage({
                            queue: 'management_solver',
                            body: {
                              message: 'get results',
                              body: {
                                portIndex: index,
                                fileId: selectedProject?.simulation?.resultS3,
                              },
                            },
                          }),
                        );
                        setSelectedLabel([
                          ...selectedLabel.filter(
                            (sl) => sl.label !== 'All Ports',
                          ),
                          { label: e.currentTarget.value, id: index },
                        ]);
                      } else {
                        dispatch(removeItemToResultsView(index))
                        setSelectedLabel(
                          selectedLabel.filter(
                            (l) => l.label !== e.currentTarget.value,
                          ),
                        );
                      }
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </button>
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
