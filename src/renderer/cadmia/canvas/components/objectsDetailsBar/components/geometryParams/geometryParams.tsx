import { ComponentEntity, GeometryAttributes, updateEntityGeometryParams } from "cad-library";
import { FC } from "react";
import { useDispatch } from "react-redux";
import { ConeGeometryParams } from "./coneGeometryParams";
import { CubeGeometryParams } from "./cubeGeometryParams";
import { CylinderGeometryParams } from "./cylinderGeometryProps";
import { SphereGeometryParams } from "./sphereGeometryParams";
import { TorusGeometryParams } from "./torusGeometryParams";

interface GeometryParamsProps {
    entity: ComponentEntity
}

export type GeometryParamsGeneralProps = {
    entity: ComponentEntity
    updateParams: Function
}

export const GeometryParams: FC<GeometryParamsProps> = ({ entity }) => {

    const dispatch = useDispatch()

    const updateParams = (params: GeometryAttributes) => {
        dispatch(updateEntityGeometryParams(params))
    }

    switch (entity.type) {
        case "CUBE":
            return <CubeGeometryParams entity={entity} updateParams={updateParams} />
        case "SPHERE":
            return <SphereGeometryParams entity={entity} updateParams={updateParams} />
        case "TORUS":
            return <TorusGeometryParams entity={entity} updateParams={updateParams} />
        case "CONE":
            return <ConeGeometryParams entity={entity} updateParams={updateParams} />
        case "CYLINDER":
            return <CylinderGeometryParams entity={entity} updateParams={updateParams} />
        default:
            return <></>
    }
}