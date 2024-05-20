import {CubeGeometryAttributes, updateTransformationParams} from "cad-library";
import {FC} from "react";
import {GeometryParamsGeneralProps} from "./geometryParams";
import { useDispatch } from "react-redux";

export const CubeGeometryParams: FC<GeometryParamsGeneralProps> = ({entity, updateParams}) => {
  const dispatch = useDispatch()
    return (
        <>
            <div className="flex row">
              <div key="xmin" className="flex">
                  <span className="text-black w-[40%] text-left text-[10px]">Xmin</span>
                  <div className="flex mb-[5px]">
                      <input key="xmin"
                            type="number"
                            max={entity.transformationParams.position[0] + (entity.geometryAttributes as CubeGeometryAttributes).width/2}
                            step="0.1"
                            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                            autoComplete="off"
                            value={entity.transformationParams.position[0] - (entity.geometryAttributes as CubeGeometryAttributes).width/2}
                            onChange={(e) => {
                              updateParams({
                                ...entity.geometryAttributes,
                                width: Math.abs((entity.transformationParams.position[0] + (entity.geometryAttributes as CubeGeometryAttributes).width/2) - parseFloat(e.target.value))
                            } as CubeGeometryAttributes)
                            dispatch(updateTransformationParams({...entity.transformationParams, position: [
                              (parseFloat(e.target.value) + (entity.transformationParams.position[0] + (entity.geometryAttributes as CubeGeometryAttributes).width/2))/2,
                              entity.transformationParams.position[1],
                              entity.transformationParams.position[2]]}))
                            }}
                      />
                  </div>
              </div>
              <div key="xmax" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">Xmax</span>
                <div className="flex mb-[5px]">
                    <input key="xmax"
                           type="number"
                           min={entity.transformationParams.position[0] - (entity.geometryAttributes as CubeGeometryAttributes).width/2}
                           step="0.1"
                           className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                           autoComplete="off"
                           value={entity.transformationParams.position[0] + (entity.geometryAttributes as CubeGeometryAttributes).width/2}
                           onChange={(e) => {
                            updateParams({
                              ...entity.geometryAttributes,
                              width: Math.abs(parseFloat(e.target.value) - (entity.transformationParams.position[0] - (entity.geometryAttributes as CubeGeometryAttributes).width/2))
                          } as CubeGeometryAttributes)
                          dispatch(updateTransformationParams({...entity.transformationParams, position: [
                            (parseFloat(e.target.value) + (entity.transformationParams.position[0] - (entity.geometryAttributes as CubeGeometryAttributes).width/2))/2,
                            entity.transformationParams.position[1],
                            entity.transformationParams.position[2]]}))
                           }}
                    />
                </div>
              </div>
            </div>
            <div className="flex row">
              <div key="ymin" className="flex">
                  <span className="text-black w-[40%] text-left text-[10px]">Ymin</span>
                  <div className="flex mb-[5px]">
                      <input key="ymin"
                            type="number"
                            step="0.1"
                            max={entity.transformationParams.position[1] + (entity.geometryAttributes as CubeGeometryAttributes).height/2}
                            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                            autoComplete="off"
                            value={entity.transformationParams.position[1] - (entity.geometryAttributes as CubeGeometryAttributes).height/2}
                            onChange={(e) => {
                              updateParams({
                                ...entity.geometryAttributes,
                                height: Math.abs((entity.transformationParams.position[1] + (entity.geometryAttributes as CubeGeometryAttributes).height/2) - parseFloat(e.target.value))
                            } as CubeGeometryAttributes)
                            dispatch(updateTransformationParams({...entity.transformationParams, position: [
                              entity.transformationParams.position[0],
                              (parseFloat(e.target.value) + (entity.transformationParams.position[1] + (entity.geometryAttributes as CubeGeometryAttributes).height/2))/2,
                              entity.transformationParams.position[2]]}))
                            }}
                      />
                  </div>
              </div>
              <div key="ymax" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">Ymax</span>
                <div className="flex mb-[5px]">
                    <input key="ymax"
                           type="number"
                           min={entity.transformationParams.position[1] - (entity.geometryAttributes as CubeGeometryAttributes).height/2}
                           step="0.1"
                           className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                           autoComplete="off"
                           value={entity.transformationParams.position[1] + (entity.geometryAttributes as CubeGeometryAttributes).height/2}
                           onChange={(e) => {
                            updateParams({
                              ...entity.geometryAttributes,
                              height: Math.abs(parseFloat(e.target.value) - (entity.transformationParams.position[1] - (entity.geometryAttributes as CubeGeometryAttributes).height/2))
                          } as CubeGeometryAttributes)
                          dispatch(updateTransformationParams({...entity.transformationParams, position: [
                            entity.transformationParams.position[0],
                            (parseFloat(e.target.value) + (entity.transformationParams.position[1] - (entity.geometryAttributes as CubeGeometryAttributes).height/2))/2,
                            entity.transformationParams.position[2]]}))
                        }}
                    />
                </div>
              </div>
            </div>
            <div className="flex row">
              <div key="zmin" className="flex">
                  <span className="text-black w-[40%] text-left text-[10px]">Zmin</span>
                  <div className="flex mb-[5px]">
                      <input key="zmin"
                            type="number"
                            max={entity.transformationParams.position[2] + (entity.geometryAttributes as CubeGeometryAttributes).depth/2}
                            step="0.1"
                            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                            autoComplete="off"
                            value={entity.transformationParams.position[2] - (entity.geometryAttributes as CubeGeometryAttributes).depth/2}
                            onChange={(e) => {
                              updateParams({
                                ...entity.geometryAttributes,
                                depth: Math.abs((entity.transformationParams.position[2] + (entity.geometryAttributes as CubeGeometryAttributes).depth/2) - parseFloat(e.target.value))
                            } as CubeGeometryAttributes)
                            dispatch(updateTransformationParams({...entity.transformationParams, position: [
                              entity.transformationParams.position[0],
                              entity.transformationParams.position[1],
                              (parseFloat(e.target.value) + (entity.transformationParams.position[2] + (entity.geometryAttributes as CubeGeometryAttributes).depth/2))/2
                              ]}))
                            }}
                      />
                  </div>
              </div>
              <div key="zmax" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">Zmax</span>
                <div className="flex mb-[5px]">
                    <input key="zmax"
                           type="number"
                           min={entity.transformationParams.position[2] - (entity.geometryAttributes as CubeGeometryAttributes).depth/2}
                           step="0.1"
                           className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                           autoComplete="off"
                           value={entity.transformationParams.position[2] + (entity.geometryAttributes as CubeGeometryAttributes).depth/2}
                           onChange={(e) => {
                            updateParams({
                              ...entity.geometryAttributes,
                              depth: Math.abs(parseFloat(e.target.value) - (entity.transformationParams.position[2] - (entity.geometryAttributes as CubeGeometryAttributes).depth/2))
                          } as CubeGeometryAttributes)
                          dispatch(updateTransformationParams({...entity.transformationParams, position: [
                            entity.transformationParams.position[0],
                            entity.transformationParams.position[1],
                            (parseFloat(e.target.value) + (entity.transformationParams.position[2] - (entity.geometryAttributes as CubeGeometryAttributes).depth/2))/2
                            ]}))
                           }}
                    />
                </div>
              </div>
            </div>
            {/* <div key="width" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">width</span>
                <div className="flex mb-[5px]">
                    <input key="width"
                           type="number"
                           step="0.1"
                           className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                           autoComplete="off"
                           value={(entity.geometryAttributes as CubeGeometryAttributes).width}
                           onChange={(e) => updateParams({
                               ...entity.geometryAttributes,
                               width: parseFloat(e.target.value) || 0
                           } as CubeGeometryAttributes)}
                    />
                </div>
            </div>
            <div key="heigth" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">heigth</span>
                <div className="flex mb-[5px]">
                    <input key="height"
                           type="number"
                           step="0.1"
                           className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                           autoComplete="off"
                           value={(entity.geometryAttributes as CubeGeometryAttributes).height}
                           onChange={(e) => updateParams({
                               ...entity.geometryAttributes,
                               height: parseFloat(e.target.value) || 0
                           } as CubeGeometryAttributes)}
                    />
                </div>
            </div>
            <div key="depth" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">depth</span>
                    <div className="flex mb-[5px]">
                        <input key="depth"
                               type="number"
                               step="0.1"
                               className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                               autoComplete="off"
                               value={(entity.geometryAttributes as CubeGeometryAttributes).depth}
                               onChange={(e) => updateParams({
                                   ...entity.geometryAttributes,
                                   depth: parseFloat(e.target.value) || 0
                               } as CubeGeometryAttributes)}
                        />
                    </div>
            </div> */}
            <div key="width_segments" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">width segments</span>
                    <div className="flex mb-[5px]">
                        <input key="width_segments"
                               type="number"
                               step="1"
                               className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                               autoComplete="off"
                               value={(entity.geometryAttributes as CubeGeometryAttributes).widthSegments}
                               onChange={(e) => updateParams({
                                   ...entity.geometryAttributes,
                                   widthSegments: parseFloat(e.target.value) || 0
                               } as CubeGeometryAttributes)}
                        />
                    </div>
            </div>
            <div key="heigth_segments" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">heigth segments</span>
                    <div className="flex mb-[5px]">
                        <input key="height_segments"
                               type="number"
                               step="1"
                               className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                               autoComplete="off"
                               value={(entity.geometryAttributes as CubeGeometryAttributes).heigthSegments}
                               onChange={(e) => updateParams({
                                   ...entity.geometryAttributes,
                                   heigthSegments: parseFloat(e.target.value) || 0
                               } as CubeGeometryAttributes)}
                        />
                    </div>
            </div>
            <div key="depth_segments" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">depth segments</span>
                    <div className="flex mb-[5px]">
                        <input key="depth_segments"
                               type="number"
                               step="1"
                               className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                               autoComplete="off"
                               value={(entity.geometryAttributes as CubeGeometryAttributes).depthSegments}
                               onChange={(e) => updateParams({
                                   ...entity.geometryAttributes,
                                   depthSegments: parseFloat(e.target.value) || 0
                               } as CubeGeometryAttributes)}
                        />
                    </div>
            </div>
        </>
    )
}
