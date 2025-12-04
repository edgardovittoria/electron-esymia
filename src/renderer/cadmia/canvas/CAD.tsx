import React, { useEffect, useRef } from 'react';
import { Navbar } from './components/navBar/NavBar';
import { KeyboardEventMapper } from './components/keyboardEventMapper';
import { CadmiaCanvas } from './components/canvas/cadmiaCanvas';
import { TransformationsToolBar } from './components/transformationsToolbar/transformationsToolbar';
import { BinaryOpsToolbar } from './components/binaryOperationsToolbar/binaryOpsToolbar';
import { MiscToolbar } from './components/miscToolbar/miscToolbar';
import { ShapesToolbar } from './components/navBar/menuItems/shapes/shapeToolbar';
import { StatusBar } from './components/statusBar/statusBar';
import { useCadmiaModalityManager } from './components/cadmiaModality/useCadmiaModalityManager';
import TabbedMenu from './components/canvas/TabbedMenu';
import { useSelector } from 'react-redux';
import { LoadingSpinnerSelector } from '../store/modelSlice';
import { ImSpinner } from 'react-icons/im';
import { SetUserInfo } from '../../cad_library';
import { ThemeSelector } from '../../esymia/store/tabsAndMenuItemsSlice';
import LoadingSpinner from '../../shared/LoadingSpinner';

export interface CanvasProps {
  setShowCad: (v: boolean) => void;
}

const CAD: React.FC<CanvasProps> = ({ setShowCad }) => {
  const { useBaseOpactityBasedOnModality } = useCadmiaModalityManager();
  const triggerUpdate = useRef<(() => void) | null>(null);

  const handleUpdateGrid = () => {
    if (triggerUpdate.current) {
      triggerUpdate.current(); // Aggiorna la posizione e le dimensioni delle griglie
    }
  }
  useBaseOpactityBasedOnModality();
  const loadingSpinner = useSelector(LoadingSpinnerSelector)
  const theme = useSelector(ThemeSelector);
  return (
    <div className="relative w-full h-[calc(100%-5vh)]">
      {loadingSpinner &&
        <LoadingSpinner text='Loading...' />
      }
      <div className={`h-full w-full transition-opacity duration-300 ${loadingSpinner ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <SetUserInfo />
        <Navbar setShowCad={setShowCad} />
        <KeyboardEventMapper />
        <div className="relative w-full h-[calc(100%-3vh)]">
          <CadmiaCanvas triggerUpdate={triggerUpdate} />
          <div className="absolute left-4 top-4 flex gap-2 items-start z-10">
            <MiscToolbar adaptGridsToScene={handleUpdateGrid} />
            <BinaryOpsToolbar />
            <ShapesToolbar />
            <TransformationsToolBar />
          </div>
          <TabbedMenu />
        </div>
        <StatusBar />
      </div>
    </div>
  );
};

export default CAD;
