import { FC } from "react";
import { GeometryParamsGeneralProps } from "./geometryParams";
import { CylinderGeometryAttributes } from "../../../../../../cad_library";


export const CylinderGeometryParams: FC<GeometryParamsGeneralProps> = ({ entity, updateParams }) => {
    return (
        <div className="flex flex-col gap-2">
            {[
                { label: 'Top Radius', value: (entity.geometryAttributes as CylinderGeometryAttributes).topRadius, key: 'topRadius', step: 0.1 },
                { label: 'Bottom Radius', value: (entity.geometryAttributes as CylinderGeometryAttributes).bottomRadius, key: 'bottomRadius', step: 0.1 },
                { label: 'Height', value: (entity.geometryAttributes as CylinderGeometryAttributes).height, key: 'height', step: 0.1 },
                { label: 'Radial Segments', value: (entity.geometryAttributes as CylinderGeometryAttributes).radialSegments, key: 'radialSegments', step: 1 },
                { label: 'Height Segments', value: (entity.geometryAttributes as CylinderGeometryAttributes).heightSegments, key: 'heightSegments', step: 1 },
            ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 dark:text-gray-300">{item.label}</span>
                    <input
                        type="number"
                        step={item.step}
                        className="w-20 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-1 py-0.5 text-xs text-center text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                        value={item.value}
                        onChange={(e) => updateParams({ ...entity.geometryAttributes, [item.key]: parseFloat(e.target.value) || 0 } as CylinderGeometryAttributes)}
                    />
                </div>
            ))}
        </div>
    )
}
