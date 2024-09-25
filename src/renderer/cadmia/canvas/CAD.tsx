import React, { useEffect } from 'react';
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

export interface CanvasProps {
  setShowCad: (v: boolean) => void;
}

const CAD: React.FC<CanvasProps> = ({ setShowCad }) => {
  const { useBaseOpactityBasedOnModality } = useCadmiaModalityManager();
  useBaseOpactityBasedOnModality();
  const loadingSpinner = useSelector(LoadingSpinnerSelector)
  return (
    <div className="m-0 h-[97vh] relative">
      {loadingSpinner &&
          <ImSpinner className="animate-spin w-10 h-10 absolute top-1/2 left-1/2 z-50" />
      }
      <div className={`${loadingSpinner ? 'opacity-40' : 'opacity-100'}`}>
        <SetUserInfo />
        <Navbar setShowCad={setShowCad} />
        <KeyboardEventMapper />
        <div className="w-full p-0 relative">
          <CadmiaCanvas />
          <TransformationsToolBar />
          <BinaryOpsToolbar />
          <MiscToolbar />
          <ShapesToolbar />
          <TabbedMenu />
        </div>
        <StatusBar />
      </div>
    </div>
  );
};

export default CAD;
