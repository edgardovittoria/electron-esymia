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
import {
    binaryOperation,
    BinaryOperationType,
    CanvasState,
    canvasStateSelector,
    ComponentEntity,
    ComponentTypes,
    CompositeEntity,
    findComponentByKey,
    GeometryAttributes,
    getNewKeys,
    setComponentsOpacity,
} from "cad-library";
import { Dispatch } from "@reduxjs/toolkit";
import { CheckIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { setModality } from "../cadmiaModality/cadmiaModalitySlice";
import { toolbarIconsHeight, toolbarIconsWidth, toolbarsHintStyle } from '../../../config/styles';

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
                <div className="absolute left-[120px] top-[10px] w-[150px] text-center shadow grid grid-cols-5">
                    <div className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth} p-1 group bg-white hover:bg-gray-300
             ${binaryOp === "UNION" ? 'bg-gray-400' : 'bg-white'}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("UNION"));
                        }}
                    >
                        <img src={unionIcon} alt="Union operation" />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">UNION</span>
                        </div>
                    </div>
                    <div className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth}] p-1 group bg-white hover:bg-gray-300
             ${binaryOp === "INTERSECTION" ? 'bg-gray-300' : 'bg-white'}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("INTERSECTION"));
                        }}
                    >
                        <img src={intersectionIcon} alt="Intersection operation" />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">INTERSECTION</span>
                        </div>
                    </div>
                    <div className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth}] p-1 group bg-white hover:bg-gray-300
             ${binaryOp === "SUBTRACTION" ? 'bg-gray-300' : 'bg-white'}
            `}
                        onClick={() => {
                            dispatch(setModality('BinaryOperation' as CadmiaModality));
                            dispatch(setBinaryOp("SUBTRACTION"));
                        }}
                    >
                        <img src={subtractionIcon} alt="Subtraction operation" />
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">SUBTRACTION</span>
                        </div>
                    </div>
                    <div
                        className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth}] p-1 group bg-white hover:bg-gray-300`}>
                        {binaryOp === undefined ? (
                            <XCircleIcon className="text-gray-300 w-8 h-8" />
                        ) : (
                            <XCircleIcon className="text-red-600 w-8 h-8"
                                onClick={() => dispatch(setModality('NormalSelection' as CadmiaModality))}
                            />
                        )}
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">EXIT</span>
                        </div>
                    </div>
                    <div
                        className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth}] p-1 group bg-white hover:bg-gray-300`}>
                        {entityKeysForBinaryOperations.length > 1 ? (
                            <CheckIcon className="text-green-600 w-8 h-8"
                                onClick={() => {
                                    binaryOp &&
                                        makeBinaryOperation(
                                            binaryOp as BinaryOperationType,
                                            entityKeysForBinaryOperations,
                                            canvasState,
                                            dispatch
                                        );
                                    dispatch(setModality('NormalSelection' as CadmiaModality))
                                }}
                            />
                        ) : (
                            <CheckIcon className="text-gray-300 w-8 h-8" />
                        )}
                        <div className={toolbarsHintStyle}>
                            <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">EXECUTE OPERATION</span>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};
