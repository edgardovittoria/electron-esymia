import { FC, useEffect, useRef } from "react";
import { Object3DNode, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { Port } from "../../../../../model/esymiaModels";

interface PortControlsProps {
    selectedPort: Port,
    updatePortPosition: Function
    setSavedPortParameters: Function
}

export const PortControls: FC<PortControlsProps> = (
    {
        selectedPort, updatePortPosition, setSavedPortParameters
    }
) => {

    const transformationFirst = useRef(null);
    const transformationLast = useRef(null);
    const { scene } = useThree()

    useEffect(() => {
        if (transformationFirst.current) {
            const controls = transformationFirst.current as unknown as Object3DNode<any, any>;
            controls.addEventListener("dragging-changed", onChangeFirstPositionHandler)
            return () => controls.removeEventListener("dragging-changed", onChangeFirstPositionHandler)
        }
    })

    useEffect(() => {
        if (transformationLast.current) {
            const controls = transformationLast.current as unknown as Object3DNode<any, any>;
            controls.addEventListener("dragging-changed", onChangeLastPositionHandler)
            return () => controls.removeEventListener("dragging-changed", onChangeLastPositionHandler)
        }

    })


    function onChangeFirstPositionHandler(event: THREE.Event) {
        setSavedPortParameters(false)
        if (!event.target && transformationFirst.current) {
            const controls: Object3DNode<any, any> = transformationFirst.current as unknown as Object3DNode<any, any>
            let transformationParmas = {
                type: 'first',
                position: [controls.worldPosition.x, controls.worldPosition.y, controls.worldPosition.z],
            }
            updatePortPosition(transformationParmas)
            setSavedPortParameters(true)
        }
    }

    function onChangeLastPositionHandler(event: THREE.Event) {
        setSavedPortParameters(false)
        if (!event.target && transformationLast.current) {
            const controls: Object3DNode<any, any> = transformationLast.current as unknown as Object3DNode<any, any>
            let transformationParmas = {
                type: 'last',
                position: [controls.worldPosition.x, controls.worldPosition.y, controls.worldPosition.z],
            }
            updatePortPosition(transformationParmas)
            setSavedPortParameters(true)
        }
    }



    return (
        <>
            {selectedPort &&
                <>
                    <TransformControls
                        object={scene.getObjectByName((selectedPort as Port).outputElement.name)}
                        ref={transformationFirst}
                        position={selectedPort.inputElement.transformationParams.position}
                        showX={selectedPort.isSelected}
                        showY={selectedPort.isSelected}
                        showZ={selectedPort.isSelected}
                    />
                    <TransformControls
                        object={scene.getObjectByName((selectedPort as Port).outputElement.name)}
                        ref={transformationLast}
                        position={selectedPort.outputElement.transformationParams.position}
                        showX={selectedPort.isSelected}
                        showY={selectedPort.isSelected}
                        showZ={selectedPort.isSelected}
                    />
                </>
            }
        </>
    )


}
