import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { invisibleMeshesSelector } from '../objectsDetailsSlice';
import { useCadmiaModalityManager } from '../../cadmiaModality/useCadmiaModalityManager';
import { CubeIcon } from '@heroicons/react/24/outline';
import { IoMdEye, IoMdEyeOff, IoMdSave } from 'react-icons/io';
import { BiRename } from 'react-icons/bi';
import { MdDelete, MdOutlineCancel } from 'react-icons/md';
import { ComponentEntity, updateName } from '../../../../../cad_library';
import { ThemeSelector } from '../../../../../esymia/store/tabsAndMenuItemsSlice';

interface OutlinerProps {
  components: ComponentEntity[];
  selectedComponent: ComponentEntity;
}

export const Outliner: FC<OutlinerProps> = ({
  components,
  selectedComponent,
}) => {
  const invisibleMeshes = useSelector(invisibleMeshesSelector);
  const theme = useSelector(ThemeSelector);

  return (
    <div className="flex flex-col gap-2">
      <div className={`text-xs font-bold uppercase tracking-wider text-left pl-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
        Components
      </div>
      <div className={`max-h-[200px] overflow-y-auto p-2 scrollbar-thin rounded-lg border ${theme === 'light' ? 'scrollbar-thumb-gray-300 border-gray-400' : 'scrollbar-thumb-gray-600 border-white/5'}`}>
        {components.map((component) => {
          return (
            <OutlinerItem
              key={component.keyComponent + component.name}
              keyComponent={component.keyComponent}
              nameComponent={component.name}
              isVisible={
                invisibleMeshes.filter(
                  (key) => key === component.keyComponent,
                ).length === 0
              }
            />
          );
        })}
      </div>
    </div>
  );
};

interface OutlinerItemProps {
  keyComponent: number;
  nameComponent: string;
  isVisible: boolean;
}

const OutlinerItem: FC<OutlinerItemProps> = ({
  keyComponent,
  nameComponent,
  isVisible,
}) => {
  const [outlinerItemVisibility, setOutlinerItemVisibility] = useState(true);
  const dispatch = useDispatch();
  const {
    objectsDetailsOptsBasedOnModality,
    meshHidingActionBasedOnModality,
    meshUnhidingActionBasedOnModality,
  } = useCadmiaModalityManager();
  const isSelelctedComponent =
    objectsDetailsOptsBasedOnModality.outliner.isItemSelected(keyComponent);
  const [newName, setNewName] = useState(nameComponent);
  const theme = useSelector(ThemeSelector);

  useEffect(() => {
    !isSelelctedComponent && setOutlinerItemVisibility(true);
  }, [isSelelctedComponent]);

  return (
    <div
      className={`flex flex-row items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 mb-1
        ${isSelelctedComponent
          ? 'bg-blue-500 text-white shadow-md'
          : `${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-gray-200'}`
        }`}
    >
      {outlinerItemVisibility ? (
        <>
          <div
            key={keyComponent}
            className="text-xs font-medium text-left flex items-center gap-2 w-full cursor-pointer truncate"
            onClick={(e) =>
              objectsDetailsOptsBasedOnModality.outliner.onClickItemAction(
                keyComponent,
              )
            }
          >
            <CubeIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{nameComponent}</span>
          </div>
          <div className="flex flex-row gap-1 items-center ml-2">
            <div className="tooltip tooltip-left" data-tip={isVisible ? "Hide" : "Show"}>
              {isVisible ? (
                <IoMdEye
                  className={`w-4 h-4 cursor-pointer ${isSelelctedComponent ? 'text-white' : `${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}`}
                  onClick={() => {
                    meshHidingActionBasedOnModality(keyComponent);
                  }}
                />
              ) : (
                <IoMdEyeOff
                  className={`w-4 h-4 cursor-pointer ${isSelelctedComponent ? 'text-white/70' : `${theme === 'light' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'}`}`}
                  onClick={() => {
                    meshUnhidingActionBasedOnModality(keyComponent);
                  }}
                />
              )}
            </div>
            <div className="tooltip tooltip-left" data-tip="Rename">
              <BiRename
                className={`w-4 h-4 cursor-pointer ${isSelelctedComponent ? 'text-white' : `${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}`}
                onClick={() => {
                  setOutlinerItemVisibility(false);
                }}
              />
            </div>
            {objectsDetailsOptsBasedOnModality.deleteButton.visibility(
              keyComponent,
            ) && (
                <div className="tooltip tooltip-left" data-tip="Delete">
                  <MdDelete
                    className={`w-4 h-4 cursor-pointer ${isSelelctedComponent ? 'text-white' : 'text-red-500 hover:text-red-600'}`}
                    onClick={() => {
                      if (
                        window.confirm(
                          objectsDetailsOptsBasedOnModality.deleteButton.messages(
                            keyComponent,
                          ).popup,
                        )
                      ) {
                        objectsDetailsOptsBasedOnModality.deleteButton.onClickAction(
                          keyComponent,
                        );
                      }
                    }}
                  />
                </div>
              )}
          </div>
        </>
      ) : (
        <>
          <input
            type="text"
            className="bg-transparent border-b border-white/50 text-white text-xs font-medium w-full focus:outline-none focus:border-white px-1"
            defaultValue={nameComponent}
            autoFocus
            onChange={(e) => setNewName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                dispatch(updateName({ key: keyComponent, name: newName }));
                setOutlinerItemVisibility(true);
              }
            }}
          />
          <div className="flex flex-row gap-1 ml-2">
            <div className="tooltip tooltip-left" data-tip="Save">
              <IoMdSave
                className="text-white w-4 h-4 cursor-pointer hover:text-white/80"
                onClick={() => {
                  dispatch(updateName({ key: keyComponent, name: newName }));
                  setOutlinerItemVisibility(true);
                }}
              />
            </div>
            <div className="tooltip tooltip-left" data-tip="Cancel">
              <MdOutlineCancel
                className="text-white w-4 h-4 cursor-pointer hover:text-white/80"
                onClick={() => {
                  setOutlinerItemVisibility(true);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
