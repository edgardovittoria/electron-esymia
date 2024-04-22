import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector, setScatteringValue } from '../../../../../../store/projectSlice';

export interface ScatteringParameterProps{
    setSavedPortParameters: Function
}

const ScatteringParameter: React.FC<ScatteringParameterProps> = ({setSavedPortParameters}) => {

    const dispatch = useDispatch()
    const selectedProject = useSelector(selectedProjectSelector)

    return(
      <div className="mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]">
        <h6 className="lg:text-base text-[12px]">Scattering Parameters Reference Impedance</h6>
        <div className="mt-2">
          <input
            className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
            type="number"
            disabled={selectedProject?.simulation?.status === 'Completed'}
            step={0.1}
            value={selectedProject?.scatteringValue ? selectedProject.scatteringValue : 0.0}
            onChange={(event) => {
              dispatch(setScatteringValue(parseFloat(event.target.value)))
              setSavedPortParameters(false);
            }}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>
      </div>
    )
}

export default ScatteringParameter
