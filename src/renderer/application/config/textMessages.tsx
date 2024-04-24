import { FC } from "react"
import { BiHide } from "react-icons/bi"

export const comeBackToModelerMessage = "Go Back to Modeler tab to load a model"
export const emptyResultsMessage = "Launch a simulation and come back here to visualize the results"
export const alertMessageStyle = "text-xl font-semibold"
export const infoSavePhysicsParamsButton = "Saving parameters on server now is not necessary in order to launch a simulation. Use this button if you are not intended to launch a simulation now."
export const PositioningPortsInfo:FC = () => {
  return (
    <div className="flex flex-col text-[12px] text-start p-[10px]">
      <span>You can place terminations in the following ways:</span>
      <div className="list-disc">
        <li>double clicking on model surface point of interest;</li>
        <li>enabling termination location suggestions by clicking on <BiHide className='h-5 w-5 text-green-300'/> button on top of the model, then double clicking on suggestions shown;</li>
        <li>using controls shown directly on the selected port (discouraged).</li>
      </div>
    </div>
  )
}
