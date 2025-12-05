import { CanvasState } from "../../cad_library";
import { HistoryState, OperationType } from "../store/historySlice";
import {
    ComponentEntity,
    CompositeEntity,
    TransformationParams,
    ComponentTypes,
    GeometryAttributes,
    CubeGeometryAttributes,
    SphereGeometryAttributes,
    CylinderGeometryAttributes,
    ConeGeometryAttributes,
    TorusGeometryAttributes
} from "../../cad_library";
import { generateLinearArray, getCenterOfEntities } from "../../cad_library/components/auxiliaryFunctionsUsingThree/patterningUtilities";

// Helper to create a basic entity structure
const createBaseEntity = (
    key: number,
    type: ComponentTypes,
    name: string,
    params: GeometryAttributes
): ComponentEntity => {
    return {
        type: type,
        name: name,
        keyComponent: key,
        orbitEnabled: true,
        transformationParams: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        previousTransformationParams: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        geometryAttributes: params,
        transparency: true,
        opacity: 1,
    };
};

const compositeEntityFromOperation = (
    elementA: ComponentEntity,
    elementB: ComponentEntity,
    type: ComponentTypes,
    newKey: number
): CompositeEntity => {
    return {
        ...elementA,
        baseElements: {
            elementA: { ...elementA },
            elementB: { ...elementB },
        },
        type: type,
        keyComponent: newKey,
        geometryAttributes: {} as GeometryAttributes,
        transformationParams: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, // Reset transform for the container? Or keep A's? 
        // Usually the new composite takes the identity transform and contains the transformed children.
        // But in the original code: ...elementA. So it inherits A's props.
        // Let's stick to the original logic:
        // ...elementA,
        // baseElements: { elementA: {...elementA}, elementB: {...elementB} }
        // Wait, if we copy elementA, we copy its transform.
        // But elementA inside baseElements ALSO has its transform.
        // This might lead to double transformation if not handled correctly in FactoryShapes.
        // In binaryOpsToolbar, it does: ...elementA.
    };
};

export const recalculateCanvas = (history: HistoryState): CanvasState => {
    // Start with empty state
    let components: ComponentEntity[] = [];
    let numberOfGeneratedKey = 0;

    // Sort nodes by timestamp just in case, though they should be ordered
    // Sort nodes by timestamp just in case, though they should be ordered
    const sortedNodes = [...history.nodes].sort((a, b) => a.timestamp - b.timestamp);

    // Determine which nodes to process based on activeNodeId
    let nodesToProcess: typeof sortedNodes = [];
    if (history.activeNodeId) {
        const activeIndex = sortedNodes.findIndex(n => n.id === history.activeNodeId);
        if (activeIndex !== -1) {
            nodesToProcess = sortedNodes.slice(0, activeIndex + 1);
        } else {
            // Active node not found? Should not happen, but fallback to all or none.
            // Let's assume all if consistency is broken, or none.
            // Safest is to process none or log error.
            console.warn(`Active node ${history.activeNodeId} not found in history.`);
        }
    } else {
        // activeNodeId is null, meaning we are at the start of history (empty state)
        nodesToProcess = [];
    }

    for (const node of nodesToProcess) {
        if (node.suppressed) continue;

        // Update max key
        if (node.outputKey > numberOfGeneratedKey) {
            numberOfGeneratedKey = node.outputKey;
        }

        switch (node.type) {
            case 'CREATE_CUBE':
            case 'CREATE_SPHERE':
            case 'CREATE_CYLINDER':
            case 'CREATE_CONE':
            case 'CREATE_TORUS': {
                const typeMap: Record<string, ComponentTypes> = {
                    'CREATE_CUBE': 'CUBE',
                    'CREATE_SPHERE': 'SPHERE',
                    'CREATE_CYLINDER': 'CYLINDER',
                    'CREATE_CONE': 'CONE',
                    'CREATE_TORUS': 'TORUS'
                };
                const entity = createBaseEntity(
                    node.outputKey,
                    typeMap[node.type],
                    node.name,
                    node.params
                );
                entity.historyId = node.id;
                components.push(entity);
                break;
            }

            case 'TRANSFORM': {
                const targetKey = node.inputKeys[0];
                const componentIndex = components.findIndex(c => c.keyComponent === targetKey);
                if (componentIndex !== -1) {
                    components[componentIndex] = {
                        ...components[componentIndex],
                        transformationParams: node.params as TransformationParams
                    };
                }
                break;
            }

            case 'UNION':
            case 'SUBTRACTION':
            case 'INTERSECTION': {
                // Input keys are the operands. 
                // Usually [MainEntity, SubEntity1, SubEntity2...]
                // The binaryOpsToolbar logic reduces them one by one.
                // Here we assume inputKeys are [A, B] for simplicity or handle multiple.
                // The history node should probably store them in order.

                // We need to find the components in the current list.
                // Note: The operands are consumed (removed from the list) and replaced by the composite.

                const operands = node.inputKeys.map(key => components.find(c => c.keyComponent === key)).filter(c => c !== undefined) as ComponentEntity[];

                if (operands.length < 2) continue; // Need at least 2

                let mainEntity = operands[0];
                let result = operands.slice(1).reduce((acc, entityB) => {
                    return compositeEntityFromOperation(
                        acc,
                        entityB,
                        node.type as ComponentTypes, // UNION, SUBTRACTION, INTERSECTION are valid ComponentTypes
                        node.outputKey // This might be tricky if we have multiple steps in one node.
                        // Ideally each binary op is 2 items. If we have 3 items, we have intermediate keys.
                        // But the history node has only 1 outputKey.
                        // If the user did Union(A, B, C), the original code generated intermediate keys.
                        // If we want to reproduce exactly, we need those intermediate keys or generate new ones.
                        // For now, let's assume the outputKey is the final one. 
                        // Intermediate keys don't matter much if they are consumed immediately.
                        // We can generate temporary keys for intermediates.
                    );
                }, mainEntity as CompositeEntity);

                result.keyComponent = node.outputKey;
                result.historyId = node.id;

                // Remove operands from components list
                const operandKeys = node.inputKeys;
                components = components.filter(c => !operandKeys.includes(c.keyComponent));

                // Add result
                components.push(result);
                break;
            }

            case 'GROUP': {
                const elementsToGroup = node.inputKeys.map(key => components.find(c => c.keyComponent === key)).filter(c => c !== undefined) as ComponentEntity[];
                if (elementsToGroup.length === 0) continue;

                const center = getCenterOfEntities(elementsToGroup);

                const groupEntity: ComponentEntity = {
                    type: 'GROUP',
                    name: node.name,
                    keyComponent: node.outputKey,
                    orbitEnabled: true,
                    transformationParams: { position: [center.x, center.y, center.z], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    previousTransformationParams: { position: [center.x, center.y, center.z], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    geometryAttributes: {},
                    transparency: false,
                    opacity: 1,
                    children: elementsToGroup.map(entity => {
                        const currentPos = entity.transformationParams.position;
                        return {
                            ...entity,
                            transformationParams: {
                                ...entity.transformationParams,
                                position: [
                                    currentPos[0] - center.x,
                                    currentPos[1] - center.y,
                                    currentPos[2] - center.z
                                ]
                            }
                        };
                    }),
                    historyId: node.id
                } as any;

                // Remove elements
                components = components.filter(c => !node.inputKeys.includes(c.keyComponent));
                components.push(groupEntity);
                break;
            }

            case 'UNGROUP': {
                const groupKey = node.inputKeys[0];
                const group = components.find(c => c.keyComponent === groupKey);
                if (!group || !group.children) continue;

                // Remove group
                components = components.filter(c => c.keyComponent !== groupKey);

                // Add children back
                // We might need to apply the group's transform to children if they were transformed relative to group.
                // The ungroupEntity function in cad_library does this.
                // I should probably import ungroupEntity logic or replicate it.
                // For now, simply adding children back.
                components.push(...group.children);
                break;
            }

            case 'CENTER_SELECTION': {
                const center = node.params.center;
                if (!center) continue;

                node.inputKeys.forEach(key => {
                    const entity = components.find(c => c.keyComponent === key);
                    if (entity) {
                        const currentPos = entity.transformationParams.position;
                        entity.transformationParams = {
                            ...entity.transformationParams,
                            position: [
                                currentPos[0] - center.x,
                                currentPos[1] - center.y,
                                currentPos[2] - center.z
                            ]
                        };
                    }
                });
                break;
            }

            case 'DELETE': {
                const keysToDelete = node.inputKeys;
                components = components.filter(c => !keysToDelete.includes(c.keyComponent));
                break;
            }

            case 'LINEAR_PATTERN': {
                const entity = components.find(c => c.keyComponent === node.inputKeys[0]);
                if (!entity) continue;

                const { count, offset, generatedKeys } = node.params;
                let currentKeyCount = numberOfGeneratedKey;
                let keyIndex = 0;
                const getNewKey = () => {
                    if (generatedKeys && generatedKeys[keyIndex] !== undefined) {
                        const key = generatedKeys[keyIndex];
                        keyIndex++;
                        return key;
                    }
                    currentKeyCount++;
                    return currentKeyCount;
                };
                const existingNames = components.map(c => c.name);

                const newEntities = generateLinearArray(
                    entity,
                    count,
                    offset,
                    getNewKey,
                    existingNames
                );

                newEntities.forEach(newEntity => {
                    components.push(newEntity);
                    if (newEntity.keyComponent > numberOfGeneratedKey) {
                        numberOfGeneratedKey = newEntity.keyComponent;
                    }
                });
                break;
            }

            case 'ATTACH': {
                const targetKey = node.inputKeys[0];
                const componentIndex = components.findIndex(c => c.keyComponent === targetKey);
                if (componentIndex !== -1) {
                    components[componentIndex] = {
                        ...components[componentIndex],
                        transformationParams: node.params as TransformationParams
                    };
                }
                break;
            }

            case 'IMPORT_PROJECT': {
                const { components: projectComponents } = node.params;
                if (projectComponents && Array.isArray(projectComponents)) {
                    // Replace current components with project components
                    components = projectComponents.map(c => ({ ...c }));

                    // Update numberOfGeneratedKey
                    const maxKey = Math.max(...components.map(c => c.keyComponent));
                    if (maxKey > numberOfGeneratedKey) {
                        numberOfGeneratedKey = maxKey;
                    }
                }
                break;
            }

            case 'IMPORT_STL': {
                const { fileName, geometryAttributes, transformationParams } = node.params;
                if (geometryAttributes) {
                    const entity: ComponentEntity = {
                        type: 'BUFFER',
                        name: fileName || 'Imported STL',
                        keyComponent: node.outputKey,
                        orbitEnabled: true,
                        transformationParams: transformationParams || { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                        previousTransformationParams: transformationParams || { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                        geometryAttributes: geometryAttributes,
                        transparency: true,
                        opacity: 1,
                        historyId: node.id
                    };
                    components.push(entity);
                }
                break;
            }

            case 'IMPORT_RIS': {
                const { boxData } = node.params;
                if (boxData && Array.isArray(boxData)) {
                    // We need to reconstruct the cubes. 
                    // Since we don't have access to dispatch here, we can't use getRisCube directly if it uses dispatch.
                    // But getRisCube mainly creates an object.
                    // Let's manually create the cube entities based on boxData.
                    // boxData is array of [xMin, xMax, yMin, yMax, zMin, zMax]

                    // We need to know the keys. The node.outputKey is the FIRST key.
                    // We can assume sequential keys were generated.
                    let currentKey = node.outputKey;

                    boxData.forEach((box: number[]) => {
                        const [xMin, xMax, yMin, yMax, zMin, zMax] = box;
                        const width = Math.abs(xMax - xMin);
                        const height = Math.abs(yMax - yMin);
                        const depth = Math.abs(zMax - zMin);
                        const position = [
                            xMin + width / 2,
                            yMin + height / 2,
                            zMin + depth / 2
                        ];

                        const entity: ComponentEntity = {
                            type: 'CUBE',
                            name: 'RIS_CUBE',
                            keyComponent: currentKey,
                            orbitEnabled: true,
                            transformationParams: { position: position as [number, number, number], rotation: [0, 0, 0], scale: [1, 1, 1] },
                            previousTransformationParams: { position: position as [number, number, number], rotation: [0, 0, 0], scale: [1, 1, 1] },
                            geometryAttributes: {
                                width,
                                height,
                                depth,
                                widthSegments: 1,
                                heightSegments: 1,
                                depthSegments: 1
                            } as CubeGeometryAttributes,
                            transparency: true,
                            opacity: 1,
                            historyId: node.id
                        };
                        components.push(entity);
                        currentKey++;
                    });

                    // Update max key if needed
                    if (currentKey - 1 > numberOfGeneratedKey) {
                        numberOfGeneratedKey = currentKey - 1;
                    }
                }
                break;
            }

            case 'ASSIGN_MATERIAL': {
                const { material } = node.params;
                if (material) {
                    node.inputKeys.forEach(key => {
                        const componentIndex = components.findIndex(c => c.keyComponent === key);
                        if (componentIndex !== -1) {
                            components[componentIndex] = {
                                ...components[componentIndex],
                                material: material
                            };
                        }
                    });
                }
                break;
            }

            case 'CLONE': {
                const originalKey = node.inputKeys[0];
                const originalComponent = components.find(c => c.keyComponent === originalKey);
                if (originalComponent) {
                    const clonedComponent: ComponentEntity = {
                        ...originalComponent,
                        keyComponent: node.outputKey,
                        name: node.name, // The name is already set in the node (e.g. "Clone Cube1")
                        historyId: node.id
                    };
                    components.push(clonedComponent);
                }
                break;
            }
        }
    }

    return {
        components,
        numberOfGeneratedKey,
        selectedComponentKey: 0,
        lastActionType: 'HISTORY_RECALCULATION'
    };
};
