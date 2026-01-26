import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ComponentEntity, GeometryAttributes, TransformationParams } from '../../model/componentEntity/componentEntity';

import { ImportActionParamsObject } from '../../importFunctions/importTypes';
import { Material } from '../../model/componentEntity/componentEntity';

export type CanvasState = {
    components: ComponentEntity[],
    numberOfGeneratedKey: number,
    selectedComponentKey: number,
    lastActionType: string,
}

const initialState: CanvasState = {
    components: [],
    numberOfGeneratedKey: 0,
    selectedComponentKey: 0,
    lastActionType: ""
}

export const CanvasSlice = createSlice({
    name: 'canvas',
    initialState: initialState,
    reducers: {
        //qui vanno inserite le azioni
        addComponent(state: CanvasState, action: PayloadAction<ComponentEntity>) {
            setLastActionType(state, action.type)
            state.components.push(action.payload);
            state.selectedComponentKey = action.payload.keyComponent
        },
        removeComponent(state: CanvasState, action: PayloadAction<number>) {
            setLastActionType(state, action.type)
            state.components = state.components.filter(component => {
                return component.keyComponent !== action.payload;
            });
            (action.payload === state.selectedComponentKey) && setSelectedComponent(state, 0)
        },
        updateTransformationParams(state: CanvasState, action: PayloadAction<TransformationParams>) {
            setLastActionType(state, action.type)
            let selectedComponent = findComponentByKey(state.components, state.selectedComponentKey)
            selectedComponent.previousTransformationParams = selectedComponent.transformationParams
            selectedComponent.transformationParams = action.payload
        },
        updateEntityGeometryParams(state: CanvasState, action: PayloadAction<GeometryAttributes>) {
            setLastActionType(state, action.type)
            let selectedComponent = findComponentByKey(state.components, state.selectedComponentKey)
            selectedComponent.previousGeometryAttributes = selectedComponent.geometryAttributes
            selectedComponent.geometryAttributes = action.payload
        },
        selectComponent(state: CanvasState, action: PayloadAction<number>) {
            setLastActionType(state, action.type)
            state.selectedComponentKey = action.payload
        },
        incrementNumberOfGeneratedKey(state: CanvasState, action: PayloadAction<number>) {
            state.numberOfGeneratedKey += action.payload;
        },
        setComponentMaterial(state: CanvasState, action: PayloadAction<{ key: number, material: Material }>) {
            setLastActionType(state, action.type)
            let component = findComponentByKey(state.components, action.payload.key);
            setMaterialRecursively(component, action.payload.material);
        },
        removeComponentMaterial(state: CanvasState, action: PayloadAction<{ keyComponent: number }>) {
            setLastActionType(state, action.type)
            let component = findComponentByKey(state.components, action.payload.keyComponent);
            removeMaterialRecursively(component);
        },
        setComponentsOpacity(state: CanvasState, action: PayloadAction<{ keys: number[], opacity: number }>) {
            setLastActionType(state, action.type)
            let componentsToChange = state.components.filter(component => action.payload.keys.includes(component.keyComponent))
            componentsToChange.map(component => {
                setOpacityRecursively(component, action.payload.opacity)
            })
        },
        setComponentsTransparency(state: CanvasState, action: PayloadAction<{ keys: number[], transparency: boolean }>) {
            setLastActionType(state, action.type)
            let componentsToChange = state.components.filter(component => action.payload.keys.includes(component.keyComponent))
            componentsToChange.map(component => {
                setTransparencyRecursively(component, action.payload.transparency)
            })
        },
        updateName(state: CanvasState, action: PayloadAction<{ key: number, name: string }>) {
            setLastActionType(state, action.type)
            let component = findComponentByKey(state.components, action.payload.key);
            component.name = action.payload.name
        },
        importStateCanvas(state: CanvasState, action: PayloadAction<ImportActionParamsObject>) {
            setLastActionType(state, action.type)
            state.components = state.components.concat(
                action.payload.canvas.components.map(component => {
                    return updateKeysRecursively(component, state.numberOfGeneratedKey)
                })
            )
            state.numberOfGeneratedKey = maximumKeyComponentAmong(state.components)
        },
        binaryOperation(state: CanvasState, action: PayloadAction<{ elementsToRemove: number[], newEntity: ComponentEntity }>) {
            setLastActionType(state, action.type)
            state.components = state.components.filter(component => !action.payload.elementsToRemove.includes(component.keyComponent))
            state.components.push(action.payload.newEntity)
            setSelectedComponent(state, action.payload.newEntity.keyComponent)
        },
        replaceComponentWithMultipleEntities(state: CanvasState, action: PayloadAction<{ keyToRemove: number, newEntities: ComponentEntity[] }>) {
            setLastActionType(state, action.type)
            state.components = state.components.filter(component => component.keyComponent !== action.payload.keyToRemove)
            state.components.push(...action.payload.newEntities)
            setSelectedComponent(state, 0)
        },
        resetState(state: CanvasState) {
            state.components = initialState.components
            state.selectedComponentKey = initialState.selectedComponentKey
            state.lastActionType = initialState.lastActionType
            state.numberOfGeneratedKey = initialState.numberOfGeneratedKey
        },
        setCanvasState(state: CanvasState, action: PayloadAction<CanvasState>) {
            state.components = action.payload.components;
            state.numberOfGeneratedKey = action.payload.numberOfGeneratedKey;
            state.selectedComponentKey = action.payload.selectedComponentKey;
            state.lastActionType = action.payload.lastActionType;
        }
    },
    // extraReducers: {
    //     //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
    // }
})


export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    addComponent, removeComponent, updateTransformationParams, updateEntityGeometryParams, selectComponent, incrementNumberOfGeneratedKey,
    setComponentMaterial, removeComponentMaterial, updateName, importStateCanvas, binaryOperation, resetState, setComponentsOpacity, setComponentsTransparency,
    replaceComponentWithMultipleEntities, setCanvasState
} = CanvasSlice.actions

export const canvasStateSelector = (state: { canvas: CanvasState }) => state.canvas;
export const canvasAllStateSelector = (state: { canvas: CanvasState }) => state.canvas;
export const componentseSelector = (state: { canvas: CanvasState }) => state.canvas.components;
export const keySelectedComponenteSelector = (state: { canvas: CanvasState }) => state.canvas.selectedComponentKey;
export const selectedComponentSelector = (state: { canvas: CanvasState }) => findComponentByKey(state.canvas.components, state.canvas.selectedComponentKey)
export const lengthPastStateSelector = (state: { canvas: CanvasState }) => 0 // Mocked, use historySlice instead
export const lengthFutureStateSelector = (state: { canvas: CanvasState }) => 0 // Mocked, use historySlice instead
export const lastActionTypeSelector = (state: { canvas: CanvasState }) => state.canvas.lastActionType;
export const numberOfGeneratedKeySelector = (state: { canvas: CanvasState }) => state.canvas.numberOfGeneratedKey;
export const canvasComponentsSelector = (state: { canvas: CanvasState }) => state.canvas.components;

export const findComponentByKey = (components: ComponentEntity[], key: number) => components.filter(component => component.keyComponent === key)[0]
const setSelectedComponent = (state: CanvasState, keyComponentToSelect: number) => state.selectedComponentKey = keyComponentToSelect
const setLastActionType = (state: CanvasState, actionType: string) => state.lastActionType = actionType
const maximumKeyComponentAmong = (components: ComponentEntity[]) => components.reduce((max, component) => max = (component.keyComponent > max) ? component.keyComponent : max, 0)

const updateKeysRecursively = (component: ComponentEntity, offset: number): ComponentEntity => {
    component.keyComponent += offset;
    if (component.children) {
        component.children.forEach(child => updateKeysRecursively(child, offset));
    }
    return component;
}

const setMaterialRecursively = (component: ComponentEntity, material: Material) => {
    if (component.type === 'GROUP' && component.children) {
        component.material = material;
        component.children.forEach(child => setMaterialRecursively(child, material));
    } else {
        component.material = material;
    }
}

const removeMaterialRecursively = (component: ComponentEntity) => {
    if (component.type === 'GROUP' && component.children) {
        component.material = undefined;
        component.children.forEach(child => removeMaterialRecursively(child));
    } else {
        component.material = undefined;
    }
}

const setOpacityRecursively = (component: ComponentEntity, opacity: number) => {
    if (component.type === 'GROUP' && component.children) {
        component.opacity = opacity;
        component.children.forEach(child => setOpacityRecursively(child, opacity));
    } else {
        component.opacity = opacity;
    }
}

const setTransparencyRecursively = (component: ComponentEntity, transparency: boolean) => {
    if (component.type === 'GROUP' && component.children) {
        component.transparency = transparency;
        component.children.forEach(child => setTransparencyRecursively(child, transparency));
    } else {
        component.transparency = transparency;
    }
}
