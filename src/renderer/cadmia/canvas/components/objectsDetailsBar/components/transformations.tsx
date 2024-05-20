import {TransformationParamDetails, TransformationParams, updateTransformationParams} from "cad-library";
import {FC} from "react";
import {useDispatch} from "react-redux";

export const Transformations: FC<{ transformationParams: TransformationParams }> = ({transformationParams}) => {
    const dispatch = useDispatch()

    return (
        <>
            <div className="flex mt-2">
                <div className="flex justify-center mx-[10px] ml-[70px] w-full">
                    <div className="text-black w-1/3 text-center font-bold mb-1 text-[10px]">X</div>
                    <div className="text-black w-1/3 text-center font-bold mb-1 text-[10px]">Y</div>
                    <div className="text-black w-1/3 text-center font-bold mb-1 text-[10px]">Z</div>
                </div>
            </div>
            <div key='position' className="flex justify-between">
              <span className="text-black w-[15%] text-[10px]">position</span>
              <div className="flex mb-[5px] justify-between pr-[15px] w-[83%]">
                  {transformationParams.position.map((paramValue, index) =>
                      <input key={index}
                              type="number"
                              step="0.1"
                              className="border border-black rounded shadow w-[30%] text-black text-[10px] px-1"
                              autoComplete="off"
                              value={paramValue}
                              onChange={(e) => {
                                let newPosition: TransformationParamDetails = [...transformationParams.position]
                                newPosition[index] = parseFloat(e.target.value)
                                dispatch(updateTransformationParams({...transformationParams, position: newPosition}))
                              }}
                      />
                  )}
              </div>
            </div>
            <div key='rotation' className="flex justify-between">
              <span className="text-black w-[15%] text-[10px]">rotation</span>
              <div className="flex mb-[5px] justify-between pr-[15px] w-[83%]">
                  {transformationParams.rotation.map((paramValue, index) =>
                    <div key={index} className='flex flex-col justify-center items-center w-[30%]'>
                      <input
                             type="number"
                             step="1"
                             min={-180}
                             max={180}
                             className="border border-black rounded shadow w-full text-black text-[10px] px-1"
                             autoComplete="off"
                             value={(paramValue*180)/Math.PI}
                             onChange={(e) => {
                               let newRotation: TransformationParamDetails = [...transformationParams.rotation]
                               newRotation[index] = (parseFloat(e.target.value)*Math.PI)/180
                               dispatch(updateTransformationParams({...transformationParams, rotation: newRotation}))
                             }}
                      />
                      <span className="text-black w-full text-[10px]">[-180°/180°]</span>
                    </div>

                  )}
              </div>
            </div>
            {/* <div key='scale' className="flex justify-between">
              <span className="text-black w-[15%] text-[10px]">scale</span>
              <div className="flex mb-[5px] justify-between pr-[15px] w-[83%]">
                  {transformationParams.scale.map((paramValue, index) =>
                      <input key={index}
                              type="number"
                              step="0.1"
                              className="border border-black rounded shadow w-[30%] text-black text-[10px] px-1"
                              autoComplete="off"
                              value={paramValue}
                              onChange={(e) => {
                                let newScale: TransformationParamDetails = [...transformationParams.scale]
                                newScale[index] = parseFloat(e.target.value)
                                dispatch(updateTransformationParams({...transformationParams, scale: newScale}))
                              }}
                      />
                  )}
              </div>
            </div> */}
        </>
    )
}
