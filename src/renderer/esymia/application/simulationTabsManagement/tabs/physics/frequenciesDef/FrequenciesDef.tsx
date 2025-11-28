import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector, setFrequencies } from '../../../../../store/projectSlice';
import { log10 } from 'chart.js/helpers';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';

export interface FrequenciesDefProps {
  setSavedPhysicsParameters: Function;
  disabled: boolean;
}

const FrequenciesDef: React.FC<FrequenciesDefProps> = ({ setSavedPhysicsParameters, disabled }) => {
  const [fMin, setFMin] = useState<number>(0);
  const [fMax, setFMax] = useState<number>(0);
  const [fNum, setFNum] = useState<number>(0);
  const [scaleType, setScaleType] = useState<0 | 1>(0);
  let logSpace = require('@stdlib/array-logspace');
  let linSpace = require('@stdlib/array-linspace');
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);

  return (
    <div className="flex flex-col gap-4">
      <h6 className={`text-sm font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Range Definition</h6>

      <div className="flex flex-row gap-6 px-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${scaleType === 0
              ? 'border-blue-500'
              : (theme === 'light' ? 'border-gray-400 group-hover:border-blue-400' : 'border-gray-500 group-hover:border-blue-400')
            }`}>
            {scaleType === 0 && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          <input
            type="radio"
            name="scaleType"
            className="hidden"
            checked={scaleType === 0}
            onChange={() => setScaleType(0)}
          />
          <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Logarithmic</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${scaleType === 1
              ? 'border-blue-500'
              : (theme === 'light' ? 'border-gray-400 group-hover:border-blue-400' : 'border-gray-500 group-hover:border-blue-400')
            }`}>
            {scaleType === 1 && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          <input
            type="radio"
            name="scaleType"
            className="hidden"
            checked={scaleType === 1}
            onChange={() => setScaleType(1)}
          />
          <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Linear</span>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Min (Hz)</span>
          <input
            data-testid="fmin"
            min={0}
            disabled={disabled}
            className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            type="number"
            onKeyDown={(evt) => ["+", "-"].includes(evt.key) && evt.preventDefault()}
            onChange={(e) => {
              if (e.target.value.startsWith('-')) {
                setFMin(parseFloat("" + Number(e.target.value.substring(1))));
              } else {
                setFMin(parseFloat("" + Number(e.target.value)));
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Max (Hz)</span>
          <input
            data-testid="fmax"
            disabled={disabled}
            min={0}
            className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            type="number"
            onKeyDown={(evt) => ["+", "-"].includes(evt.key) && evt.preventDefault()}
            onChange={(e) => {
              if (e.target.value.startsWith('-')) {
                setFMax(parseFloat("" + Number(e.target.value.substring(1))));
              } else {
                setFMax(parseFloat("" + Number(e.target.value)));
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Count</span>
          <input
            data-testid="fnum"
            min={0}
            disabled={disabled}
            className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            type="number"
            step={1}
            onKeyDown={(evt) => ["+", "-", "e", "E"].includes(evt.key) && evt.preventDefault()}
            onChange={(e) => {
              if (e.target.value.startsWith('-')) {
                setFNum(parseFloat("" + Number(e.target.value.substring(1))));
              } else {
                setFNum(parseFloat("" + Number(e.target.value)));
              }
            }}
          />
        </div>
      </div>

      <button
        data-testid="generateFrequencies"
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${theme === 'light'
            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={(fNum === 0 || fMax <= fMin)}
        onClick={() => {
          scaleType === 0 ? dispatch(setFrequencies(logSpace(log10(fMin), log10(fMax), fNum))) : dispatch(setFrequencies([].slice.call(linSpace(fMin, fMax, fNum))));
          setSavedPhysicsParameters(false);
        }}
      >
        Generate
      </button>

      {selectedProject?.frequencies && selectedProject.frequencies.length > 0 && (
        <div className={`mt-2 p-4 rounded-xl border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
          <h6 className={`text-sm font-bold mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Generated Frequencies</h6>
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs opacity-70">
            <div>Count: {selectedProject.frequencies.length}</div>
            <div>Min: {selectedProject.frequencies[0] ? parseFloat(selectedProject.frequencies[0].toFixed(4)).toExponential() : 0} Hz</div>
            <div>Max: {selectedProject.frequencies[selectedProject.frequencies.length - 1] ? parseFloat(selectedProject.frequencies[selectedProject.frequencies.length - 1].toFixed(4)).toExponential() : 0} Hz</div>
          </div>
          <div className={`p-2 rounded-lg max-h-[150px] overflow-y-auto custom-scrollbar ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/20 border border-white/10'
            }`}>
            <div className="flex flex-wrap gap-2">
              {selectedProject.frequencies.map((f, index) => (
                <span key={index} className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-gray-300'
                  }`}>
                  {f % 1 !== 0 ? f.toFixed(4) : f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrequenciesDef;
