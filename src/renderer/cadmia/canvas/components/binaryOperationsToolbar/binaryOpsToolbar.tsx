import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    binaryOpEntitiesKeysSelector,
    binaryOpSelector,
    binaryOpToolbarVisibilitySelector,
    setBinaryOp,
} from "./binaryOperationsToolbarSlice";
import { CadmiaModality } from "../cadmiaModality/cadmiaModalityType";
import unionIcon from "./style/unionIcon.png";
import intersectionIcon from "./style/intersectionIcon.png";
import subtractionIcon from "./style/subtractionIcon.png";
import { Dispatch } from "@reduxjs/toolkit";
import { CheckIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { setModality } from "../cadmiaModality/cadmiaModalitySlice";
import { toolbarIconsHeight, toolbarIconsWidth, toolbarsHintStyle } from '../../../config/styles';
import { setLoadingSpinner } from "../../../store/modelSlice";
import { binaryOperation, BinaryOperationType, canvasStateSelector, ComponentEntity, ComponentTypes, CompositeEntity, findComponentByKey, GeometryAttributes, getNewKeys, CanvasState } from "../../../../cad_library";

interface BinaryOpsToolbarProps {
}

export const BinaryOpsToolbar: React.FC<BinaryOpsToolbarProps> = () => {
    const dispatch = useDispatch();
    const binaryOp = useSelector(binaryOpSelector);
    const binaryOperationsToolbarVisible = useSelector(binaryOpToolbarVisibilitySelector)
    const entityKeysForBinaryOperations = useSelector(
        binaryOpEntitiesKeysSelector
    );
    const canvasState = useSelector(canvasStateSelector);
    const [temporaryEntitiesForBinaryOp, setTemporaryEntitiesForBinaryOp] =
        useState(entityKeysForBinaryOperations);

    const makeBinaryOperation = (
        operation: BinaryOperationType,
        entityKeys: number[],
        canvasState: CanvasState,
        dispatch: Dispatch
    ) => {
        let mainEntitykey = entityKeys[0];
        let result = entityKeys
            .slice(1)
            .reduce((temporaryResult: CompositeEntity, elementB) => {
                let entityB = findComponentByKey(canvasState.components, elementB);
                return compositeEntityFromOperationBetweenTwoEntities(
                    temporaryResult,
                    entityB,
                    operation,
                    getNewKeys(canvasState.numberOfGeneratedKey, dispatch)[0]
                );
            }, findComponentByKey(canvasState.components, mainEntitykey) as CompositeEntity);
        let elementsToRemove = [];
        switch (operation) {
            case "UNION":
                elementsToRemove = entityKeys;
                break;
            case "SUBTRACTION":
                elementsToRemove = [mainEntitykey];
                break;
            case "INTERSECTION":
                elementsToRemove = entityKeys;
                break;
        }
        dispatch(
            binaryOperation({
                elementsToRemove: elementsToRemove,
                newEntity: result,
            })
        );
        return "operation completed";
    };

    const compositeEntityFromOperationBetweenTwoEntities = (
        elementA: ComponentEntity,
        elementB: ComponentEntity,
        type: ComponentTypes,
        newKey: number
    ) => {
        let compositeEntity: CompositeEntity = {
            ...elementA,
            baseElements: {
                elementA: { ...elementA },
                elementB: { ...elementB },
            },
            type: type,
            keyComponent: newKey,
            geometryAttributes: {} as GeometryAttributes,
        };
        return compositeEntity;
    };

    // useEffect(() => {
    //     if (
    //         temporaryEntitiesForBinaryOp.length > entityKeysForBinaryOperations.length
    //     ) {
    //         let elements = temporaryEntitiesForBinaryOp.filter(
    //             (el) => !entityKeysForBinaryOperations.includes(el)
    //         );
    //         dispatch(setComponentsOpacity({ keys: elements, opacity: 0.3 }));
    //     } else {
    //         let elements = entityKeysForBinaryOperations.filter(
    //             (el) => !temporaryEntitiesForBinaryOp.includes(el)
    //         );
    //         dispatch(setComponentsOpacity({ keys: elements, opacity: 1 }));
    //     }
    //     setTemporaryEntitiesForBinaryOp(entityKeysForBinaryOperations);
    // }, [entityKeysForBinaryOperations]);


    return (
        <>
            {binaryOperationsToolbarVisible &&
                <div className="flex items-center gap-1 p-1 rounded-xl shadow-lg backdrop-blur-md bg-white/90 border border-gray-200 dark:bg-black/80 dark:border-white/10 transition-all duration-300">
                    <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
             ${binaryOp === "UNION" ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-white/10'}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("UNION"));
                        }}
                    >
                        <img src={unionIcon} alt="Union operation" className={`w-6 h-6 ${binaryOp === "UNION" ? 'brightness-0 invert' : ''}`} />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">UNION</span>
                        </div>
                    </div>
                    <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
             ${binaryOp === "INTERSECTION" ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-white/10'}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("INTERSECTION"));
                        }}
                    >
                        <img src={intersectionIcon} alt="Intersection operation" className={`w-6 h-6 ${binaryOp === "INTERSECTION" ? 'brightness-0 invert' : ''}`} />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">INTERSECTION</span>
                        </div>
                    </div>
                    <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
             ${binaryOp === "SUBTRACTION" ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-white/10'}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("SUBTRACTION"));
                        }}
                    >
                        <img src={subtractionIcon} alt="Subtraction operation" className={`w-6 h-6 ${binaryOp === "SUBTRACTION" ? 'brightness-0 invert' : ''}`} />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">SUBTRACTION</span>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-300 dark:bg-white/20 mx-1" />

                    <div
                        className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group hover:bg-gray-100 dark:hover:bg-white/10`}>
                        {binaryOp === undefined ? (
                            <XCircleIcon className="text-gray-400 w-6 h-6" />
                        ) : (
                            <XCircleIcon className="text-red-500 w-6 h-6 hover:text-red-600 transition-colors"
                                onClick={() => dispatch(setModality('NormalSelection' as CadmiaModality))}
                            />
                        )}
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">EXIT</span>
                        </div>
                    </div>
                    <div
                        className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group hover:bg-gray-100 dark:hover:bg-white/10`}>
                        {entityKeysForBinaryOperations.length > 1 ? (
                            <CheckIcon className="text-green-500 w-6 h-6 hover:text-green-600 transition-colors"
                                onClick={() => {
                                    dispatch(setLoadingSpinner(true))
                                    binaryOp &&
                                        makeBinaryOperation(
                                            binaryOp as BinaryOperationType,
                                            entityKeysForBinaryOperations,
                                            canvasState,
                                            dispatch
                                        );
                                    dispatch(setModality('NormalSelection' as CadmiaModality))
                                    dispatch(setLoadingSpinner(false))
                                }}
                            />
                        ) : (
                            <CheckIcon className="text-gray-400 w-6 h-6" />
                        )}
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">EXECUTE</span>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};
