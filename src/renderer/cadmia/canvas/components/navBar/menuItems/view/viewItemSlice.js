"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusToSceneSelector = exports.setFocusNotToScene = exports.resetFocusToScene = exports.ViewItemSlice = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
exports.ViewItemSlice = (0, toolkit_1.createSlice)({
    name: 'viewItemState',
    initialState: {
        focusToScene: true
    },
    reducers: {
        resetFocusToScene: function (state) {
            state.focusToScene = true;
        },
        setFocusNotToScene: function (state) {
            state.focusToScene = false;
        }
    }
});
exports.resetFocusToScene = (_a = exports.ViewItemSlice.actions, _a.resetFocusToScene), exports.setFocusNotToScene = _a.setFocusNotToScene;
var focusToSceneSelector = function (state) { return state.viewItemState.focusToScene; };
exports.focusToSceneSelector = focusToSceneSelector;
