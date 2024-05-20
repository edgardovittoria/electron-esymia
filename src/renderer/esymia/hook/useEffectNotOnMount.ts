import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export const useEffectNotOnMount = (effect: EffectCallback, deps?: DependencyList) => {
  const isFirstRender = useRef(true)
  return useEffect(() => {
    if(isFirstRender.current){
      isFirstRender.current = false
    }
    else{
      effect()
    }
  }, deps)

}
