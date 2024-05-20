import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
import { Dispatch } from '@reduxjs/toolkit';
import {
  lastActionTypeSelector,
  lengthFutureStateSelector,
  lengthPastStateSelector
} from 'cad-library';
import { navbarDropdownItemStyle, navbarShortcutStyle } from '../../../../../config/styles';

interface UndoRedoProps {
}

export const undoFunction = (
  lastActionType: string,
  undoActions: string[],
  setundoActions: Function,
  dispatch: Dispatch
) => {
  setundoActions([...undoActions, lastActionType]);
  dispatch(ActionCreators.undo());
};

export const redoFunction = (
  undoActions: string[],
  setundoActions: Function,
  dispatch: Dispatch
) => {
  const newUndoActions = [...undoActions];
  newUndoActions.pop();
  setundoActions(newUndoActions);
  dispatch(ActionCreators.redo());
};

export const UndoRedo: React.FC<UndoRedoProps> = () => {
  const dispatch = useDispatch();
  const pastStateLength = useSelector(lengthPastStateSelector);
  const futureStateLength = useSelector(lengthFutureStateSelector);
  const lastActionType = useSelector(lastActionTypeSelector);
  const [undoActions, setundoActions] = useState<string[]>([]);
  return (
    <>
      {pastStateLength > 0 ? (
        <div
          onClick={() => {
            undoFunction(lastActionType, undoActions, setundoActions, dispatch);
          }}
          className={navbarDropdownItemStyle}
        >
          <div className='flex w-full justify-between'>
            <div className='flex items-center'>
              <FontAwesomeIcon icon={faUndo} className='mr-5' />
              <span className='text-base font-medium'>Undo Last Action</span>
            </div>
            <p className={navbarShortcutStyle}>Ctrl + Z</p>
          </div>
        </div>
      ) : (
        <div className={navbarDropdownItemStyle}>
          <div className='flex w-full justify-between'>
            <div className='flex items-center'>
              <FontAwesomeIcon icon={faUndo} className='text-gray-300 mr-5' />
              <span className='text-gray-300'>Undo Last Action</span>
            </div>
            <p className={navbarShortcutStyle}>Ctrl + Z</p>
          </div>
        </div>
      )}

      {futureStateLength > 0 ? (
        <div
          onClick={() => {
            redoFunction(undoActions, setundoActions, dispatch);
          }}
          className={navbarDropdownItemStyle}
        >
          <div className='flex w-full justify-between'>
            <div className='flex items-center'>
              <FontAwesomeIcon icon={faRedo} className='mr-5' />
              <span className='text-base font-medium'>
              Redo Last Action
            </span>
            </div>
            <p className={navbarShortcutStyle}>Ctrl + X</p>
          </div>
        </div>
      ) : (
        <div className={navbarDropdownItemStyle}>
          <div className='flex w-full justify-between'>
            <div className='flex items-center'>
              <FontAwesomeIcon icon={faRedo} className='text-gray-300 mr-5' />
              <span className='text-base font-medium text-gray-300'>
              Redo Last Action
            </span>
            </div>
            <p className={navbarShortcutStyle}>Ctrl + X</p>
          </div>
        </div>
      )}
    </>
  );
};
