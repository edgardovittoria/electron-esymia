import { FC } from "react";
import { LuAxis3D } from "react-icons/lu";
import { Project } from "../../../../model/esymiaModels";
import { ScalingViewParams } from "../../sharedElements/utilityFunctions";

export const OriginaProportionsButton: FC<{
  setScalingViewParams: Function
}> = ({ setScalingViewParams }) => {

  return (
    <div
      className='tooltip'
      data-tip={
        'Set view with original scaling factor along axis'
      }
    >
      <button
        className='bg-white rounded p-2'
        onClick={() => {setScalingViewParams({x:1, y:1, z:1} as ScalingViewParams)}}
      >
      <LuAxis3D className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
      </button>
    </div>
  );
};
