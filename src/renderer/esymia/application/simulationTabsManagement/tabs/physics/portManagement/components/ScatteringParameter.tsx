import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector, setScatteringValue } from '../../../../../../store/projectSlice';
import { DebounceInput } from 'react-debounce-input';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';

export interface ScatteringParameterProps{
    setSavedPortParameters: Function
}

const ScatteringParameter: React.FC<ScatteringParameterProps> = ({setSavedPortParameters}) => {

    const dispatch = useDispatch()
    const selectedProject = useSelector(selectedProjectSelector)
    const theme = useSelector(ThemeSelector)

    return(
      <div className={`mt-3 p-[10px] text-left border-[1px] ${theme === 'light' ? 'border-secondaryColor bg-[#f6f6f6]' : 'border-secondaryColorDark bg-bgColorDark'}`}>
        <h6 className="lg:text-base text-[12px]">Scattering Parameters Reference Impedance</h6>
        <div className="mt-2">
          <DebounceInput
            data-testid="scattering"
            className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-black text-[15px] font-bold rounded formControl"
            type="number"
            min={0}
            debounceTimeout={500}
            disabled={selectedProject?.simulation?.status === 'Completed'}
            step={0.1}
            value={selectedProject?.scatteringValue ? selectedProject.scatteringValue : 0.0}
            onChange={(event) => {
              if(event.target.value.startsWith('-')) {
                dispatch(setScatteringValue(parseFloat(event.target.value.substring(1))))
              }else {
                dispatch(setScatteringValue(parseFloat(event.target.value)))
              }
              setSavedPortParameters(false);
            }}

          />
        </div>
      </div>
    )
}

export default ScatteringParameter
