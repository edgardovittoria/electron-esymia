import React from "react";
import { GiPowerButton } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { deleteSimulation, selectedProjectSelector, setMeshApproved } from "../../../../store/projectSlice";
import noResultsIcon from '../../../../../../../assets/noResultsIcon.png'
import { convertInFaunaProjectThis } from "../../../../faunadb/apiAuxiliaryFunctions";
import { updateProjectInFauna } from "../../../../faunadb/projectsFolderAPIs";
import { useFaunaQuery } from "cad-library";
import { Project } from "../../../../model/esymiaModels";

interface ResultsLeftPanelTabProps {
  selectedPort: string;
  setSelectedPort: Function;
}

export const ResultsLeftPanelTab: React.FC<ResultsLeftPanelTabProps> = ({
  selectedPort,
  setSelectedPort,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch()
  const { execQuery } = useFaunaQuery()
  return (
    <>
      {selectedProject && selectedProject.simulation && selectedProject.simulation.status == 'Completed' ? (
        <div>
          <>
            <div
              className="flex mb-2 p-[5px] border-2 border-gray-200 rounded-xl gap-2"
              key={selectedProject.simulation.name}
            >
              {/* <div className="w-[12%] flex items-center">
                <GiPowerButton
                  color={"#00ae52"}
                  style={{ width: "20px", height: "20px" }}
                />
              </div> */}
              <span className="w-[90%] text-left text-sm">
                {selectedProject.simulation.name}
              </span>
            </div>
            {(selectedProject?.simulation && selectedProject.simulation.status == 'Completed') &&
            <button
              type="button"
              className="button buttonPrimary w-full mt-2 hover:opacity-80 disabled:opacity-60 text-sm"
              onClick={() => {
                dispatch(deleteSimulation(selectedProject.faunaDocumentId as string))
                dispatch(setMeshApproved({ approved:false, projectToUpdate: selectedProject?.faunaDocumentId as string }));
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
          </>
        </div>
      ) : (
        <div className="text-center lg:max-h-[250px] xl:max-h-fit overflow-y-scroll">
          <img src={noResultsIcon} className="mx-auto mt-[50px] w-1/2" alt="No Results"/>
          <h5 className="lg:text-sm xl:text-xl">No results to view</h5>
          <p className="xl:mt-[50px] lg:mt-[20px] text-sm">
            Complete a study setup with CAD, materials, and physics, then
            Estimate and Run to generate results.
          </p>
        </div>
      )}
    </>
  );
};
