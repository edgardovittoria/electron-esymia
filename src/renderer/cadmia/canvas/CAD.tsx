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
    <div className="m-0 h-[97vh] relative">
      {loadingSpinner &&
          <ImSpinner className={`animate-spin w-10 h-10 absolute top-1/2 left-1/2 z-50 ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`} />
      }
      <div className={`${loadingSpinner ? 'opacity-40' : 'opacity-100'}`}>
        <SetUserInfo />
        <Navbar setShowCad={setShowCad} />
        <KeyboardEventMapper />
        <div className="w-full p-0 relative">
          <CadmiaCanvas triggerUpdate={triggerUpdate}/>
          <div className="absolute left-[15px] top-[10px] flex gap-4 items-start justify-center">
            <MiscToolbar adaptGridsToScene={handleUpdateGrid}/>
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
