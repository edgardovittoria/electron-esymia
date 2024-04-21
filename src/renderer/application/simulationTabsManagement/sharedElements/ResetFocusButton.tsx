import { FC } from "react";
import { TbZoomReset } from "react-icons/tb";

export const ResetFocusButton: FC<{
  toggleResetFocus: Function;
}> = ({ toggleResetFocus }) => {
  return (
    <div
      className='tooltip'
      data-tip={
        'Reset canvas focus'
      }
    >
      <button
        className='bg-white rounded p-2'
        onClick={() => toggleResetFocus()}
      >
      <TbZoomReset className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
      </button>
    </div>
  );
};
