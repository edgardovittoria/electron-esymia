import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteSimulation,
  selectedProjectSelector,
  setMeshApproved,
} from '../../../../store/projectSlice';
import noResultsIcon from '../../../../../../../assets/noResultsIconForProject.png';
import noResultsIconDark from '../../../../../../../assets/noResultsIconForProjectDark.png';
import { Project } from '../../../../model/esymiaModels';
import { ImSpinner } from 'react-icons/im';
import { deleteFileS3 } from '../../../../aws/mesherAPIs';
import { msToTime } from '../../../dashboardTabsManagement/tabs/Simulations';
import { setSolverResults, ThemeSelector, unsetSolverResults } from '../../../../store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../dynamoDB/projectsFolderApi';

interface ResultsLeftPanelTabProps {
  selectedPort: string;
  setSelectedPort: Function;
}

export const ResultsLeftPanelTab: React.FC<ResultsLeftPanelTabProps> = ({
  selectedPort,
  setSelectedPort,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector)
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery();
  return (
    <>
      {selectedProject &&
        selectedProject.simulation &&
        selectedProject.simulation.status == 'Completed' && (
          <div className="flex flex-col gap-4">
            <div className={`p-3 rounded-xl backdrop-blur-md border shadow-sm ${theme === 'light' ? 'bg-white border-gray-200/50' : 'bg-white border-white/10'}`}>
              <span className="text-sm font-bold block mb-1 opacity-70">Simulation Name</span>
              <span className="text-base font-semibold block truncate">
                {selectedProject.simulation.name}
              </span>
            </div>

            {selectedProject.simulation && selectedProject.simulation.status === "Completed" && (
              <div className="flex flex-col gap-4">
                <div className={`relative w-full px-4 pt-6 pb-4 flex flex-col gap-2 items-start border rounded-xl backdrop-blur-md shadow-sm ${theme === 'light' ? 'bg-white/50 border-gray-200/50' : 'bg-white/5 border-white/10'}`}>
                  <span className={`absolute top-[-10px] left-3 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/50 text-blue-200 border border-blue-500/30'}`}>
                    Time Info
                  </span>
                  <div className="w-full flex justify-between text-sm">
                    <span className="opacity-70">Started:</span>
                    <span className="font-semibold">
                      {new Date(parseInt(selectedProject.simulation.started)).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full flex justify-between text-sm">
                    <span className="opacity-70">Ended:</span>
                    <span className="font-semibold">
                      {new Date(parseInt(selectedProject.simulation.ended)).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full flex justify-between text-sm border-t pt-2 mt-1 border-gray-200/20">
                    <span className="opacity-70">Duration:</span>
                    <span className="font-semibold">
                      {msToTime((new Date(parseInt(selectedProject.simulation.ended)).getTime() - new Date(parseInt(selectedProject.simulation.started)).getTime()))}
                    </span>
                  </div>
                </div>

                <div className={`relative w-full px-4 pt-6 pb-4 flex flex-col gap-2 items-start border rounded-xl backdrop-blur-md shadow-sm ${theme === 'light' ? 'bg-white/50 border-gray-200/50' : 'bg-white/5 border-white/10'}`}>
                  <span className={`absolute top-[-10px] left-3 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme === 'light' ? 'bg-purple-100 text-purple-800' : 'bg-purple-900/50 text-purple-200 border border-purple-500/30'}`}>
                    Server Params
                  </span>
                  <div className="w-full flex justify-between text-sm">
                    <span className="opacity-70">Inner Iter.:</span>
                    <span className="font-semibold">
                      {selectedProject.simulation.solverAlgoParams.innerIteration}
                    </span>
                  </div>
                  <div className="w-full flex justify-between text-sm">
                    <span className="opacity-70">Outer Iter.:</span>
                    <span className="font-semibold">
                      {selectedProject.simulation.solverAlgoParams.outerIteration}
                    </span>
                  </div>
                  <div className="w-full flex justify-between text-sm">
                    <span className="opacity-70">Convergence:</span>
                    <span className="font-semibold">
                      {selectedProject.simulation.solverAlgoParams.convergenceThreshold}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedProject?.simulation &&
              selectedProject.simulation.status == 'Completed' && (
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg ${theme === 'light'
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30'
                    : 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/30'
                    }`}
                  onClick={() => {
                    dispatch(deleteSimulation(selectedProject.id as string));
                    dispatch(unsetSolverResults())
                    dispatch(
                      setMeshApproved({
                        approved: false,
                        projectToUpdate: selectedProject?.id as string,
                      }),
                    );
                    deleteFileS3(selectedProject.simulation?.resultS3 as string).then(() => {
                      execQuery2(
                        createOrUpdateProjectInDynamoDB,
                        {
                          ...selectedProject,
                          simulation: undefined,
                          meshData: {
                            ...selectedProject?.meshData,
                            meshApproved: false,
                          },
                        } as Project,
                        dispatch,
                      );
                    })
                  }}
                >
                  REMOVE RESULTS
                </button>
              )}
          </div>
        )}
      {selectedProject && !selectedProject.simulation && (
        <div className="text-center lg:max-h-[250px] xl:max-h-fit overflow-y-auto custom-scrollbar p-4">
          <img
            src={theme === 'light' ? noResultsIcon : noResultsIconDark}
            className="mx-auto mt-8 w-1/2 opacity-80"
            alt="No Results"
          />
          <h5 className="mt-4 font-bold text-lg opacity-90">No results to view</h5>
          <p className="mt-2 text-sm opacity-70 leading-relaxed">
            Complete a study setup with CAD, materials, and physics, then
            Estimate and Run to generate results.
          </p>
        </div>
      )}
      {selectedProject &&
        selectedProject.simulation &&
        selectedProject.simulation.status === 'Running' && (
          <div className="text-center flex flex-col items-center gap-6 lg:max-h-[250px] xl:max-h-fit overflow-y-auto custom-scrollbar p-4">
            <div className={`p-4 rounded-full ${theme === 'light' ? 'bg-blue-50' : 'bg-white/5'}`}>
              <ImSpinner className={`w-8 h-8 animate-spin ${theme === 'light' ? 'text-blue-500' : 'text-blue-400'}`} />
            </div>
            <div>
              <h5 className="font-bold text-lg opacity-90">Generating Results</h5>
              <p className="mt-2 text-sm opacity-70 leading-relaxed">
                During the generation of the results it is possible to view the
                partial results associated with the different frequencies
              </p>
            </div>
          </div>
        )}
    </>
  );
};
