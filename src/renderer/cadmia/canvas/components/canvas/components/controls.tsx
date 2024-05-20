import { TransformControls } from "@react-three/drei";
import { Object3DNode, useThree } from "@react-three/fiber";
import { TransformationParams, updateTransformationParams } from "cad-library";
import { FC, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three"
import { activeTransformationSelector } from "../../transformationsToolbar/toolbarTransformationSlice";

export const Controls: FC<{
    keySelectedComponent: number;
    mesh: THREE.Mesh | undefined;
  }> = ({ keySelectedComponent, mesh }) => {
    const { camera } = useThree();
    const transformation = useRef(null);
    const dispatch = useDispatch();
    const activeTransformation = useSelector(activeTransformationSelector)
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
      if (!event.value && transformation.current) {
        const controls: Object3DNode<any, any> = transformation.current;
        let transformationParmas: TransformationParams = {
          position: [
            controls.worldPosition.x,
            controls.worldPosition.y,
            controls.worldPosition.z,
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
