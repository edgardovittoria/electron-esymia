import { FC } from "react";
import { CheckboxProps } from "../../../../../cad_library/components/utility/checkBox";
import { useSelector } from "react-redux";
import { componentseSelector } from "../../../../../cad_library";
import { multipleSelectionEntitiesKeysSelector } from "../../miscToolbar/miscToolbarSlice";
import { useCadmiaModalityManager } from "../../cadmiaModality/useCadmiaModalityManager";
import { ThemeSelector } from "../../../../../esymia/store/tabsAndMenuItemsSlice";

export const SelectAllCheckBox: FC<CheckboxProps> = ({ label }) => {

  const components = useSelector(componentseSelector);
  const selectedComponents = useSelector(multipleSelectionEntitiesKeysSelector);
  const { objectsDetailsOptsBasedOnModality } = useCadmiaModalityManager();
  const theme = useSelector(ThemeSelector);

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
          : `${theme === 'light' ? 'bg-white border-gray-300' : 'bg-white/5 border-gray-600'}`
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
        className={`text-xs font-medium cursor-pointer select-none ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}
        onClick={toggleSelection}
      >
        Select All
      </label>
    </div>
  );
};
