import { SphereGeometryAttributes } from "cad-library";
import { FC } from "react";
import { GeometryParamsGeneralProps } from "./geometryParams";


export const SphereGeometryParams: FC<GeometryParamsGeneralProps> = ({ entity, updateParams }) => {
    return (
        <>
            <div key="radius" className="flex">
                    <span className="text-black w-[40%] text-left text-xs">radius</span>
                    <div className="flex mb-[5px]">
                        <input key="radius"
                            type="number"
                            step="0.1"
                            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-xs"
                            autoComplete="off"
                            value={(entity.geometryAttributes as SphereGeometryAttributes).radius}
                            onChange={(e) => updateParams({ ...entity.geometryAttributes, radius: parseFloat(e.target.value) || 0 } as SphereGeometryAttributes)}
                        />
                    </div>
            </div>
            <div key="width_segments" className="flex">
                    <span className="text-black w-[40%] text-left text-xs">width segments</span>
                    <div className="flex mb-[5px]">
                        <input key="width_segments"
                            type="number"
                            step="1"
                            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-xs"
                            autoComplete="off"
                            value={(entity.geometryAttributes as SphereGeometryAttributes).widthSegments}
                            onChange={(e) => updateParams({ ...entity.geometryAttributes, widthSegments: parseFloat(e.target.value) || 0 } as SphereGeometryAttributes)}
                        />
                    </div>
            </div>
            <div key="heigth_segments" className="flex">
                    <span className="text-black w-[40%] text-left text-xs">heigth segments</span>
                    <div className="flex mb-[5px]">
                        <input key="heigth_segments"
                            type="number"
                            step="1"
                            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-xs"
                            autoComplete="off"
                            value={(entity.geometryAttributes as SphereGeometryAttributes).heightSegments}
                            onChange={(e) => updateParams({ ...entity.geometryAttributes, heightSegments: parseFloat(e.target.value) || 0 } as SphereGeometryAttributes)}
                        />
                    </div>
            </div>
        </>
    )
}