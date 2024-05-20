import React from 'react';
import {
  closeObjectsDetails,
  openObjectsDetails,
  objectsDetailsVisibilitySelector,
} from '../objectsDetailsBar/objectsDetailsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ObjectsDetails } from '../objectsDetailsBar/ObjectsDetails';

export interface TabbedMenuProps {}

const TabbedMenu: React.FC<TabbedMenuProps> = ({}) => {
  const dispatch = useDispatch();
  const objectsDetailsVisibility = useSelector(objectsDetailsVisibilitySelector);
  return (
    <>
      <div className="absolute bottom-0 left-0 flex flex-row gap-1">
        <div
          className={` font-semibold ${objectsDetailsVisibility ? 'text-black bg-white' : 'text-white bg-black'} z-50 rounded-tr-xl px-3 w-fit hover:cursor-pointer hover:bg-white hover:text-black`}
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
