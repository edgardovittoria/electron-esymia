import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector, setFrequencies } from '../../../../../store/projectSlice';
import { log10 } from 'chart.js/helpers';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';

export interface FrequenciesDefProps{
  setSavedPhysicsParameters: Function,
  disabled: boolean
}

const FrequenciesDef: React.FC<FrequenciesDefProps> = ({setSavedPhysicsParameters, disabled}) => {
  const [fMin, setFMin] = useState<number>(0);
  const [fMax, setFMax] = useState<number>(0);
  const [fNum, setFNum] = useState<number>(0);
  const [scaleType, setScaleType] = useState<0 | 1>(0);
  let logSpace = require('@stdlib/array-logspace')
  let linSpace = require('@stdlib/array-linspace')
  const selectedProject = useSelector(selectedProjectSelector)
  const dispatch = useDispatch()
  const theme = useSelector(ThemeSelector)

  return(
    <div className={`p-[10px] mt-2 border-[1px] ${theme === 'light' ? 'border-secondaryColor bg-[#f6f6f6]' : 'border-white bg-bgColorDark'} text-left overflow-y-scroll max-h-[800px]`}>
      <h6 className="w-[100%] mb-3">Range Definition</h6>
      <div className='flex flex-row justify-between px-5'>
        <div className='flex flex-row items-center gap-2'>
          <input type="radio" name="radio-1" className="radio border-white text-black" defaultChecked onClick={() => setScaleType(0)}/>
          <span>logarithmic</span>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <input type="radio" name="radio-1" className="radio border-white text-black" onClick={() => setScaleType(1)}/>
          <span>linear</span>
        </div>

      </div>
      <div className='flex flex-row justify-between gap-2 mt-5'>
        <div className='flex flex-col items-center gap-2'>
          <span>{'f min'}</span>
          <input
            data-testid="fmin"
            //debounceTimeout={700}
            min={0}
            disabled={disabled}
            className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-black text-[15px] font-bold rounded formControl"
            type="number"
            onKeyDown={(evt) => ["+", "-"].includes(evt.key) && evt.preventDefault()}
            onChange={(e) => {
              if(e.target.value.startsWith('-')){
                setFMin(parseFloat("" + Number(e.target.value.substring(1))))
              }else {
                setFMin(parseFloat("" + Number(e.target.value)))
              }
            }}
          />
        </div>
        <div className='flex flex-col items-center gap-2'>
          <span>{'f max'}</span>
          <input
            data-testid="fmax"
            disabled={disabled}
            //debounceTimeout={700}
            min={0}
            className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-black text-[15px] font-bold rounded formControl"
            type="number"
            onKeyDown={(evt) => ["+", "-"].includes(evt.key) && evt.preventDefault()}
            onChange={(e) => {
              if(e.target.value.startsWith('-')){
                setFMax(parseFloat("" + Number(e.target.value.substring(1))))
              }else {
                setFMax(parseFloat("" + Number(e.target.value)))
              }
            }}
          />
        </div>
        <div className='flex flex-col items-center gap-2'>
          <span>f num</span>
          <input
            data-testid="fnum"
            //debounceTimeout={700}
            min={0}
            disabled={disabled}
            className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-black text-[15px] font-bold rounded formControl"
            type="number"
            step={1}
            onKeyDown={(evt) => ["+", "-", "e", "E"].includes(evt.key) && evt.preventDefault()}
            onChange={(e) => {
              if(e.target.value.startsWith('-')){
                setFNum(parseFloat("" + Number(e.target.value.substring(1))))
              }else {
                setFNum(parseFloat("" + Number(e.target.value)))
              }
            }}
          />
        </div>
      </div>
      <button
        data-testid="generateFrequencies"
        className={`button buttonPrimary ${theme === 'light' ? '' : 'bg-bgColorDark2 text-textColorDark border-textColorDark'} w-full mt-2 hover:opacity-80 disabled:opacity-60`}
        disabled={(fNum === 0 || fMax <= fMin)}
        onClick={() => {
          scaleType === 0 ? dispatch(setFrequencies(logSpace(log10(fMin), log10(fMax), fNum))) : dispatch(setFrequencies([].slice.call(linSpace(fMin, fMax, fNum))))
          setSavedPhysicsParameters(false)
        }}
      >
        Generate
      </button>
      {selectedProject && selectedProject.frequencies && selectedProject.frequencies.length > 0 &&
        <div className="mt-3">
          <h6 className="w-[100%] mb-2">Generated Frequencies</h6>
          <div className='flex flex-row'>
            <h6 className="w-[20%] mb-2">n.{selectedProject.frequencies.length}</h6>
            <h6 className="w-[40%] mb-2"> min:{parseFloat(selectedProject.frequencies[0].toFixed(4)).toExponential()}</h6>
            <h6 className="w-[40%] mb-2"> max: {parseFloat(selectedProject.frequencies[selectedProject.frequencies.length -1].toFixed(4)).toExponential()}</h6>
          </div>
          <div className="p-3 bg-white border border-secondaryColor flex flex-col overflow-y-scroll max-h-[200px]">
            {selectedProject.frequencies.map((f,index) => {
              return(
                <span className='text-black' key={index}>{f % 1 !== 0 ? f.toFixed(4): f}</span>
              )
            })}
          </div>
        </div>
      }
    </div>
  )
}

export default FrequenciesDef
