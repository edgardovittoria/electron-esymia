import { useEffect, useState } from 'react';
import { RadiationDiagram2D } from './components/RiadiationDiagram2D';
import { RadiationDiagram3D } from './components/RadiationDiagram3D';

interface ChartListElectricFieldsProps {
  N_circ: number;
  freq: number[];
}

export const ChartListElectricFields: React.FC<
  ChartListElectricFieldsProps
> = ({ N_circ, freq }) => {
  const [indice_freq, setindice_freq] = useState(0)
  const [selectedFreq, setselectedFreq] = useState(0)

  useEffect(() => {
    if (freq.length > 0) {
      setselectedFreq(freq[0])
    }
  }, [freq]);

  return (
    <div className="flex flex-col gap-2 mt-5 overflow-scroll max-h-[800px]">
      <fieldset className="fieldset">
        <legend className="fieldset-legend text-xs mb-1">Pick a frequency</legend>
        <select defaultValue={selectedFreq} className="select select-sm" onChange={(e) => {
            setselectedFreq(parseFloat(e.currentTarget.value))
            setindice_freq(freq.findIndex((val) => val === parseFloat(e.currentTarget.value)))
        }}>
          {freq.map((f) => {
            return <option value={f}>{f.toExponential(2)}</option>;
          })}
        </select>
      </fieldset>
      <RadiationDiagram2D N_circ={N_circ} indice_freq={indice_freq} selectedFreq={selectedFreq}/>    
      <RadiationDiagram3D N_circ_3D={N_circ/2} indice_freq={indice_freq} selectedFreq={selectedFreq}/>
    </div>
  );
};
