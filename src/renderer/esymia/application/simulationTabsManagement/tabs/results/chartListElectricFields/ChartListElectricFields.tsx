import { useEffect, useState } from 'react';
import { RadiationDiagram2D } from './components/RiadiationDiagram2D';
import { RadiationDiagram3D } from './components/RadiationDiagram3D';
import { publishMessage } from '../../../../../../middleware/stompMiddleware';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../../store/projectSlice';
import {
  setSpinnerSolverResults,
  spinnerSolverResultsSelector,
} from '../../../../../store/tabsAndMenuItemsSlice';
import { ImSpinner } from 'react-icons/im';

interface ChartListElectricFieldsProps {
  N_circ: number;
  freq: number[];
}

export const ChartListElectricFields: React.FC<
  ChartListElectricFieldsProps
> = ({ N_circ, freq }) => {
  const [indice_freq, setindice_freq] = useState(0);
  const [selectedFreq, setselectedFreq] = useState(
    freq.length > 0 ? freq[0] : 0,
  );
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();
  const spinnerSolverResults = useSelector(spinnerSolverResultsSelector);

  return (
    <>
      <div className={` ${spinnerSolverResults ? 'opacity-40' : 'opacity-100'} flex flex-col gap-2 mt-5 overflow-scroll max-h-[80vh] px-1`}>
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs mb-1">
              Pick a frequency
            </legend>
            <select
              defaultValue={selectedFreq}
              className="select select-sm"
              onChange={(e) => {
                dispatch(setSpinnerSolverResults(true));
                setselectedFreq(parseFloat(e.currentTarget.value));
                setindice_freq(
                  freq.findIndex(
                    (val) => val === parseFloat(e.currentTarget.value),
                  ),
                );
                dispatch(
                  publishMessage({
                    queue: 'management_solver',
                    body: {
                      message: 'get results electric fields',
                      body: {
                        fileId: selectedProject?.simulation?.resultS3,
                        freq_index:
                          freq.findIndex(
                            (val) => val === parseFloat(e.currentTarget.value),
                          ) + 1,
                        id: selectedProject?.id
                      },
                    },
                  }),
                );
              }}
            >
              {freq.map((f) => {
                return <option value={f}>{f.toExponential(2)}</option>;
              })}
            </select>
          </fieldset>
          <div className="flex flex-col gap-2 overflow-scroll h-[75vh]">
            <RadiationDiagram2D
              N_circ={N_circ}
              indice_freq={indice_freq}
              selectedFreq={selectedFreq}
            />
            <RadiationDiagram3D
              N_circ_3D={N_circ / 2}
              indice_freq={indice_freq}
              selectedFreq={selectedFreq}
            />
          </div>
        </div>
    </>
  );
};
