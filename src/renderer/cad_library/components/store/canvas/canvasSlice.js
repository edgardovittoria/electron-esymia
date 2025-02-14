"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.findComponentByKey = exports.numberOfGeneratedKeySelector = exports.lastActionTypeSelector = exports.lengthFutureStateSelector = exports.lengthPastStateSelector = exports.selectedComponentSelector = exports.keySelectedComponenteSelector = exports.componentseSelector = exports.canvasAllStateSelector = exports.canvasStateSelector = exports.setComponentsTransparency = exports.setComponentsOpacity = exports.resetState = exports.binaryOperation = exports.importStateCanvas = exports.updateName = exports.removeComponentMaterial = exports.setComponentMaterial = exports.incrementNumberOfGeneratedKey = exports.selectComponent = exports.updateEntityGeometryParams = exports.updateTransformationParams = exports.removeComponent = exports.addComponent = exports.CanvasSlice = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var initialState = {
    components: [],
    numberOfGeneratedKey: 0,
    selectedComponentKey: 0,
    lastActionType: ""
};
exports.CanvasSlice = (0, toolkit_1.createSlice)({
    name: 'canvas',
    initialState: initialState,
    reducers: {
        //qui vanno inserite le azioni
        addComponent: function (state, action) {
            setLastActionType(state, action.type);
            state.components.push(action.payload);
            state.selectedComponentKey = action.payload.keyComponent;
        },
        removeComponent: function (state, action) {
            setLastActionType(state, action.type);
            state.components = state.components.filter(function (component) {
                return component.keyComponent !== action.payload;
            });
            (action.payload === state.selectedComponentKey) && setSelectedComponent(state, 0);
        },
        updateTransformationParams: function (state, action) {
            setLastActionType(state, action.type);
            var selectedComponent = (0, exports.findComponentByKey)(state.components, state.selectedComponentKey);
            selectedComponent.previousTransformationParams = selectedComponent.transformationParams;
            selectedComponent.transformationParams = action.payload;
        },
        updateEntityGeometryParams: function (state, action) {
            setLastActionType(state, action.type);
            var selectedComponent = (0, exports.findComponentByKey)(state.components, state.selectedComponentKey);
            selectedComponent.previousGeometryAttributes = selectedComponent.geometryAttributes;
            selectedComponent.geometryAttributes = action.payload;
        },
        selectComponent: function (state, action) {
            setLastActionType(state, action.type);
            state.selectedComponentKey = action.payload;
        },
        incrementNumberOfGeneratedKey: function (state, action) {
            state.numberOfGeneratedKey += action.payload;
        },
        setComponentMaterial: function (state, action) {
            setLastActionType(state, action.type);
            var component = (0, exports.findComponentByKey)(state.components, action.payload.key);
            component.material = action.payload.material;
        },
        removeComponentMaterial: function (state, action) {
            setLastActionType(state, action.type);
            var component = (0, exports.findComponentByKey)(state.components, action.payload.keyComponent);
            component.material = undefined;
        },
        setComponentsOpacity: function (state, action) {
            setLastActionType(state, action.type);
            var componentsToChange = state.components.filter(function (component) { return action.payload.keys.includes(component.keyComponent); });
            componentsToChange.map(function (component) { return component.opacity = action.payload.opacity; });
        },
        setComponentsTransparency: function (state, action) {
            setLastActionType(state, action.type);
            var componentsToChange = state.components.filter(function (component) { return action.payload.keys.includes(component.keyComponent); });
            componentsToChange.map(function (component) { return component.transparency = action.payload.transparency; });
        },
        updateName: function (state, action) {
            setLastActionType(state, action.type);
            var component = (0, exports.findComponentByKey)(state.components, action.payload.key);
            component.name = action.payload.name;
        },
        importStateCanvas: function (state, action) {
            setLastActionType(state, action.type);
            state.components = state.components.concat(action.payload.canvas.components.map(function (component) {
                component.keyComponent += state.numberOfGeneratedKey;
                return component;
            }));
            state.numberOfGeneratedKey = maximumKeyComponentAmong(state.components);
        },
        binaryOperation: function (state, action) {
            setLastActionType(state, action.type);
            state.components = state.components.filter(function (component) { return !action.payload.elementsToRemove.includes(component.keyComponent); });
            state.components.push(action.payload.newEntity);
            setSelectedComponent(state, action.payload.newEntity.keyComponent);
        },
        resetState: function (state) {
            state.components = initialState.components;
            state.selectedComponentKey = initialState.selectedComponentKey;
            state.lastActionType = initialState.lastActionType;
            state.numberOfGeneratedKey = initialState.numberOfGeneratedKey;
        },
    },
    // extraReducers: {
    //     //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
    // }
});
//qui vanno inserite tutte le azioni che vogliamo esporatare
exports.addComponent = (_a = exports.CanvasSlice.actions, _a.addComponent), exports.removeComponent = _a.removeComponent, exports.updateTransformationParams = _a.updateTransformationParams, exports.updateEntityGeometryParams = _a.updateEntityGeometryParams, exports.selectComponent = _a.selectComponent, exports.incrementNumberOfGeneratedKey = _a.incrementNumberOfGeneratedKey, exports.setComponentMaterial = _a.setComponentMaterial, exports.removeComponentMaterial = _a.removeComponentMaterial, exports.updateName = _a.updateName, exports.importStateCanvas = _a.importStateCanvas, exports.binaryOperation = _a.binaryOperation, exports.resetState = _a.resetState, exports.setComponentsOpacity = _a.setComponentsOpacity, exports.setComponentsTransparency = _a.setComponentsTransparency;
var canvasStateSelector = function (state) { return state.canvas.present; };
exports.canvasStateSelector = canvasStateSelector;
var canvasAllStateSelector = function (state) { return state.canvas; };
exports.canvasAllStateSelector = canvasAllStateSelector;
var componentseSelector = function (state) { return state.canvas.present.components; };
exports.componentseSelector = componentseSelector;
var keySelectedComponenteSelector = function (state) { return state.canvas.present.selectedComponentKey; };
exports.keySelectedComponenteSelector = keySelectedComponenteSelector;
var selectedComponentSelector = function (state) { return (0, exports.findComponentByKey)(state.canvas.present.components, state.canvas.present.selectedComponentKey); };
exports.selectedComponentSelector = selectedComponentSelector;
var lengthPastStateSelector = function (state) { return state.canvas.past.length; };
exports.lengthPastStateSelector = lengthPastStateSelector;
var lengthFutureStateSelector = function (state) { return state.canvas.future.length; };
exports.lengthFutureStateSelector = lengthFutureStateSelector;
var lastActionTypeSelector = function (state) { return state.canvas.present.lastActionType; };
exports.lastActionTypeSelector = lastActionTypeSelector;
var numberOfGeneratedKeySelector = function (state) { return state.canvas.present.numberOfGeneratedKey; };
exports.numberOfGeneratedKeySelector = numberOfGeneratedKeySelector;
var findComponentByKey = function (components, key) { return components.filter(function (component) { return component.keyComponent === key; })[0]; };
exports.findComponentByKey = findComponentByKey;
var setSelectedComponent = function (state, keyComponentToSelect) { return state.selectedComponentKey = keyComponentToSelect; };
var setLastActionType = function (state, actionType) { return state.lastActionType = actionType; };
var maximumKeyComponentAmong = function (components) { return components.reduce(function (max, component) { return max = (component.keyComponent > max) ? component.keyComponent : max; }, 0); };
