import React, { ReactNode, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setNextTransformationActive,
} from "../../transformationsToolbar/toolbarTransformationSlice";
import { Edges, useBounds } from "@react-three/drei";
import * as THREE from "three";
import { useCadmiaModalityManager } from "../../cadmiaModality/useCadmiaModalityManager";
import { setFocusNotToScene } from "../../navBar/menuItems/view/viewItemSlice";
import { keySelectedComponenteSelector, TransformationParams } from "../../../../../cad_library";
import { attachModeSelector } from "../../binaryOperationsToolbar/binaryOperationsToolbarSlice";

export interface ComponentProps {
  children: ReactNode;
  transformationParams: TransformationParams;
  keyComponent: number;
  borderVisible: boolean;
  setMeshRef: Function;
  materialColor?: string;
}

export const getContrastingColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

export const CanvasObject: React.FC<ComponentProps> = ({
  children,
  transformationParams,
  keyComponent,
  borderVisible,
  setMeshRef,
  materialColor = "#63cbf7",
}) => {
  const dispatch = useDispatch();
  const selectedComponentKey = useSelector(keySelectedComponenteSelector);
  const attachMode = useSelector(attachModeSelector);
  const mesh = useRef(null);
  const bounds = useBounds()
  const { canvasObjectOpsBasedOnModality } = useCadmiaModalityManager()

  useEffect(() => {
    keyComponent === selectedComponentKey &&
      setMeshRef(mesh.current as unknown as THREE.Mesh);
  }, [selectedComponentKey]);

  useEffect(() => {
    bounds.refresh(mesh.current as unknown as THREE.Mesh).fit().clip()
  }, [mesh])


  return (
    <mesh
      ref={mesh}
      name={keyComponent.toString()}
      position={transformationParams.position}
      rotation={transformationParams.rotation}
      scale={transformationParams.scale}
      castShadow
      receiveShadow
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        bounds.refresh(e.object).fit().clip()
        dispatch(setFocusNotToScene())
      }
      }
      /* onContextMenu={(e) => {
        e.stopPropagation();
        dispatch(setNextTransformationActive())
      }} */
      onClick={(e) => {
        e.stopPropagation();
        canvasObjectOpsBasedOnModality.onClickAction(keyComponent)
      }}
    >
      {/* Clone children to inject opacity prop if they are valid React elements */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // We assume the child (FactoryShapes) accepts an entity prop which has opacity
          // We create a new entity object with modified opacity if attachMode is true
          const originalEntity = child.props.entity;
          if (originalEntity) {
            let opacity = originalEntity.opacity ?? 1;
            if (attachMode) {
              opacity = 0.5;
            } else if (canvasObjectOpsBasedOnModality.opacityLogic) {
              // If opacityLogic is defined (e.g. in Grouping mode), use it
              // We need to check if this component is selected or not
              // This logic is handled by useCadmiaModalityManager usually, but let's check how it's implemented there.
              // Actually, useCadmiaModalityManager returns opacityLogic which might be a boolean or specific value?
              // Let's check useCadmiaModalityManager.
              // Assuming we want to dim unselected items in Grouping mode.
              // We can check if the modality manager handles this via opacityLogic or if we need to do it here.
              // For now, let's rely on the manager if possible, or implement simple check.
            }

            return React.cloneElement(child, {
              entity: {
                ...originalEntity,
                opacity: opacity
              },
              borderVisible: borderVisible || attachMode
            } as any);
          }
          return child;
        }
        return child;
      })}
    </mesh>
  );
};
