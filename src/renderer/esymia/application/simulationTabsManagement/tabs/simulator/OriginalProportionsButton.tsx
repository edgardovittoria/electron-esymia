import { FC } from "react";
import { LuAxis3D } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { resetScalingViewParamsOfMesh, ThemeSelector } from "../../../../store/tabsAndMenuItemsSlice";

export const OriginaProportionsButton: FC<{}> = () => {
  const dispatch = useDispatch()
  const theme = useSelector(ThemeSelector)
  return (
    <div
      className='tooltip'
      data-tip={
        'Set view with original scaling factor along axis'
      }
    >
      <button
        className={`${theme === 'light' ? 'bg-white' : 'bg-bgColorDark2'} rounded p-2`}
        onClick={() => dispatch(resetScalingViewParamsOfMesh())}
      >
      <LuAxis3D className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
      </button>
    </div>
  );
};
