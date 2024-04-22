import React from 'react';
import { useDispatch } from 'react-redux';
import { RLCParams, TempLumped } from '../../../../../../model/esymiaModels';
import { setRLCParams } from '../../../../../../store/projectSlice';

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
      <div className="mt-2">
        <span className="lg:text-base text-[12px]">Resistance</span>
        <input
          className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
          type="number"
          disabled={disabled}
          step={0.000001}
          value={
            selectedPort.rlcParams.resistance
              ? selectedPort.rlcParams.resistance.toString()
              : '0'
          }
          onChange={(event) => {
            dispatch(
              setRLCParams({
                ...selectedPort.rlcParams,
                resistance: parseFloat(event.currentTarget.value),
              }) as RLCParams,
            );
            setSavedPortParameters(false);
          }}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>
      <div className="mt-2">
        <span className="lg:text-base text-[12px]">Inductance</span>
        <input
          className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
          type="number"
          disabled={disabled}
          value={
            selectedPort.rlcParams.inductance
              ? selectedPort.rlcParams.inductance.toString()
              : '0'
          }
          onChange={(event) => {
            dispatch(
              setRLCParams({
                ...selectedPort.rlcParams,
                inductance: parseFloat(event.currentTarget.value),
              }) as RLCParams,
            );
            setSavedPortParameters(false);
          }}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>
      <div className="mt-2">
        <span className="lg:text-base text-[12px]">Capacitance</span>
        <input
          className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
          type="number"
          disabled={disabled}
          value={
            selectedPort.rlcParams.capacitance
              ? selectedPort.rlcParams.capacitance.toString()
              : '0'
          }
          onChange={(event) => {
            dispatch(
              setRLCParams({
                ...selectedPort.rlcParams,
                capacitance: parseFloat(event.currentTarget.value),
              }) as RLCParams,
            );
            setSavedPortParameters(false);
          }}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>
    </div>
  );
};
