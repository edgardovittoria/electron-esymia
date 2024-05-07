import React, {useEffect, useRef} from "react";
import {FrontSide, InstancedMesh, Object3D} from "three";
import {Material} from "cad-library";
import {ExternalGridsObject} from "../../../../../../model/esymiaModels";
import {useSelector} from "react-redux";
import {meshGeneratedSelector} from "../../../../../../store/projectSlice";
import { Brick } from '../../rightPanelSimulator/components/createGridsExternals';
import { ScalingViewParams } from "../../../../sharedElements/utilityFunctions";


interface InstancedMeshProps {
    index: number;
    materialsList: Material[];
    externalGrids: ExternalGridsObject,
    scalingViewParams: ScalingViewParams

}

export const MyInstancedMesh: React.FC<InstancedMeshProps> = ({
                                                                  index,
                                                                  materialsList,
                                                                  externalGrids,
                                                                  scalingViewParams
                                                              }) => {
    let meshGenerated = useSelector(meshGeneratedSelector)

    const meshRef = useRef<InstancedMesh[]>([]);
    const edgeRef = useRef<InstancedMesh[]>([])


    useEffect(() => {
        if (meshGenerated === "Generated") {
            let tempObject = new Object3D();
            Object.values(externalGrids.externalGrids).forEach((matrix:Brick[], index) => {
                if (externalGrids && meshRef.current[index]) {
                    let y = 0;
                    matrix.forEach(m => {
                        const id = y++;
                        tempObject.position.set(
                            m.x !== 0
                                ? ((m.x) * externalGrids.cell_size.cell_size_x) * 1020 * scalingViewParams.x
                                : externalGrids.origin.origin_x/1000,
                            m.y !== 0
                                ? ((m.y) * externalGrids.cell_size.cell_size_y) *
                                1020 * scalingViewParams.y
                                : externalGrids.origin.origin_y/1000,
                            m.z !== 0
                                ? ((m.z) * externalGrids.cell_size.cell_size_z ) * 1020 * scalingViewParams.z
                                : externalGrids.origin.origin_z/1000
                        );
                        tempObject.updateMatrix();
                        meshRef.current[index].setMatrixAt(id, tempObject.matrix);
                        edgeRef.current[index].setMatrixAt(id, tempObject.matrix);
                    })

                    meshRef.current[index].instanceMatrix.needsUpdate = true;
                    edgeRef.current[index].instanceMatrix.needsUpdate = true;
                }
            });
        }
    }, [meshGenerated, materialsList, externalGrids, scalingViewParams]);


    return (
        <>
            <instancedMesh
            frustumCulled={false}
                ref={(el) => {
                    if (el) {
                        meshRef.current[index] = el;
                    }
                }}
                key={index}
                args={[null as any, null as any, Object.values(externalGrids.externalGrids)[index].length]}>
                <boxGeometry
                    args={
                        [

                            (externalGrids?.cell_size.cell_size_x as number) * 1000 * scalingViewParams.x,
                            (externalGrids?.cell_size.cell_size_y as number) * 1000 * scalingViewParams.y,
                            (externalGrids?.cell_size.cell_size_z as number) * 1000 * scalingViewParams.z,

                        ]
                    }
                />
                <meshPhongMaterial
                    color={materialsList[index] && materialsList[index].color}
                    side={FrontSide}
                />
            </instancedMesh>
            <instancedMesh
            frustumCulled={false}
                ref={(el) => {
                    if (el) {
                        edgeRef.current[index] = el;
                    }
                }}
                key={index + 1}
                args={[null as any, null as any, Object.values(externalGrids.externalGrids)[index].length]}>
                <boxGeometry
                    args={
                        [

                            (externalGrids?.cell_size.cell_size_x as number) * 1000 * scalingViewParams.x,
                            (externalGrids?.cell_size.cell_size_y as number) * 1000 * scalingViewParams.y,
                            (externalGrids?.cell_size.cell_size_z as number) * 1000 * scalingViewParams.z,

                        ]
                    }
                ></boxGeometry>
                <meshPhongMaterial
                    color={"black"} wireframe={true}
                />
            </instancedMesh>
        </>
    );
};
