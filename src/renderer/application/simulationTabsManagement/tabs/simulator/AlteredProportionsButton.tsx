import { FC } from "react";
import { TbAxisX } from "react-icons/tb";
import { Project } from "../../../../model/esymiaModels";
import { ScalingViewParams, calculateModelBoundingBox } from "../../sharedElements/utilityFunctions";
import * as THREE from 'three'

export const AlteredProportionsButton: FC<{
  threshold: number,
  selectedProject: Project,
  setScalingViewParams: Function
}> = ({ selectedProject, setScalingViewParams, threshold }) => {

  const calculateScalingViewParams = (selectedProject: Project) : ScalingViewParams => {
    let scalingFactors: ScalingViewParams = {x:1, y:1, z:1}
    let dims = calculateModelBoundingBox(selectedProject).getSize(new THREE.Vector3());
    if(dims.x >= dims.y && dims.x >= dims.z){
      scalingFactors.y = (dims.x/dims.y) > threshold ? (dims.x/dims.y)/threshold : 1 // threshold è un valore scelto a caso per fissare una soglia che le dimensioni devono essere in rapporto minore o uguale a threshold.
      scalingFactors.z = (dims.x/dims.z) > threshold ? (dims.x/dims.z)/threshold : 1
    }
    else if(dims.y >= dims.x && dims.y >= dims.z){
      scalingFactors.x = (dims.y/dims.x) > threshold ? (dims.y/dims.x)/threshold : 1
      scalingFactors.z = (dims.y/dims.z) > threshold ? (dims.y/dims.z)/threshold : 1
    }
    else {
      scalingFactors.x = (dims.z/dims.x) > threshold ? (dims.z/dims.x)/threshold : 1
      scalingFactors.y = (dims.z/dims.y) > threshold ? (dims.z/dims.y)/threshold : 1
    }
    return scalingFactors
  }

  return (
    <div
      className='tooltip'
      data-tip={
        'Set view with altered scaling factor along axis, to better visualize bricks. It works only if dimensions differ of a factor greather than set threshold.'
      }
    >
      <button
        className='bg-white rounded p-2'
        onClick={() => {setScalingViewParams(calculateScalingViewParams(selectedProject))}}
      >
      <TbAxisX className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
      </button>
    </div>
  );
};
