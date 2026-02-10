import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';
import {
    selectedProjectSelector,
    resetInterestFrequencyIndex,
    setTimes,
    setFrequencies,
    addInterestFrequencyIndex,
    removeInterestFrequencyIndex,
} from '../../../../../../store/projectSlice';

export interface TimeRangeDefProps {
    setSavedPhysicsParameters: Function;
    disabled: boolean;
}

export const TimeRangeDef: React.FC<TimeRangeDefProps> = ({
    setSavedPhysicsParameters,
    disabled,
}) => {
    const selectedProject = useSelector(selectedProjectSelector);
    const [tMax, setTMax] = useState<number>(
        selectedProject?.times
            ? selectedProject?.times[selectedProject?.times.length - 1]
            : 0,
    );
    const [tStep, setTStep] = useState<number>(
        selectedProject?.times ? selectedProject?.times[1] : 0,
    );
    const dispatch = useDispatch();
    const theme = useSelector(ThemeSelector);

    function createTimeVector(delta_t: number, T: number): number[] {
        const time: number[] = [];
        for (let t = 0; t <= T; t += delta_t) {
            time.push(t);
        }
        return time;
    }

    function crea_freqs(t: number[]): number[] {
        const fintem = t[t.length - 1] - t[0]; // lungh. finestra temporale
        const ncampt = t.length; // n. di camp. nel tempo (2^15)
        const frefond = 1 / fintem;
        const f: number[] = [];
        for (let i = 0; i <= Math.floor(ncampt / 2); i++) {
            f.push(i * frefond);
        }
        return f;
    }

    return (
        <div className="flex flex-col gap-4">
            <h6 className={`text-sm font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Time Range Definition</h6>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Final Time (s)</span>
                    <input
                        min={0}
                        disabled={disabled}
                        className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                            ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                            : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        type="number"
                        onKeyDown={(evt) => ['+'].includes(evt.key) && evt.preventDefault()}
                        onChange={(e) => {
                            if (e.target.value.startsWith('-')) {
                                setTMax(parseFloat('' + Number(e.target.value.substring(1))));
                            } else {
                                setTMax(parseFloat('' + Number(e.target.value)));
                            }
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Time Step (s)</span>
                    <input
                        min={0}
                        disabled={disabled}
                        className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                            ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                            : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        type="number"
                        step={1}
                        onKeyDown={(evt) => ['+'].includes(evt.key) && evt.preventDefault()}
                        onChange={(e) => {
                            if (e.target.value.startsWith('-')) {
                                setTStep(parseFloat('' + Number(e.target.value.substring(1))));
                            } else {
                                setTStep(parseFloat('' + Number(e.target.value)));
                            }
                        }}
                    />
                </div>
            </div>

            <button
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${theme === 'light'
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={tMax === 0 || tMax < tStep || disabled}
                onClick={() => {
                    dispatch(resetInterestFrequencyIndex());
                    let times = createTimeVector(tStep, tMax);
                    dispatch(setTimes(times));
                    dispatch(setFrequencies(crea_freqs(times)));
                    setSavedPhysicsParameters(false);
                }}
            >
                Generate Times Vector
            </button>

            {selectedProject?.times && selectedProject.times.length > 0 && (
                <div className={`mt-2 p-4 rounded-xl border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
                    <h6 className={`text-sm font-bold mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Generated Times</h6>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs opacity-70">
                        <div>Count: {selectedProject?.times?.length}</div>
                        <div>Step: {tStep.toExponential(2)} s</div>
                        <div>Final: {tMax.toExponential(2)} s</div>
                    </div>
                    <div className={`p-2 rounded-lg max-h-[150px] overflow-y-auto custom-scrollbar ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/20 border border-white/10'
                        }`}>
                        <div className="flex flex-wrap gap-2">
                            {selectedProject?.times?.map((t, index) => (
                                <span key={index} className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-gray-300'
                                    }`}>
                                    {t % 1 !== 0 ? t.toExponential(2) : t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedProject?.frequencies && selectedProject.frequencies.length > 0 && (
                <div className={`mt-2 p-4 rounded-xl border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
                    <h6 className={`text-sm font-bold mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Generated Frequencies</h6>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs opacity-70">
                        <div>Count: {selectedProject?.frequencies?.length ? selectedProject.frequencies.length - 1 : 0}</div>
                        <div>Min: {selectedProject?.frequencies?.[1] ? parseFloat(selectedProject.frequencies[1].toFixed(4)).toExponential() : 0} Hz</div>
                        <div>Max: {selectedProject?.frequencies?.[selectedProject.frequencies.length - 1] ? parseFloat(selectedProject.frequencies[selectedProject.frequencies.length - 1].toFixed(4)).toExponential() : 0} Hz</div>
                    </div>

                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-xs font-bold opacity-70">Frequency</span>
                        <span className="text-xs font-bold opacity-70">Interest</span>
                    </div>

                    <div className={`p-2 rounded-lg max-h-[200px] overflow-y-auto custom-scrollbar ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/20 border border-white/10'
                        }`}>
                        {selectedProject?.frequencies
                            ?.filter((f) => f !== 0)
                            .map((f, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-2 rounded-lg ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <span className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                                        {f % 1 !== 0 ? f.toExponential(2) : f}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="accent-blue-500 w-4 h-4"
                                        disabled={disabled}
                                        defaultChecked={
                                            selectedProject?.interestFrequenciesIndexes &&
                                            selectedProject?.interestFrequenciesIndexes?.filter(
                                                (i) => i - 1 === index,
                                            ).length > 0
                                        }
                                        name={f.toString()}
                                        id={f.toString()}
                                        onChange={(e) => {
                                            setSavedPhysicsParameters(false);
                                            if (e.currentTarget.checked) {
                                                dispatch(addInterestFrequencyIndex(index + 1));
                                            } else {
                                                dispatch(removeInterestFrequencyIndex(index + 1));
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};
