import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { exportJSONProject } from './navBar/menuItems/file/FileItem';
import { toggleObjectsDetails } from './objectsDetailsBar/objectsDetailsSlice';
import {
  canvasStateSelector,
  componentseSelector,
  exportToSTL,
  keySelectedComponenteSelector,
  lastActionTypeSelector,
  removeComponent,
  resetState,
} from '../../../cad_library';

interface KeyboardEventMapperProps { }

import { historyNodesSelector, activeNodeIdSelector, addNode, undo, redo, rebuildHistory } from '../../store/historySlice';
import uniqid from 'uniqid';

// ...

export const KeyboardEventMapper: React.FC<KeyboardEventMapperProps> = () => {
  const dispatch = useDispatch();
  // const pastStateLength = useSelector(lengthPastStateSelector); // Legacy
  // const futureStateLength = useSelector(lengthFutureStateSelector); // Legacy
  const nodes = useSelector(historyNodesSelector);
  const activeNodeId = useSelector(activeNodeIdSelector);

  const canUndo = activeNodeId !== null;
  const canRedo = nodes.length > 0 && (activeNodeId === null ? nodes.length > 0 : nodes.findIndex(n => n.id === activeNodeId) < nodes.length - 1);

  const lastActionType = useSelector(lastActionTypeSelector);
  const [undoActions, setundoActions] = useState<string[]>([]);

  const selectedComponentKey = useSelector(keySelectedComponenteSelector);
  const canvasState = useSelector(canvasStateSelector);

  const components = useSelector(componentseSelector);

  function KeyPress(e: KeyboardEvent) {
    // ... existing text input logic ...
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
      // ... existing text input logic ...
      e.preventDefault();

      switch (e.key.toLowerCase()) {
        case 'c': // Copia (Ctrl/Cmd + C)
          document.execCommand('copy');
          return;

        case 'v': // Incolla (Ctrl/Cmd + V)
          document.execCommand('paste');
          return;

        case 'x': // Taglia (Ctrl/Cmd + X)
          document.execCommand('cut');
          return;

        case 'a': // Seleziona Tutto (Ctrl/Cmd + A)
          if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement
          ) {
            target.select();
            return;
          }
          document.execCommand('selectAll');
          return;
      }
    }
    // =================================================================
    // undo last action
    if (
      e.ctrlKey &&
      e.key === 'z' &&
      canUndo &&
      process.env.APP_VERSION !== 'demo'
    ) {
      e.preventDefault();
      dispatch(undo());
      // @ts-ignore
      dispatch(rebuildHistory());
    }
    // redo last action
    if (
      e.ctrlKey &&
      e.key === 'x' &&
      canRedo &&
      process.env.APP_VERSION !== 'demo'
    ) {
      e.preventDefault();
      dispatch(redo());
      // @ts-ignore
      dispatch(rebuildHistory());
    }
    //delete all components from canvas
    if (e.ctrlKey && e.altKey && e.key === 'r') {
      e.preventDefault();
      dispatch(resetState());
    }
    //delete selected component
    if (e.key === 'Delete' && selectedComponentKey !== 0) {
      e.preventDefault();
      const componentToDelete = components.find(c => c.keyComponent === selectedComponentKey);
      dispatch(removeComponent(selectedComponentKey));
      if (componentToDelete) {
        dispatch(addNode({
          id: uniqid(),
          name: `Delete ${componentToDelete.name}`,
          type: 'DELETE',
          params: {},
          timestamp: Date.now(),
          outputKey: 0,
          inputKeys: [selectedComponentKey],
          suppressed: false
        }));
      }
    }
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
