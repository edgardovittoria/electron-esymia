import { TransformControls } from "@react-three/drei";
import { Object3DNode, useThree } from "@react-three/fiber";
import { FC, useEffect, useRef } from "react";
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
  const { camera, scene } = useThree();
  const transformation = useRef(null);
  const dispatch = useDispatch();
  const activeTransformation = useSelector(activeTransformationSelector)
  const attachMode = useSelector(attachModeSelector);
  // const orbitTarget = useSelector(orbitTargetSelector)

  useEffect(() => {
    if (transformation.current) {
      const controls: Object3DNode<any, any> = transformation.current;
      controls.addEventListener("dragging-changed", onChangeHandler);
      return () =>
        controls.removeEventListener("dragging-changed", onChangeHandler);
    }
  });

  function onChangeHandler(event: any) {
    if (transformation.current) {
      const controls: Object3DNode<any, any> = transformation.current;

      if (attachMode && event.value) { // While dragging
        // Logic to show preview or snap indicator could go here
      }

      if (!event.value) { // Drag end
        let newPosition = new THREE.Vector3(controls.worldPosition.x, controls.worldPosition.y, controls.worldPosition.z);

        let transformationParmas: TransformationParams = {
          position: [
            newPosition.x,
            newPosition.y,
            newPosition.z,
          ],
          rotation: [
            controls.object.rotation._x,
            controls.object.rotation._y,
            controls.object.rotation._z,
          ],
          scale: [
            controls.worldScale.x,
            controls.worldScale.y,
            controls.worldScale.z,
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
    }
  }
  return (
    <>
      {(keySelectedComponent !== 0 && mesh !== undefined) && (
        <TransformControls
          camera={camera}
          ref={transformation}
          children={<></>}
          object={mesh}
          mode={activeTransformation.type}

        />
      )}
    </>
  );
};
