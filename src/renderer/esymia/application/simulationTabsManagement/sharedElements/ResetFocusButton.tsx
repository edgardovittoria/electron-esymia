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
      className='tooltip tooltip-bottom'
      data-tip={
        'Reset canvas focus'
      }
    >
      <button
        className={`p-3 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ${theme === 'light'
          ? 'bg-white/80 text-gray-700 hover:bg-white hover:text-green-600 hover:shadow-green-500/20'
          : 'bg-black/40 text-gray-300 border border-white/10 hover:bg-black/60 hover:text-green-400 hover:border-green-500/30'
          }`}
        onClick={() => toggleResetFocus()}
      >
        <TbZoomReset className='h-6 w-6' />
      </button>
    </div>
  );
};
