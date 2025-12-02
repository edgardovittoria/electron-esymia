import { Dispatch } from "@reduxjs/toolkit";
import { incrementNumberOfGeneratedKey } from "../store/canvas/canvasSlice";

export function getNewKeys(numberOfGeneratedKey: number, dispatch: Dispatch, numberOfKeyToGenerate = 1) {
    let lastKey = numberOfGeneratedKey
    let newKeys: number[] = []
    for (let i = 1; i <= numberOfKeyToGenerate; i++) {
        newKeys.push(lastKey + i)
    }
    dispatch(incrementNumberOfGeneratedKey(numberOfKeyToGenerate))
    return newKeys;
}
