import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { invisibleMeshesSelector } from '../objectsDetailsSlice';
import { useCadmiaModalityManager } from '../../cadmiaModality/useCadmiaModalityManager';
import { CubeIcon } from '@heroicons/react/24/outline';
import { IoMdEye, IoMdEyeOff, IoMdSave } from 'react-icons/io';
import { BiRename } from 'react-icons/bi';
import { MdDelete, MdOutlineCancel } from 'react-icons/md';
import { ComponentEntity, updateName } from '../../../../../cad_library';

interface OutlinerProps {
  components: ComponentEntity[],
  selectedComponent: ComponentEntity
}

export const Outliner: FC<OutlinerProps> = ({ components, selectedComponent }) => {
  const invisibleMeshes = useSelector(invisibleMeshesSelector);
  return (
    <>
      <div
        className='h-fit max-h-[150px] border-2 border-black rounded p-2 overflow-scroll bg-gradient-to-r from-white to-slate-200'>
        <div className='border-2 border-transparent text-black w-1/2 text-left pl-2 text-[11px] font-bold'>
          COMPONENTS
        </div>
        {components.map(component => {
          return (
            <OutlinerItem key={component.keyComponent + component.name} keyComponent={component.keyComponent}
                          nameComponent={component.name}
                          isVisible={invisibleMeshes.filter(key => key === component.keyComponent).length === 0} />
          );
        })}
      </div>
    </>
  );

};

interface OutlinerItemProps {
  keyComponent: number,
  nameComponent: string,
  isVisible: boolean
}

const OutlinerItem: FC<OutlinerItemProps> = ({ keyComponent, nameComponent, isVisible }) => {

  const [outlinerItemVisibility, setOutlinerItemVisibility] = useState(true);
  const dispatch = useDispatch();
  const {
    objectsDetailsOptsBasedOnModality,
    meshHidingActionBasedOnModality,
    meshUnhidingActionBasedOnModality
  } = useCadmiaModalityManager();
  const isSelelctedComponent = objectsDetailsOptsBasedOnModality.outliner.isItemSelected(keyComponent);
  const [newName, setNewName] = useState(nameComponent);

  useEffect(() => {
    !isSelelctedComponent && setOutlinerItemVisibility(true);
  }, [isSelelctedComponent]);


  return (
    <div
      className={`flex items-center ${!isSelelctedComponent ? 'hover:border-2 hover:border-gray-400' : 'border-2 border-secondaryColor'} hover:cursor-pointer rounded w-full justify-between py-1`}>
      {outlinerItemVisibility ?
        <>
          <div
            key={keyComponent}
            className='text-black text-[9px] font-bold text-left pl-4 flex w-2/3'
            onClick={(e) => objectsDetailsOptsBasedOnModality.outliner.onClickItemAction(keyComponent)}
          >
            <CubeIcon className='w-[10px] mr-2' />
            {nameComponent}
          </div>
          <div>
            <div className='tooltip tooltip-left' data-tip='Hide/Show'>
              {isVisible
                ? <IoMdEye className='w-[17px] pr-1 text-black hover:cursor-pointer' onClick={() => {
                  meshHidingActionBasedOnModality(keyComponent);
                }} />
                : <IoMdEyeOff className='w-[17px] pr-1 text-black hover:cursor-pointer' onClick={() => {
                  meshUnhidingActionBasedOnModality(keyComponent);
                }} />}
            </div>
            <div className='tooltip tooltip-left' data-tip='Rename'>
              <BiRename className='w-[17px] pr-1 text-black' onClick={() => {
                setOutlinerItemVisibility(false);
              }} />
            </div>
            {objectsDetailsOptsBasedOnModality.deleteButton.visibility(keyComponent) &&
              <div className='tooltip tooltip-left' data-tip='Delete'>
                <MdDelete className='w-[17px] pr-1 text-black' onClick={() => {
                  if (window.confirm(objectsDetailsOptsBasedOnModality.deleteButton.messages(keyComponent).popup)) {
                    objectsDetailsOptsBasedOnModality.deleteButton.onClickAction(keyComponent);
                  }
                }} />
              </div>}
          </div>
        </>
        :
        <>
          <input
            type='text'
            className='text-black text-[9px] font-bold text-left py-1 pl-4 flex w-2/3'
            defaultValue={nameComponent}
            onChange={(e) => setNewName(e.currentTarget.value)}
          />
          <div className='flex flex-row'>
            <div className='tooltip tooltip-left' data-tip='save'>
              <IoMdSave className='text-black' size={20} onClick={() => {
                dispatch(updateName({ key: keyComponent, name: newName }));
                setOutlinerItemVisibility(true);
              }} />
            </div>
            <div className='tooltip tooltip-left' data-tip='cancel'>
              <MdOutlineCancel className='text-black' size={20} onClick={() => {
                setOutlinerItemVisibility(true);
              }} />
            </div>
          </div>


        </>
      }
    </div>
  );
};
