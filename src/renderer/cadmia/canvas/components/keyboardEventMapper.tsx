import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redoFunction, undoFunction } from './navBar/menuItems/edit/undoRedo';
import { exportJSONProject } from './navBar/menuItems/file/FileItem';
import { toggleObjectsDetails } from './objectsDetailsBar/objectsDetailsSlice';
import {
  canvasStateSelector,
  componentseSelector,
  exportToSTL,
  keySelectedComponenteSelector,
  lastActionTypeSelector,
  lengthFutureStateSelector,
  lengthPastStateSelector,
  resetState,
} from '../../../cad_library';

interface KeyboardEventMapperProps {}

export const KeyboardEventMapper: React.FC<KeyboardEventMapperProps> = () => {
  const dispatch = useDispatch();
  const pastStateLength = useSelector(lengthPastStateSelector);
  const futureStateLength = useSelector(lengthFutureStateSelector);
  const lastActionType = useSelector(lastActionTypeSelector);
  const [undoActions, setundoActions] = useState<string[]>([]);

  const selectedComponentKey = useSelector(keySelectedComponenteSelector);
  const canvasState = useSelector(canvasStateSelector);

  const components = useSelector(componentseSelector);

  function KeyPress(e: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = e.ctrlKey || (isMac && e.metaKey); // Ctrl su Win/Linux, Cmd su Mac
    const target = e.target as HTMLElement;

    // Tipi di elementi che richiedono le scorciatoie di testo standard
    const isTextInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    // =================================================================
    // NUOVA LOGICA: Gestione delle scorciatoie di modifica del testo
    // =================================================================
    if (ctrlOrCmd && isTextInput) {
      // Se è un input, preveniamo l'azione predefinita per controllarla
      e.preventDefault();

      switch (e.key.toLowerCase()) {
        case 'c': // Copia (Ctrl/Cmd + C)
          // Usiamo execCommand, che è deprecato ma supportato per queste azioni
          // O usiamo l'API Clipboard (solo se l'execCommand fallisce o è bloccato)
          document.execCommand('copy');
          return;
          
        case 'v': // Incolla (Ctrl/Cmd + V)
          document.execCommand('paste');
          return;

        case 'x': // Taglia (Ctrl/Cmd + X)
          // Se usi Ctrl+X per redo, devi decidere se vuoi che 'Taglia' funzioni.
          // Se sì:
          document.execCommand('cut');
          return;

        case 'a': // Seleziona Tutto (Ctrl/Cmd + A)
          // Questa funzione funziona sull'elemento con focus
          if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement
          ) {
            target.select();
            return;
          }
          // Se non è un input/textarea, esegue l'azione sul documento intero (comportamento nativo)
          document.execCommand('selectAll');
          return;
      }
    }
    // =================================================================
    // undo last action
    if (
      e.ctrlKey &&
      e.key === 'z' &&
      pastStateLength > 0 &&
      process.env.APP_VERSION !== 'demo'
    ) {
      e.preventDefault();
      undoFunction(lastActionType, undoActions, setundoActions, dispatch);
    }
    // redo last action
    if (
      e.ctrlKey &&
      e.key === 'x' &&
      futureStateLength > 0 &&
      process.env.APP_VERSION !== 'demo'
    ) {
      e.preventDefault();
      redoFunction(undoActions, setundoActions, dispatch);
    }
    //delete all components from canvas
    if (e.ctrlKey && e.altKey && e.key === 'r') {
      e.preventDefault();
      dispatch(resetState());
    }
    //delete selected component
    /* if(e.key === 'Delete' && selectedComponentKey !== 0){
            e.preventDefault()
            dispatch(removeComponent(selectedComponentKey))
        } */
    //set sidebar visibility
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      dispatch(toggleObjectsDetails());
    }
    //export JSON project
    if (e.ctrlKey && !e.altKey && e.key === 's') {
      e.preventDefault();
      if (window.confirm('Do you want to export the project in json format?')) {
        exportJSONProject(canvasState);
      }
    }
    //export JSON project
    if (e.ctrlKey && e.altKey && e.key === 's') {
      e.preventDefault();
      if (window.confirm('Do you want to export the project in STL format?')) {
        exportToSTL(components);
      }
    }
  }

  window.onkeydown = KeyPress;

  return null;
};
