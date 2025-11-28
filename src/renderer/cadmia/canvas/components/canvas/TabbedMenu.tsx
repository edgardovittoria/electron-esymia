import React from 'react';
import {
  closeObjectsDetails,
  openObjectsDetails,
  objectsDetailsVisibilitySelector,
} from '../objectsDetailsBar/objectsDetailsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ObjectsDetails } from '../objectsDetailsBar/ObjectsDetails';

export interface TabbedMenuProps { }

const TabbedMenu: React.FC<TabbedMenuProps> = ({ }) => {
  const dispatch = useDispatch();
  const objectsDetailsVisibility = useSelector(objectsDetailsVisibilitySelector);
  return (
    <>
      <div className="absolute bottom-0 left-0 flex flex-row gap-1 z-40">
        <div
          className={`font-semibold text-sm px-4 py-1.5 rounded-tr-xl transition-all duration-300 cursor-pointer backdrop-blur-md border-t border-r
            ${objectsDetailsVisibility
              ? 'bg-white/90 text-gray-900 border-gray-200'
              : 'bg-black/60 text-white border-white/10 hover:bg-black/80'}`}
          onClick={() => {
            if (objectsDetailsVisibility) {
              dispatch(closeObjectsDetails());
            } else {
              dispatch(openObjectsDetails());
            }
          }}
        >
          Objects Details
        </div>
      </div>
      {objectsDetailsVisibility && <ObjectsDetails />}
    </>
  );
};

export default TabbedMenu;
