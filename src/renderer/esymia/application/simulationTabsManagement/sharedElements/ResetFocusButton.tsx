import { FC } from "react";
import { TbZoomReset } from "react-icons/tb";
import { useSelector } from "react-redux";
import { ThemeSelector } from "../../../store/tabsAndMenuItemsSlice";

export const ResetFocusButton: FC<{
  toggleResetFocus: Function;
}> = ({ toggleResetFocus }) => {
  const theme = useSelector(ThemeSelector)
  return (
    <div
      className='tooltip'
      data-tip={
        'Reset canvas focus'
      }
    >
      <button
        className={`${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'} rounded p-2`}
        onClick={() => toggleResetFocus()}
      >
      <TbZoomReset className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
      </button>
    </div>
  );
};
