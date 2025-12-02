export type { CanvasState } from "./canvasSlice"
export {
    CanvasSlice,
    addComponent,
    removeComponent,
    updateTransformationParams,
    updateEntityGeometryParams,
    selectComponent,
    incrementNumberOfGeneratedKey,
    setComponentMaterial,
    removeComponentMaterial,
    updateName,
    importStateCanvas,
    binaryOperation,
    setComponentsOpacity,
    setComponentsTransparency,
    resetState,
    replaceComponentWithMultipleEntities,
    setCanvasState
} from "./canvasSlice"
export {
    canvasStateSelector,
    canvasAllStateSelector,
    componentseSelector,
    keySelectedComponenteSelector,
    selectedComponentSelector,
    lengthFutureStateSelector,
    lengthPastStateSelector,
    lastActionTypeSelector,
    numberOfGeneratedKeySelector,
    findComponentByKey
} from "./canvasSlice"