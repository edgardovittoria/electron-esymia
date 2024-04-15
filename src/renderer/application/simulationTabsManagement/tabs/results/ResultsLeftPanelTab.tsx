import React from "react";
import { GiPowerButton } from "react-icons/gi";
import { useSelector } from "react-redux";
import { selectedProjectSelector } from "../../../../store/projectSlice";
import noResultsIcon from '../../../../../../assets/noResultsIcon.png'

interface ResultsLeftPanelTabProps {
  selectedPort: string;
  setSelectedPort: Function;
}

export const ResultsLeftPanelTab: React.FC<ResultsLeftPanelTabProps> = ({
  selectedPort,
  setSelectedPort,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);

  return (
    <>
      {selectedProject && selectedProject.simulation ? (
        <div>
          <>
            <div
              className="flex mb-2 p-[5px] hover:cursor-pointer border-2 border-gray-200 rounded-xl gap-2"
              key={selectedProject.simulation.name}
            >
              <div className="w-[12%] flex items-center">
                <GiPowerButton
                  color={"#00ae52"}
                  style={{ width: "20px", height: "20px" }}
                />
              </div>
              <span className="w-[90%] text-left text-sm">
                {selectedProject.simulation.name}
              </span>
            </div>
          </>
        </div>
      ) : (
        <div className="text-center">
          <img src={noResultsIcon} className="mx-auto mt-[50px]" alt="No Results"/>
          <h5>No results to view</h5>
          <p className="mt-[50px]">
            Complete a study setup with CAD, materials, and physics, then
            Estimate and Run to generate results.
          </p>
        </div>
      )}
    </>
  );
};
