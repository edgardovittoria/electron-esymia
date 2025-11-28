import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Port, Probe } from "../../../../../../model/esymiaModels";
import { selectedProjectSelector, updatePortPosition } from "../../../../../../store/projectSlice";
import { ThemeSelector } from "../../../../../../store/tabsAndMenuItemsSlice";

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
  const theme = useSelector(ThemeSelector)
  const distanceUnit = useSelector(selectedProjectSelector)?.modelUnit;

  return (
    <>
      {selectedPort.category === "port" ||
        selectedPort.category === "lumped" ? (
        <div className={`mt-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
          <h6 className={`text-sm font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Port Position</h6>
          <p className={`text-xs mt-2 mb-4 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            If the input field is blank and you want to enter a negative number, the minus key must be pressed two times.
          </p>

          <div className="space-y-4">
            <div>
              <span className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{`Input [X,Y,Z coords [${distanceUnit}]]`}</span>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <TerminationPositionInput
                  dataTestId="inputPositionX"
                  disabled={disabled}
                  value={selectedPort.inputElement[0]}
                  theme={theme}
                  onChange={(event) => {
                    let newPosition = [
                      parseFloat(parseFloat(event.target.value).toString()),
                      parseFloat(selectedPort.inputElement[1].toString()),
                      parseFloat(selectedPort.inputElement[2].toString()),
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
                  theme={theme}
                  onChange={(event) => {
                    let newPosition = [
                      selectedPort.inputElement[0],
                      parseFloat(parseFloat(event.target.value).toString()),
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
                  theme={theme}
                  onChange={(event) => {
                    let newPosition = [
                      parseFloat(selectedPort.inputElement[0].toString()),
                      parseFloat(selectedPort.inputElement[1].toString()),
                      parseFloat(parseFloat(event.target.value).toString())
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

            <div>
              <span className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{`Output [X,Y,Z coords [${distanceUnit}]]`}</span>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <TerminationPositionInput
                  dataTestId="outputPositionX"
                  disabled={disabled}
                  value={selectedPort.outputElement[0]}
                  theme={theme}
                  onChange={(event) => {
                    let newPosition = [
                      parseFloat(parseFloat(event.target.value).toString()),
                      parseFloat(selectedPort.outputElement[1].toString()),
                      parseFloat(selectedPort.outputElement[2].toString()),
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
                  theme={theme}
                  onChange={(event) => {
                    let newPosition = [
                      parseFloat(selectedPort.outputElement[0].toString()),
                      parseFloat(parseFloat(event.target.value).toString()),
                      parseFloat(selectedPort.outputElement[2].toString()),
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
                  theme={theme}
                  onChange={(event) => {
                    let newPosition = [
                      parseFloat(selectedPort.outputElement[0].toString()),
                      parseFloat(selectedPort.outputElement[1].toString()),
                      parseFloat(parseFloat(event.target.value).toString()),
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
        </div>
      ) : (
        <div className={`mt-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
          <h6 className={`text-sm font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Probe Position</h6>
          <div className="mt-4">
            <span className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Position (X,Y,Z)</span>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <TerminationPositionInput
                disabled={disabled}
                value={parseFloat((selectedPort as Probe).groupPosition[0].toString())}
                theme={theme}
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
                value={parseFloat((selectedPort as Probe).groupPosition[1].toString())}
                theme={theme}
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
                value={parseFloat((selectedPort as Probe).groupPosition[2].toString())}
                theme={theme}
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
  theme: string,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) & React.ChangeEventHandler<HTMLInputElement>,
}

const TerminationPositionInput: FC<TerminationPositionInputProps> = ({ dataTestId, disabled, debounceTimeoutMilliSecs, inputStep, value, theme, onChange }) => {
  return (
    <div className="w-full">
      <input
        id={dataTestId}
        disabled={disabled}
        className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
            ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
            : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        type="number"
        step={inputStep ? inputStep : 0.000001}
        value={parseFloat(value.toString())}
        onChange={onChange}
      />
    </div>
  )
}
