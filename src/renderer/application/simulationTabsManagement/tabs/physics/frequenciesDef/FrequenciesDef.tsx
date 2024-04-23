import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector, setFrequencies } from '../../../../../store/projectSlice';
import { DebounceInput } from 'react-debounce-input';

export interface FrequenciesDefProps{

}

const FrequenciesDef: React.FC<FrequenciesDefProps> = ({}) => {
  const [fMin, setFMin] = useState<number>(0);
  const [fMax, setFMax] = useState<number>(0);
  const [fNum, setFNum] = useState<number>(0);
  const [scaleType, setScaleType] = useState<0 | 1>(0);
  let logSpace = require('@stdlib/array-logspace')
  let linSpace = require('@stdlib/array-linspace')
  const selectedProject = useSelector(selectedProjectSelector)
  const dispatch = useDispatch()
    return(
      <div className='p-[10px] border-[1px] border-secondaryColor rounded bg-[#f6f6f6] text-left'>
        <h6 className="w-[100%] mb-3">Range Definition</h6>
        <div className='flex flex-row justify-between px-5'>
          <div className='flex flex-row items-center gap-2'>
            <input type="radio" name="radio-1" className="radio" defaultChecked onClick={() => setScaleType(0)}/>
            <span>logarithmic</span>
          </div>
          <div className='flex flex-row items-center gap-2'>
            <input type="radio" name="radio-1" className="radio" onClick={() => setScaleType(1)}/>
            <span>linear</span>
          </div>

        </div>
        <div className='flex flex-row justify-between gap-2 mt-5'>
          <div className='flex flex-col items-center gap-2'>
            <span>{scaleType === 0 ? 'exp f min' : 'f min'}</span>
            <DebounceInput
              debounceTimeout={500}
              className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
              type="number"
              value={fMin}
              onChange={(e) => (scaleType === 0) ? setFMin(parseInt(e.target.value)) :setFMin(parseFloat(e.target.value))}
            />
          </div>
          <div className='flex flex-col items-center gap-2'>
            <span>{scaleType === 0 ? 'exp f max' : 'f max'}</span>
            <DebounceInput
              debounceTimeout={500}
              className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
              type="number"
              value={fMax}
              onChange={(e) => (scaleType === 0) ? setFMax(parseInt(e.target.value)) :setFMax(parseFloat(e.target.value))}
            />
          </div>
          <div className='flex flex-col items-center gap-2'>
            <span>f num</span>
            <DebounceInput
              debounceTimeout={500}
              className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
              type="number"
              min={0}
              step={1}
              value={fNum}
              onChange={(e) => setFNum(parseInt(e.target.value))}
            />
          </div>
        </div>
        <button
          className="button buttonPrimary w-full mt-2 hover:opacity-80 disabled:opacity-60"
          disabled={(fNum === 0 || fMax <= fMin)}
          onClick={() => {
            if(scaleType === 0) {
              dispatch(setFrequencies(logSpace(fMin, fMax, fNum)))
            }else {
              dispatch(setFrequencies(linSpace(fMin, fMax, fNum)))
            }
          }}
        >
          Generate
        </button>
        {selectedProject && selectedProject.frequencies && selectedProject.frequencies.length > 0 &&
          <div className="mt-3">
            <h6 className="w-[100%] mb-2">Generated Frequencies</h6>
            <div className="p-3 bg-white border border-secondaryColor flex flex-col overflow-y-scroll max-h-[200px]">
              {selectedProject.frequencies.map(f => {
                return(
                  <span>{f}</span>
                )
              })}
            </div>
          </div>
        }
      </div>
    )
}

export default FrequenciesDef
