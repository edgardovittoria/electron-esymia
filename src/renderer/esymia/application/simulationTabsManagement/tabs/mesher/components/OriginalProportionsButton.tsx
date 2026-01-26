import { FC } from "react";
import { LuAxis3D } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { resetScalingViewParamsOfMesh, ThemeSelector } from "../../../../../store/tabsAndMenuItemsSlice";

export const OriginaProportionsButton: FC<{}> = () => {
  const dispatch = useDispatch()
  const theme = useSelector(ThemeSelector)
  return (
    <div
      className='tooltip tooltip-bottom'
      data-tip={
        'Set view with original scaling factor along axis'
      }
    >
      <button
        className={`p-2 rounded-xl transition-all duration-300 ${theme === 'light'
          ? 'bg-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          : 'bg-transparent text-gray-400 hover:text-blue-400 hover:bg-white/5'
          }`}
        onClick={() => dispatch(resetScalingViewParamsOfMesh())}
      >
        <LuAxis3D className='h-5 w-5' />
      </button>
    </div>
  );
};
