import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector, setScatteringValue } from '../../../../../../store/projectSlice';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';

export interface ScatteringParameterProps {
  setSavedPortParameters: Function
}

const ScatteringParameter: React.FC<ScatteringParameterProps> = ({ setSavedPortParameters }) => {

  const dispatch = useDispatch()
  const selectedProject = useSelector(selectedProjectSelector)
  const theme = useSelector(ThemeSelector)

  return (
    <div className={`mt-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
      <h6 className={`text-sm font-bold mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Scattering Parameters Reference Impedance</h6>
      <div className="mt-2">
        <input
          data-testid="scattering"
          className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
              ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
              : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          type="number"
          min={0}
          disabled={selectedProject?.simulation?.status === 'Completed'}
          step={0.1}
          value={selectedProject?.scatteringValue ? selectedProject.scatteringValue : 0.0}
          onChange={(event) => {
            if (event.target.value.startsWith('-')) {
              dispatch(setScatteringValue(parseFloat(event.target.value.substring(1))))
            } else {
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
