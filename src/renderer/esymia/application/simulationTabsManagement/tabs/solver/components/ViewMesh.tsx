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
      className="absolute right-[2%] top-0 rounded-xl flex flex-col items-center gap-0 disabled:opacity-50 transition-all duration-300"
      disabled={selectedProject?.meshData.meshGenerated !== 'Generated'}
      onClick={() => {
        setViewMesh(!viewMesh);
        setResetFocus(true);
      }}
    >
      <div
        className={`p-3 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ${theme === 'light'
          ? 'bg-white/80 text-blue-600 hover:bg-white hover:text-blue-500 shadow-blue-500/20'
          : 'bg-black/40 text-blue-400 hover:bg-black/60 hover:text-blue-300 border border-white/10 shadow-blue-600/20'
          }`}
        data-tip={viewMesh ? 'View Model' : 'View Mesh'}
      >
        {viewMesh ? (
          <MdOutlineViewInAr size={24} />
        ) : (
          <GiCubes size={24} />
        )}
      </div>
    </button>
  );
};
