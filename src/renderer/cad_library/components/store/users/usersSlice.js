"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersStateSelector = exports.unsetUser = exports.setUser = exports.UsersSlice = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var initialState = {
    email: undefined,
    userName: undefined,
    userRole: undefined
};
exports.UsersSlice = (0, toolkit_1.createSlice)({
    name: 'user',
    initialState: initialState,
    reducers: {
        //qui vanno inserite le azioni
        setUser: function (state, action) {
            state.email = action.payload.email;
            state.userName = action.payload.userName;
            state.userRole = action.payload.userRole;
        },
        unsetUser: function (state) {
            state.email = undefined;
            state.userName = undefined;
            state.userRole = undefined;
        }
    },
    // extraReducers: {
    //     //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
    // }
});
//qui vanno inserite tutte le azioni che vogliamo esporatare
exports.setUser = (_a = exports.UsersSlice.actions, _a.setUser), exports.unsetUser = _a.unsetUser;
var usersStateSelector = function (state) { return state.user; };
exports.usersStateSelector = usersStateSelector;
