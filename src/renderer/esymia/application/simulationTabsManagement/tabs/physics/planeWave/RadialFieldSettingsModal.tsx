import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import {
  selectedProjectSelector,
  setRadialFieldParametres,
  unsetRadialFieldParametres,
} from '../../../../../store/projectSlice';
import { RadialFieldParameters } from '../../../../../model/esymiaModels';
import { useDynamoDBQuery } from '../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../dynamoDB/projectsFolderApi';

interface RadialFieldSettingsModalProps {}

export const RadialFieldSettingsModal: React.FC<
  RadialFieldSettingsModalProps
> = ({}) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const { execQuery2 } = useDynamoDBQuery();
  const dispatch = useDispatch();
  const [radius, setRadius] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.radius : 0,
  );
  const [centerX, setcenterX] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.center.x : 0,
  );
  const [centerY, setcenterY] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.center.y : 0,
  );
  const [centerZ, setcenterZ] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.center.z : 0,
  );
  const [plane, setplane] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.plane : 'xy',
  );
  return (
    <>
      <div
        className={`w-full max-w-md transform overflow-hidden rounded border ${
          theme === 'light'
            ? 'bg-white text-textColor border-textColor'
            : 'bg-bgColorDark2 text-textColorDark border-textColorDark'
        } p-2`}
      >
        <div className="flex flex-col">
          <div className="p-1">
            <h6>Insert radius</h6>
            <input
              type="number"
              className={`formControl ${
                theme === 'light'
                  ? 'bg-gray-100 text-textColor'
                  : 'bg-bgColorDark text-textColorDark'
              }  rounded p-2 w-full mt-3`}
              placeholder="radius"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
            />
          </div>
          <div className="p-1">
            <h6>Insert center</h6>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-2 items-center">
                <span>X</span>
                <input
                  type="number"
                  className={`formControl ${
                    theme === 'light'
                      ? 'bg-gray-100 text-textColor'
                      : 'bg-bgColorDark text-textColorDark'
                  }  rounded p-2 w-full`}
                  placeholder="x"
                  value={centerX}
                  onChange={(e) => setcenterX(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2 items-center">
                <span>Y</span>
                <input
                  type="number"
                  className={`formControl ${
                    theme === 'light'
                      ? 'bg-gray-100 text-textColor'
                      : 'bg-bgColorDark text-textColorDark'
                  }  rounded p-2 w-full`}
                  placeholder="y"
                  value={centerY}
                  onChange={(e) => setcenterY(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2 items-center">
                <span>Z</span>
                <input
                  type="number"
                  className={`formControl ${
                    theme === 'light'
                      ? 'bg-gray-100 text-textColor'
                      : 'bg-bgColorDark text-textColorDark'
                  }  rounded p-2 w-full`}
                  placeholder="z"
                  value={centerZ}
                  onChange={(e) => setcenterZ(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            className="button bg-red-500 text-white"
            onClick={() => {
              dispatch(unsetRadialFieldParametres());
              if (selectedProject) {
                execQuery2(
                  createOrUpdateProjectInDynamoDB,
                  {
                    ...selectedProject,
                    radialFieldParameters: undefined,
                  },
                  dispatch,
                ).then(() => {
                  //setModalOpen(false);
                });
              }
            }}
          >
            UNSET
          </button>
          <button
            type="button"
            className={`button buttonPrimary ${
              theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'
            }`}
            onClick={() => {
              let radialFieldParameters: RadialFieldParameters = {
                radius: radius ? radius : 0,
                center: {
                  x: centerX ? centerX : 0,
                  y: centerY ? centerY : 0,
                  z: centerZ ? centerZ : 0,
                },
                plane: plane ? plane : 'xy',
              };
              dispatch(setRadialFieldParametres(radialFieldParameters));
              if (selectedProject) {
                execQuery2(
                  createOrUpdateProjectInDynamoDB,
                  {
                    ...selectedProject,
                    radialFieldParameters: radialFieldParameters,
                  },
                  dispatch,
                ).then(() => {
                  //setModalOpen(false);
                });
              }
            }}
          >
            SET
          </button>
        </div>
      </div>
    </>
  );
};
