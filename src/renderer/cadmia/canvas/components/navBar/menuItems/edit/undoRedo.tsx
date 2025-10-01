import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
import { Dispatch } from '@reduxjs/toolkit';
import { navbarDropdownItemStyle, navbarShortcutStyle } from '../../../../../config/styles';
import { lastActionTypeSelector, lengthFutureStateSelector, lengthPastStateSelector } from '../../../../../../cad_library';

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
        <button
          onClick={() => {
            undoFunction(lastActionType, undoActions, setundoActions, dispatch);
          }}
          className={navbarDropdownItemStyle}
          disabled={(process.env.APP_VERSION === 'demo')}
        >
          <div className='flex w-full justify-between'>
            <div className='flex items-center'>
              <FontAwesomeIcon icon={faUndo} className='mr-5' />
              <span className='text-base font-medium'>Undo Last Action</span>
            </div>
            <p className={navbarShortcutStyle}>Ctrl + Z</p>
          </div>
        </button>
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
      <button
          onClick={() => {
            redoFunction(undoActions, setundoActions, dispatch);
          }}
          className={navbarDropdownItemStyle}
          disabled={(process.env.APP_VERSION === 'demo' || futureStateLength === 0)}
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
        </button>
    </>
  );
};
