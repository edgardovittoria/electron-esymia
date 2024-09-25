import React, { FC } from "react";
import { useDispatch } from "react-redux";
import { Port, Probe } from "../../../../../../model/esymiaModels";
import { updatePortPosition } from "../../../../../../store/projectSlice";
import { DebounceInput } from "react-debounce-input";

interface PortPositionProps {
	selectedPort: Port | Probe;
	disabled: boolean;
	setSavedPortParameters: Function
}

export const PortPosition: FC<PortPositionProps> = ({
	selectedPort,
	disabled,
	setSavedPortParameters
}) => {
	const dispatch = useDispatch();
  //console.log(selectedPort)

	return (
		<>
			{selectedPort.category === "port" ||
			selectedPort.category === "lumped" ? (
				<div
					className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor bg-[#f6f6f6]`}>
					<h6 className="xl:text-base text-[12px]">Port Position</h6>
					<div className="mt-2">
						<span className="xl:text-base text-[12px]">Input (X,Y,Z)</span>
						<div className="flex gap-2 lg:gap-0 lg:flex-row flex-col justify-around mt-2">
              <TerminationPositionInput
                dataTestId="inputPositionX"
                disabled={disabled}
                value={selectedPort.inputElement[0]}
                onChange={(event) => {
                  let newPosition = [
                    parseFloat(parseFloat(event.target.value).toFixed(6)),
                    parseFloat(selectedPort.inputElement[1].toFixed(6)),
                    parseFloat(selectedPort.inputElement[2].toFixed(6)),
                  ];
                  dispatch(
                    updatePortPosition({
                      type: "first",
                      position: newPosition as [number, number, number],
                    })
                  );
                  setSavedPortParameters(false)
                }}
              />
              <TerminationPositionInput
                dataTestId="inputPositionY"
                disabled={disabled}
                value={selectedPort.inputElement[1]}
                onChange={(event) => {
                  let newPosition = [
                    selectedPort.inputElement[0],
                    parseFloat(parseFloat(event.target.value).toFixed(6)),
                    selectedPort.inputElement[2],
                  ];
                  dispatch(
                    updatePortPosition({
                      type: "first",
                      position: newPosition as [number, number, number],
                    })
                  );
                  setSavedPortParameters(false)
                }}
              />
              <TerminationPositionInput
                dataTestId="inputPositionZ"
                disabled={disabled}
                value={selectedPort.inputElement[2]}
                onChange={(event) => {
                  let newPosition = [
                    parseFloat(selectedPort.inputElement[0].toFixed(6)),
                    parseFloat(selectedPort.inputElement[1].toFixed(6)),
                    parseFloat(parseFloat(event.target.value).toFixed(6))
                  ];
                  dispatch(
                    updatePortPosition({
                      type: "first",
                      position: newPosition as [number, number, number],
                    })
                  );
                  setSavedPortParameters(false)
                }}
              />
						</div>
					</div>
					<div className="mt-2">
						<span className="xl:text-base text-[12px]">Output (X,Y,Z)</span>
						<div className="flex gap-2 lg:gap-0 lg:flex-row flex-col justify-around mt-2">
              <TerminationPositionInput
                  dataTestId="outputPositionX"
                  disabled={disabled}
                  value={selectedPort.outputElement[0]}
                  onChange={(event) => {
                    let newPosition = [
                      parseFloat(parseFloat(event.target.value).toFixed(6)),
                      parseFloat(selectedPort.outputElement[1].toFixed(6)),
                      parseFloat(selectedPort.outputElement[2].toFixed(6)),
                    ];
                    dispatch(
                      updatePortPosition({
                        type: "last",
                        position: newPosition as [number, number, number],
                      })
                    );
                    setSavedPortParameters(false)
                  }}
                />
              <TerminationPositionInput
                  dataTestId="outputPositionY"
                  disabled={disabled}
                  value={selectedPort.outputElement[1]}
                  onChange={(event) => {
										let newPosition = [
											parseFloat(selectedPort.outputElement[0].toFixed(6)),
											parseFloat(parseFloat(event.target.value).toFixed(6)),
											parseFloat(selectedPort.outputElement[2].toFixed(6)),
										];
										dispatch(
											updatePortPosition({
												type: "last",
												position: newPosition as [number, number, number],
											})
										);
										setSavedPortParameters(false)
									}}
                />
							<TerminationPositionInput
                  dataTestId="outputPositionZ"
                  disabled={disabled}
                  value={selectedPort.outputElement[2]}
                  onChange={(event) => {
										let newPosition = [
											parseFloat(selectedPort.outputElement[0].toFixed(6)),
											parseFloat(selectedPort.outputElement[1].toFixed(6)),
                      parseFloat(parseFloat(event.target.value).toFixed(6)),
										];
										dispatch(
											updatePortPosition({
												type: "last",
												position: newPosition as [number, number, number],
											})
										);
										setSavedPortParameters(false)
									}}
                />
						</div>
					</div>
				</div>
			) : (
				<div
					className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]`}>
					<h6 className="xl:text-base text-[12px]">Probe Position</h6>
					<div className="mt-2">
						<span className="xl:text-base text-[12px]">Position (X,Y,Z)</span>
						<div className="flex gap-2 lg:gap-0 lg:flex-row flex-col justify-around mt-2">
              <TerminationPositionInput
                  disabled={disabled}
                  value={parseFloat((selectedPort as Probe).groupPosition[0].toFixed(6))}
                  onChange={(event) => {
										let newPosition = [
											parseFloat(event.target.value),
											(selectedPort as Probe).groupPosition[1],
											(selectedPort as Probe).groupPosition[2],
										];
										dispatch(
											updatePortPosition({
												type: "probe",
												position: newPosition as [number, number, number],
											})
										);
										setSavedPortParameters(false)
									}}
                />
              <TerminationPositionInput
                  disabled={disabled}
                  value={parseFloat((selectedPort as Probe).groupPosition[1].toFixed(6))}
                  onChange={(event) => {
										let newPosition = [
											(selectedPort as Probe).groupPosition[0],
											parseFloat(event.target.value),
											(selectedPort as Probe).groupPosition[2],
										];
										dispatch(
											updatePortPosition({
												type: "probe",
												position: newPosition as [number, number, number],
											})
										);
										setSavedPortParameters(false)
									}}
                />
              <TerminationPositionInput
                  disabled={disabled}
                  value={parseFloat((selectedPort as Probe).groupPosition[2].toFixed(6))}
                  onChange={(event) => {
										let newPosition = [
											(selectedPort as Probe).groupPosition[0],
											(selectedPort as Probe).groupPosition[1],
											parseFloat(event.target.value),
										];
										dispatch(
											updatePortPosition({
												type: "probe",
												position: newPosition as [number, number, number],
											})
										);
										setSavedPortParameters(false)
									}}
                />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

interface TerminationPositionInputProps {
  dataTestId?: string,
  disabled: boolean,
  debounceTimeoutMilliSecs?: number,
  inputStep?: number,
  value: number,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) & React.ChangeEventHandler<HTMLInputElement>,
}

const TerminationPositionInput: FC<TerminationPositionInputProps> = ({dataTestId, disabled, debounceTimeoutMilliSecs, inputStep, value, onChange}) => {
  return (
    <div className="lg:w-[30%] w-full">
								<input
                  id={dataTestId}
									disabled={disabled}
									className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[12px] font-bold rounded formControl`}
									type="number"
                  //debounceTimeout={debounceTimeoutMilliSecs ? debounceTimeoutMilliSecs : 500}
									step={inputStep ? inputStep : 0.000001}
									value={parseFloat(value.toFixed(6))}
									onChange={onChange}
								/>
							</div>
  )
}
