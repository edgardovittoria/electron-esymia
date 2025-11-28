import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RLCParams, TempLumped } from '../../../../../../model/esymiaModels';
import { setRLCParams } from '../../../../../../store/projectSlice';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';

interface RLCParamsProps {
  selectedPort: TempLumped;
  disabled: boolean;
  setSavedPortParameters: Function;
}

export const RLCParamsComponent: React.FC<RLCParamsProps> = ({
  selectedPort,
  disabled,
  setSavedPortParameters,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector)
  return (
    <div className={`mt-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
      <h6 className={`text-sm font-bold mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>RLC Params</h6>
      <div className="space-y-3">
        <RLCParamsInput
          disabled={disabled}
          value={selectedPort.rlcParams.resistance ? selectedPort.rlcParams.resistance : 0}
          label='Resistance'
          theme={theme}
          onChange={(event) => {
            if (event.target.value.startsWith('-')) {
              dispatch(
                setRLCParams({
                  ...selectedPort.rlcParams,
                  resistance: parseFloat(event.target.value.substring(1)),
                }) as RLCParams,
              );
            } else {
              dispatch(
                setRLCParams({
                  ...selectedPort.rlcParams,
                  resistance: parseFloat(event.target.value),
                }) as RLCParams,
              );
            }
            setSavedPortParameters(false);
          }}
        />
        <RLCParamsInput
          disabled={disabled}
          value={selectedPort.rlcParams.inductance ? selectedPort.rlcParams.inductance : 0}
          label='Inductance'
          theme={theme}
          onChange={(event) => {
            if (event.target.value.startsWith('-')) {
              dispatch(
                setRLCParams({
                  ...selectedPort.rlcParams,
                  inductance: parseFloat(event.target.value.substring(1)),
                }) as RLCParams,
              );
            } else {
              dispatch(
                setRLCParams({
                  ...selectedPort.rlcParams,
                  inductance: parseFloat(event.target.value),
                }) as RLCParams,
              );
            }
            setSavedPortParameters(false);
          }}
        />
        <RLCParamsInput
          disabled={disabled}
          value={selectedPort.rlcParams.capacitance ? selectedPort.rlcParams.capacitance : 0}
          label='Capacitance'
          theme={theme}
          onChange={(event) => {
            if (event.target.value.startsWith('-')) {
              dispatch(
                setRLCParams({
                  ...selectedPort.rlcParams,
                  capacitance: parseFloat(event.target.value.substring(1)),
                }) as RLCParams,
              );
            } else {
              dispatch(
                setRLCParams({
                  ...selectedPort.rlcParams,
                  capacitance: parseFloat(event.target.value),
                }) as RLCParams,
              );
            }
            setSavedPortParameters(false);
          }}
        />
      </div>
    </div>
  );
};

interface RLCParamsInputProps {
  label: string,
  disabled: boolean,
  debounceTimeoutMilliSecs?: number,
  inputStep?: number,
  value: number,
  theme: string,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) & React.ChangeEventHandler<HTMLInputElement>,
}

const RLCParamsInput: FC<RLCParamsInputProps> = ({ disabled, debounceTimeoutMilliSecs, inputStep, value, onChange, label, theme }) => {
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{label}</span>
      <input
        className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
            ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
            : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        type="number"
        min={0}
        disabled={disabled}
        //debounceTimeout={debounceTimeoutMilliSecs ? debounceTimeoutMilliSecs : 500}
        onKeyDown={(evt) => ["+", "-"].includes(evt.key) && evt.preventDefault()}
        step={inputStep ? inputStep : 0.000001}
        value={isNaN(value) ? 0 : value}
        onChange={onChange}
      //onWheel={(e: { currentTarget: { blur: () => any; }; }) => e.currentTarget.blur()}
      />
    </div>
  )
}
