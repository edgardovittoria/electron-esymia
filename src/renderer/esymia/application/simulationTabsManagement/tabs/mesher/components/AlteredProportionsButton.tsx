import { FC, useMemo } from "react";
import { TbAxisX } from "react-icons/tb";
import { Project } from "../../../../../model/esymiaModels";
import { calculateModelBoundingBox } from "../../../sharedElements/utilityFunctions";
import * as THREE from 'three'
import { useDispatch, useSelector } from "react-redux";
import { selectedProjectSelector } from "../../../../../store/projectSlice";
import { setScalingViewParamsOfMesh, ThemeSelector } from "../../../../../store/tabsAndMenuItemsSlice";

export const AlteredProportionsButton: FC<{
  threshold: number,
}> = ({ threshold }) => {

  const selectedProject = useSelector(selectedProjectSelector)
  const theme = useSelector(ThemeSelector)

  const calculateScalingViewParams = (selectedProject: Project) => {
    let scalingFactors = {x:1, y:1, z:1}
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

  const dispatch = useDispatch()
  const alteredParams = useMemo(() => calculateScalingViewParams(selectedProject as Project), [selectedProject])

  return (
    <div
      className='tooltip'
      data-tip={
        'Set view with altered scaling factor along axis, to better visualize bricks. It works only if dimensions differ of a factor greather than set threshold.'
      }
    >
      <button
        className={`${theme === 'light' ? 'bg-white' : 'bg-bgColorDark2'} rounded p-2`}
        onClick={() => {
          dispatch(setScalingViewParamsOfMesh(alteredParams))
        }}
      >
      <TbAxisX className='h-5 w-5 text-green-300 hover:text-secondaryColor' />
      </button>
    </div>
  );
};
