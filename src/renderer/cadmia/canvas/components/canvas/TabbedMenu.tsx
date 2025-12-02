import React from 'react';
import {
  closeObjectsDetails,
  openObjectsDetails,
  objectsDetailsVisibilitySelector,
} from '../objectsDetailsBar/objectsDetailsSlice';
import {
  closeHistory,
  openHistory,
  historyVisibilitySelector,
} from '../../../store/historySlice';
import { useDispatch, useSelector } from 'react-redux';
import { ObjectsDetails } from '../objectsDetailsBar/ObjectsDetails';
import { HistoryTree } from '../../../components/historyTree/HistoryTree';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';

export interface TabbedMenuProps { }

const TabbedMenu: React.FC<TabbedMenuProps> = ({ }) => {
  const dispatch = useDispatch();
  const objectsDetailsVisibility = useSelector(objectsDetailsVisibilitySelector);
  const historyVisibility = useSelector(historyVisibilitySelector);
  const theme = useSelector(ThemeSelector);

  return (
    <>
      <div className="absolute bottom-0 left-0 flex flex-row gap-1 z-40">
        <div
          className={`font-semibold text-sm px-4 py-1.5 rounded-tr-xl transition-all duration-300 cursor-pointer backdrop-blur-md border-t border-r
            ${objectsDetailsVisibility
              ? (theme === 'light' ? 'bg-white/90 text-gray-900 border-gray-200' : 'bg-black/80 text-white border-white/10')
              : (theme === 'light' ? 'bg-white/40 text-gray-800 border-white/20 hover:bg-white/60' : 'bg-black/40 text-white border-white/10 hover:bg-black/60')}`}
          onClick={() => {
            if (objectsDetailsVisibility) {
              dispatch(closeObjectsDetails());
            } else {
              dispatch(openObjectsDetails());
              dispatch(closeHistory());
            }
          }}
        >
          Objects Details
        </div>
        <div
          className={`font-semibold text-sm px-4 py-1.5 rounded-tr-xl transition-all duration-300 cursor-pointer backdrop-blur-md border-t border-r
            ${historyVisibility
              ? (theme === 'light' ? 'bg-white/90 text-gray-900 border-gray-200' : 'bg-black/80 text-white border-white/10')
              : (theme === 'light' ? 'bg-white/40 text-gray-800 border-white/20 hover:bg-white/60' : 'bg-black/40 text-white border-white/10 hover:bg-black/60')}`}
          onClick={() => {
            if (historyVisibility) {
              dispatch(closeHistory());
            } else {
              dispatch(openHistory());
              dispatch(closeObjectsDetails());
            }
          }}
        >
          History
        </div>
      </div>
      {objectsDetailsVisibility && <ObjectsDetails />}
      {historyVisibility && (
        <div
          className={`absolute bottom-0 z-10 left-0 w-[20vw] px-5 pt-5 pb-12 text-center transition-all duration-300 border-t border-r rounded-tr-xl backdrop-blur-md h-[60vh]
            ${theme === 'light' ? 'bg-white/90 border-gray-200 text-gray-900' : 'bg-black/80 border-white/10 text-white'}`}
        >
          <HistoryTree />
        </div>
      )}
    </>
  );
};

export default TabbedMenu;
