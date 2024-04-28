import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { RLCParams, TempLumped } from '../../../../../../model/esymiaModels';
import { setRLCParams } from '../../../../../../store/projectSlice';
import { DebounceInput } from 'react-debounce-input';

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

  return (
    <div className="mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]">
      <h6 className="lg:text-base text-[12px]">RLC Params</h6>
      <RLCParamsInput
        disabled={disabled}
        value={selectedPort.rlcParams.resistance ? selectedPort.rlcParams.resistance : 0}
        label='Resistance'
        onChange={(event) => {
          dispatch(
            setRLCParams({
              ...selectedPort.rlcParams,
              resistance: parseFloat(event.target.value),
            }) as RLCParams,
          );
          setSavedPortParameters(false);
        }}
      />
      <RLCParamsInput
        disabled={disabled}
        value={selectedPort.rlcParams.inductance ? selectedPort.rlcParams.inductance : 0}
        label='Inductance'
        onChange={(event) => {
          dispatch(
            setRLCParams({
              ...selectedPort.rlcParams,
              inductance: parseFloat(event.target.value),
            }) as RLCParams,
          );
          setSavedPortParameters(false);
        }}
      />
      <RLCParamsInput
        disabled={disabled}
        value={selectedPort.rlcParams.capacitance ? selectedPort.rlcParams.capacitance : 0}
        label='Capacitance'
        onChange={(event) => {
          dispatch(
            setRLCParams({
              ...selectedPort.rlcParams,
              capacitance: parseFloat(event.target.value),
            }) as RLCParams,
          );
          setSavedPortParameters(false);
        }}
      />
    </div>
  );
};

interface RLCParamsInputProps {
  label: string,
  disabled: boolean,
  debounceTimeoutMilliSecs?: number,
  inputStep?: number,
  value: number,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) & React.ChangeEventHandler<HTMLInputElement>,
}

const RLCParamsInput: FC<RLCParamsInputProps> = ({disabled, debounceTimeoutMilliSecs, inputStep, value, onChange, label}) => {
  return (
    <div className="mt-2">
        <span className="lg:text-base text-[12px]">{label}</span>
        <DebounceInput
          className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
          type="number"
          disabled={disabled}
          debounceTimeout={debounceTimeoutMilliSecs ? debounceTimeoutMilliSecs : 500}
          step={inputStep ? inputStep : 0.000001}
          value={isNaN(value) ? 0 : value}
          onChange={onChange}
          onWheel={(e: { currentTarget: { blur: () => any; }; }) => e.currentTarget.blur()}
        />
      </div>
  )
}
