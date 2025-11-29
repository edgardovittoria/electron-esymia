import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
import { Dispatch } from '@reduxjs/toolkit';
import { navbarDropdownItemStyle, navbarShortcutStyle } from '../../../../../config/styles';
import { lastActionTypeSelector, lengthFutureStateSelector, lengthPastStateSelector } from '../../../../../../cad_library';
import { ThemeSelector } from '../../../../../../esymia/store/tabsAndMenuItemsSlice';

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
  const theme = useSelector(ThemeSelector);

  return (
    <>
      <button
        onClick={() => {
          undoFunction(lastActionType, undoActions, setundoActions, dispatch);
        }}
        className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
        disabled={(process.env.APP_VERSION === 'demo') || pastStateLength === 0}
      >
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-3'>
            <FontAwesomeIcon icon={faUndo} className='h-4 w-4' />
            <span className='font-medium'>Undo Last Action</span>
          </div>
          <span className={navbarShortcutStyle}>Ctrl + Z</span>
        </div>
      </button>

      <button
        onClick={() => {
          redoFunction(undoActions, setundoActions, dispatch);
        }}
        className={`p-2 flex items-center rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' ? 'text-gray-700 hover:bg-black/5' : 'text-gray-200 hover:bg-white/10'}`}
        disabled={(process.env.APP_VERSION === 'demo' || futureStateLength === 0)}
      >
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-3'>
            <FontAwesomeIcon icon={faRedo} className='h-4 w-4' />
            <span className='font-medium'>Redo Last Action</span>
          </div>
          <span className={navbarShortcutStyle}>Ctrl + X</span>
        </div>
      </button>
    </>
  );
};
