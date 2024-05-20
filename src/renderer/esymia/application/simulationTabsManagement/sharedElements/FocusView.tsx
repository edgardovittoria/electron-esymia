import { Bounds, useBounds } from "@react-three/drei"
import { FC, ReactNode, useEffect } from "react"


export const FocusView: FC<{margin?:number, resetFocus?: boolean, children: ReactNode}> = ({ margin, resetFocus, children }) => {
    return (
        <Bounds fit clip observe margin={margin ? margin : 1.8}>
          <FocusReset reset={resetFocus}/>
          {children}
        </Bounds>
    )
}

const FocusReset: FC<{reset?: boolean}> = ({reset}) => {
    const bounds = useBounds()
    useEffect(() => {
        bounds.refresh().fit()
      }, [reset])
    return (
       <></>
    )
}


