import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    binaryOpEntitiesKeysSelector,
    binaryOpSelector,
    binaryOpToolbarVisibilitySelector,
    setBinaryOp,
    attachModeSelector,
    toggleAttachMode
} from "./binaryOperationsToolbarSlice";
import { addNode } from "../../../store/historySlice";
import uniqid from "uniqid";
import { CadmiaModality } from "../cadmiaModality/cadmiaModalityType";
import { TbLayersIntersect, TbLayersSubtract, TbLayersUnion, TbMagnet } from "react-icons/tb";
import { Dispatch } from "@reduxjs/toolkit";
import { CheckIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { setModality, cadmiaModalitySelector } from "../cadmiaModality/cadmiaModalitySlice";
import { toolbarsHintStyle } from '../../../config/styles';
import { setLoadingSpinner } from "../../../store/modelSlice";
import { binaryOperation, BinaryOperationType, canvasStateSelector, ComponentEntity, ComponentTypes, CompositeEntity, findComponentByKey, GeometryAttributes, getNewKeys, CanvasState } from "../../../../cad_library";
import { ThemeSelector } from "../../../../esymia/store/tabsAndMenuItemsSlice";
import { PiIntersect, PiSubtract, PiUnite } from "react-icons/pi";

interface BinaryOpsToolbarProps {
}

export const BinaryOpsToolbar: React.FC<BinaryOpsToolbarProps> = () => {
    const dispatch = useDispatch();
    const binaryOp = useSelector(binaryOpSelector);
    const attachMode = useSelector(attachModeSelector);
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
        let historyId = uniqid();
        result.historyId = historyId;

        dispatch(
            binaryOperation({
                elementsToRemove: elementsToRemove,
                newEntity: result,
            })
        );

        dispatch(addNode({
            id: historyId,
            name: `${operation} Operation`,
            type: operation as any,
            params: {},
            timestamp: Date.now(),
            outputKey: result.keyComponent,
            inputKeys: entityKeys,
            suppressed: false
        }));

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


    const theme = useSelector(ThemeSelector);
    const modality = useSelector(cadmiaModalitySelector);

    return (
        <>
            {binaryOperationsToolbarVisible &&
                <div className={`flex items-center gap-1 p-1 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 ${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'} ${modality === 'Grouping' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
             ${binaryOp === "UNION" ? 'bg-blue-500 text-white shadow-md' : `${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-gray-200'}`}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("UNION"));
                        }}
                    >
                        {/* <TbLayersUnion className="w-6 h-6" /> */}
                        <PiUnite className="w-6 h-6" />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">UNION</span>
                        </div>
                    </div>
                    <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
             ${binaryOp === "INTERSECTION" ? 'bg-blue-500 text-white shadow-md' : `${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-gray-200'}`}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("INTERSECTION"));
                        }}
                    >
                        <PiIntersect className="w-6 h-6" />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">INTERSECTION</span>
                        </div>
                    </div>
                    <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
             ${binaryOp === "SUBTRACTION" ? 'bg-blue-500 text-white shadow-md' : `${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-gray-200'}`}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("SUBTRACTION"));
                        }}
                    >
                        <PiSubtract className="w-6 h-6" />
                        {/* <TbLayersSubtract className="w-6 h-6" /> */}
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">SUBTRACTION</span>
                        </div>
                    </div>

                    <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
             ${attachMode ? 'bg-blue-500 text-white shadow-md' : `${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-gray-200'}`}
            `}
                        onClick={() => {
                            dispatch(toggleAttachMode());
                        }}
                    >
                        <TbMagnet className="w-6 h-6" />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">ATTACH</span>
                        </div>
                    </div>

                    <div className={`w-px h-6 mx-1 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`} />

                    <div
                        className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
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
                        className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
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
