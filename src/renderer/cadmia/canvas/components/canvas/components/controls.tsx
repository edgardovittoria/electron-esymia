import { TransformControls, Html } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { FC, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three"
import { activeTransformationSelector } from "../../transformationsToolbar/toolbarTransformationSlice";
import { TransformationParams, updateTransformationParams } from "../../../../../cad_library";
import { attachModeSelector } from "../../binaryOperationsToolbar/binaryOperationsToolbarSlice";
import { addNode } from "../../../../store/historySlice";
import uniqid from "uniqid";

export const Controls: FC<{
  keySelectedComponent: number;
  mesh: THREE.Mesh | undefined;
}> = ({ keySelectedComponent, mesh }) => {
  const { camera } = useThree();
  const transformation = useRef<any>(null);
  const dispatch = useDispatch();
  const activeTransformation = useSelector(activeTransformationSelector)
  const attachMode = useSelector(attachModeSelector);

  useEffect(() => {
    const controls = transformation.current;
    if (controls) {
      const draggingChangedHandler = (event: any) => {
        if (!event.value) { // Drag end
          const ctrl = transformation.current;
          let newPosition = new THREE.Vector3(ctrl.worldPosition.x, ctrl.worldPosition.y, ctrl.worldPosition.z);

          let transformationParmas: TransformationParams = {
            position: [newPosition.x, newPosition.y, newPosition.z],
            rotation: [
              ctrl.object.rotation.x,
              ctrl.object.rotation.y,
              ctrl.object.rotation.z,
            ],
            scale: [
              ctrl.worldScale.x,
              ctrl.worldScale.y,
              ctrl.worldScale.z,
            ],
          };
          dispatch(updateTransformationParams(transformationParmas));

          dispatch(addNode({
            id: uniqid(),
            name: `Transform ${activeTransformation.type}`,
            type: 'TRANSFORM',
            params: transformationParmas,
            timestamp: Date.now(),
            outputKey: keySelectedComponent,
            inputKeys: [keySelectedComponent],
            suppressed: false
          }));
        }
      };

      controls.addEventListener("dragging-changed", draggingChangedHandler);
      return () => controls.removeEventListener("dragging-changed", draggingChangedHandler);
    }
  }); // Run on every render to ensure listeners stay attached to the ref

  return (
    <>
      {(keySelectedComponent !== 0 && mesh !== undefined) && (
        <>
          <TransformControls
            camera={camera}
            ref={transformation}
            object={mesh}
            mode={activeTransformation.type}
          />
          <TransformTooltip
            transformationRef={transformation}
            mode={activeTransformation.type}
          />
        </>
      )}
    </>
  );
};

const TransformTooltip: FC<{
  transformationRef: React.MutableRefObject<any>,
  mode: string
}> = ({ transformationRef, mode }) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [1, 1, 1] as [number, number, number]
  });

  useFrame(() => {
    const controls = transformationRef.current;
    if (controls && controls.object) {
      if (controls.dragging !== visible) {
        setVisible(controls.dragging);
      }

      if (controls.dragging) {
        const obj = controls.object;
        setData({
          position: [obj.position.x, obj.position.y, obj.position.z],
          rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
          scale: [obj.scale.x, obj.scale.y, obj.scale.z]
        });
      }
    } else if (visible) {
      setVisible(false);
    }
  });

  if (!visible) return null;

  const formatValue = (val: number) => val.toFixed(2);
  const toDegrees = (rad: number) => (rad * 180 / Math.PI).toFixed(1);

  return (
    <Html position={data.position} center style={{ pointerEvents: 'none' }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        border: '1px solid #38bdf8',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <span style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{mode}:</span>
        {mode === 'translate' && (
          <span>[{formatValue(data.position[0])}, {formatValue(data.position[1])}, {formatValue(data.position[2])}]</span>
        )}
        {mode === 'rotate' && (
          <span>[{toDegrees(data.rotation[0])}°, {toDegrees(data.rotation[1])}°, {toDegrees(data.rotation[2])}°]</span>
        )}
        {mode === 'scale' && (
          <span>[{formatValue(data.scale[0])}, {formatValue(data.scale[1])}, {formatValue(data.scale[2])}]</span>
        )}
      </div>
    </Html>
  );
};
