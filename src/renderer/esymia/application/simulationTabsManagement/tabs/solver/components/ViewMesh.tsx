import { useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import { MdOutlineViewInAr } from 'react-icons/md';
import { selectedProjectSelector } from '../../../../../store/projectSlice';
import { GiCubes } from 'react-icons/gi';

interface ViewMeshProps {
  viewMesh: boolean;
  setViewMesh: Function;
  setResetFocus: Function;
}

export const ViewMesh: React.FC<ViewMeshProps> = ({
  viewMesh,
  setViewMesh,
  setResetFocus,
}) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  return (
    <button
      className="absolute right-[2%] top-[180px] rounded flex flex-col items-center gap-0 disabled:opacity-50"
      disabled={selectedProject?.meshData.meshGenerated !== 'Generated'}
    >
      <div
        className={`p-2 tooltip rounded tooltip-left ${
          theme === 'light'
            ? 'text-primaryColor bg-white'
            : 'text-textColorDark bg-bgColorDark2'
        }`}
        data-tip={viewMesh ? 'View Model' : 'View Mesh'}
        onClick={() => {
          setViewMesh(!viewMesh);
          setResetFocus(true);
        }}
      >
        {viewMesh ? (
          <MdOutlineViewInAr style={{ width: '25px', height: '25px' }} />
        ) : (
          <GiCubes style={{ width: '25px', height: '25px' }} />
        )}
      </div>
    </button>
  );
};
