import { FC } from "react";
import { GeometryParamsGeneralProps } from "./geometryParams";
import { SphereGeometryAttributes } from "../../../../../../cad_library";


export const SphereGeometryParams: FC<GeometryParamsGeneralProps> = ({ entity, updateParams }) => {
    return (
        <div className="flex flex-col gap-2">
            {[
                { label: 'Radius', value: (entity.geometryAttributes as SphereGeometryAttributes).radius, key: 'radius', step: 0.1 },
                { label: 'Width Segments', value: (entity.geometryAttributes as SphereGeometryAttributes).widthSegments, key: 'widthSegments', step: 1 },
                { label: 'Height Segments', value: (entity.geometryAttributes as SphereGeometryAttributes).heightSegments, key: 'heightSegments', step: 1 },
            ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 dark:text-gray-300">{item.label}</span>
                    <input
                        type="number"
                        step={item.step}
                        className="w-20 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-1 py-0.5 text-xs text-center text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                        value={item.value}
                        onChange={(e) => updateParams({ ...entity.geometryAttributes, [item.key]: parseFloat(e.target.value) || 0 } as SphereGeometryAttributes)}
                    />
                </div>
            ))}
        </div>
    )
}
