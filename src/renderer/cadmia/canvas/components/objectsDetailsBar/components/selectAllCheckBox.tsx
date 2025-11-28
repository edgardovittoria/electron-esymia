import { FC } from "react";
import { CheckboxProps } from "../../../../../cad_library/components/utility/checkBox";
import { useSelector } from "react-redux";
import { componentseSelector } from "../../../../../cad_library";
import { multipleSelectionEntitiesKeysSelector } from "../../miscToolbar/miscToolbarSlice";
import { useCadmiaModalityManager } from "../../cadmiaModality/useCadmiaModalityManager";

export const SelectAllCheckBox: FC<CheckboxProps> = ({ label }) => {

  const components = useSelector(componentseSelector);
  const selectedComponents = useSelector(multipleSelectionEntitiesKeysSelector);
  const { objectsDetailsOptsBasedOnModality } = useCadmiaModalityManager();

  const areAllSelected = components.length > 0 && components.length === selectedComponents.length;

  const toggleSelection = () => {
    if (areAllSelected) {
      objectsDetailsOptsBasedOnModality.outliner.unselectAll && objectsDetailsOptsBasedOnModality.outliner.unselectAll();
    } else {
      objectsDetailsOptsBasedOnModality.outliner.selectAll && objectsDetailsOptsBasedOnModality.outliner.selectAll();
    }
  };

  return (
    <div className="flex flex-row items-center gap-2 px-2 py-1">
      <div
        onClick={toggleSelection}
        className={`group flex items-center justify-center w-4 h-4 rounded border cursor-pointer transition-colors ${areAllSelected
          ? "bg-blue-500 border-blue-500"
          : "bg-white dark:bg-white/5 border-gray-300 dark:border-gray-600"
          }`}
      >
        <svg
          className={`stroke-white w-3 h-3 transition-opacity ${areAllSelected ? "opacity-100" : "opacity-0"
            }`}
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3 8L6 11L11 3.5"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <label
        className="text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none"
        onClick={toggleSelection}
      >
        Select All
      </label>
    </div>
  );
};
