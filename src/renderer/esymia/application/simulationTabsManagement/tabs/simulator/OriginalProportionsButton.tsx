import { FC } from "react";
import { LuAxis3D } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { resetScalingViewParamsOfMesh } from "../../../../store/tabsAndMenuItemsSlice";

export const OriginaProportionsButton: FC<{}> = () => {
  const dispatch = useDispatch()
  return (
    <div
      className='tooltip'
      data-tip={
        'Set view with original scaling factor along axis'
      }
    >
      <button
        className='bg-white rounded p-2'
        onClick={() => dispatch(resetScalingViewParamsOfMesh())}
      >
      <LuAxis3D className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
      </button>
    </div>
  );
};
