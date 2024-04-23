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

	return (
		<>
			{selectedPort.category === "port" ||
			selectedPort.category === "lumped" ? (
				<div
					className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]`}>
					<h6 className="xl:text-base text-[12px]">Port Position</h6>
					<div className="mt-2">
						<span className="xl:text-base text-[12px]">Input (X,Y,Z)</span>
						<div className="flex gap-2 lg:gap-0 lg:flex-row flex-col justify-around mt-2">
              <TerminationPositionInput
                disabled={disabled}
                value={selectedPort.inputElement.transformationParams.position[0]}
                onChange={(event) => {
                  let newPosition = [
                    parseFloat(event.target.value),
                    selectedPort.inputElement.transformationParams
                      .position[1],
                    selectedPort.inputElement.transformationParams
                      .position[2],
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
                disabled={disabled}
                value={selectedPort.inputElement.transformationParams.position[1]}
                onChange={(event) => {
                  let newPosition = [
                    selectedPort.inputElement.transformationParams
                      .position[0],
                    parseFloat(event.target.value),
                    selectedPort.inputElement.transformationParams
                      .position[2],
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
                disabled={disabled}
                value={selectedPort.inputElement.transformationParams.position[2]}
                onChange={(event) => {
                  let newPosition = [
                    selectedPort.inputElement.transformationParams
                      .position[0],
                    selectedPort.inputElement.transformationParams
                      .position[1],
                    parseFloat(event.target.value),
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
                  disabled={disabled}
                  value={selectedPort.outputElement.transformationParams.position[0]}
                  onChange={(event) => {
                    let newPosition = [
                      parseFloat(event.target.value),
                      selectedPort.outputElement.transformationParams
                        .position[1],
                      selectedPort.outputElement.transformationParams
                        .position[2],
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
                  disabled={disabled}
                  value={selectedPort.outputElement.transformationParams.position[1]}
                  onChange={(event) => {
										let newPosition = [
											selectedPort.outputElement.transformationParams
												.position[0],
											parseFloat(event.target.value),
											selectedPort.outputElement.transformationParams
												.position[2],
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
                  disabled={disabled}
                  value={selectedPort.outputElement.transformationParams.position[2]}
                  onChange={(event) => {
										let newPosition = [
											selectedPort.outputElement.transformationParams
												.position[0],
											selectedPort.outputElement.transformationParams
												.position[1],
											parseFloat(event.target.value),
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
  disabled: boolean,
  debounceTimeoutMilliSecs?: number,
  inputStep?: number,
  value: number,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) & React.ChangeEventHandler<HTMLInputElement>,
}

const TerminationPositionInput: FC<TerminationPositionInputProps> = ({disabled, debounceTimeoutMilliSecs, inputStep, value, onChange}) => {
  return (
    <div className="lg:w-[30%] w-full">
								<DebounceInput
									disabled={disabled}
									className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[12px] font-bold rounded formControl`}
									type="number"
                  debounceTimeout={debounceTimeoutMilliSecs ? debounceTimeoutMilliSecs : 500}
									step={inputStep ? inputStep : 0.000001}
									value={value}
									onChange={onChange}
									onWheel={(e: { target: { blur: () => any; }; }) => e.target.blur()}
								/>
							</div>
  )
}
