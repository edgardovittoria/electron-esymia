import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    historyNodesSelector,
    activeNodeIdSelector,
    setActiveNode,
    rebuildHistory,
    HistoryNode,
    undo,
    redo,
    resetHistory
} from '../../store/historySlice';
import { resetState } from '../../../cad_library';
import { ThemeSelector } from '../../../esymia/store/tabsAndMenuItemsSlice';
import { TbCube, TbSphere, TbCylinder, TbCone, TbCircleDotted, TbTransform, TbLayersUnion, TbLayersSubtract, TbLayersIntersect, TbArrowBackUp, TbArrowForwardUp, TbTrash, TbGridDots, TbMagnet, TbFileImport, TbFolderOpen, TbPalette, TbCopy } from 'react-icons/tb';
import noHistoryIcon from '../../../../../assets/noHystory.png';

export const HistoryTree: React.FC = () => {
    const dispatch = useDispatch();
    const nodes = useSelector(historyNodesSelector);
    const activeNodeId = useSelector(activeNodeIdSelector);
    const theme = useSelector(ThemeSelector);

    const handleNodeClick = (nodeId: string) => {
        dispatch(setActiveNode(nodeId));
        // @ts-ignore
        dispatch(rebuildHistory());
    };

    const handleUndo = () => {
        dispatch(undo());
        // @ts-ignore
        dispatch(rebuildHistory());
    };

    const handleRedo = () => {
        dispatch(redo());
        // @ts-ignore
        dispatch(rebuildHistory());
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'CREATE_CUBE': return <TbCube />;
            case 'CREATE_SPHERE': return <TbSphere />;
            case 'CREATE_CYLINDER': return <TbCylinder />;
            case 'CREATE_CONE': return <TbCone />;
            case 'CREATE_TORUS': return <TbCircleDotted />;
            case 'TRANSFORM': return <TbTransform />;
            case 'UNION': return <TbLayersUnion />;
            case 'SUBTRACTION': return <TbLayersSubtract />;
            case 'INTERSECTION': return <TbLayersIntersect />;
            case 'GROUP': return <TbLayersUnion />; // Or specific icon
            case 'UNGROUP': return <TbLayersSubtract />; // Or specific icon
            case 'CENTER_SELECTION': return <TbTransform />;
            case 'DELETE': return <TbTrash />;
            case 'LINEAR_PATTERN': return <TbGridDots />;
            case 'ATTACH': return <TbMagnet />;
            case 'IMPORT_STL': return <TbFileImport />;
            case 'IMPORT_PROJECT': return <TbFolderOpen />;
            case 'IMPORT_RIS': return <TbFileImport />;
            case 'ASSIGN_MATERIAL': return <TbPalette />;
            case 'CLONE': return <TbCopy />;
            default: return null;
        }
    };

    const canUndo = activeNodeId !== null;
    const canRedo = nodes.length > 0 && (activeNodeId === null ? nodes.length > 0 : nodes.findIndex(n => n.id === activeNodeId) < nodes.length - 1);

    return (
        <div className="flex flex-col w-full h-full gap-2 overflow-y-auto pl-2">
            {nodes.length > 0 ? (
                <>
                    <div className="flex items-center justify-between mb-2 pr-2">
                        <div className="flex gap-1 items-center">
                            <button
                                onClick={handleUndo}
                                disabled={!canUndo}
                                className={`p-1 rounded ${!canUndo ? 'opacity-30 cursor-not-allowed' : `hover:bg-gray-200 dark:hover:bg-white/10 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}`}
                                title="Undo"
                            >
                                <TbArrowBackUp size={18} />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={!canRedo}
                                className={`p-1 rounded ${!canRedo ? 'opacity-30 cursor-not-allowed' : `hover:bg-gray-200 dark:hover:bg-white/10 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}`}
                                title="Redo"
                            >
                                <TbArrowForwardUp size={18} />
                            </button>
                            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear all history and the scene?')) {
                                        dispatch(resetState());
                                        dispatch(resetHistory());
                                    }
                                }}
                                className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500`}
                                title="Clear All"
                            >
                                <TbTrash size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col relative">
                        {/* Vertical line */}
                        <div className={`absolute left-[11px] top-2 bottom-2 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} style={{ zIndex: 0 }}></div>

                        {[...nodes].reverse().map((node, index) => {
                            const isActive = activeNodeId === node.id;
                            // Determine if node is "future" (after active node)
                            // We need to find the index in the ORIGINAL nodes array, not the reversed one
                            const activeIndex = nodes.findIndex(n => n.id === activeNodeId);
                            const originalIndex = nodes.findIndex(n => n.id === node.id);
                            const isFuture = activeIndex !== -1 && originalIndex > activeIndex;

                            return (
                                <div key={node.id} className="relative flex items-center group">
                                    {/* Node marker on the line */}
                                    <div
                                        className={`absolute left-[7px] z-10 w-[9px] h-[9px] rounded-full border-2 
                                            ${isActive
                                                ? (theme === 'light' ? 'bg-blue-500 border-blue-500' : 'bg-blue-500 border-blue-500')
                                                : (isFuture
                                                    ? (theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-600')
                                                    : (theme === 'light' ? 'bg-gray-200 border-gray-400' : 'bg-gray-700 border-gray-500')
                                                )
                                            }
                                        `}
                                    ></div>

                                    <div
                                        className={`ml-6 flex-1 flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all my-0.5
                                            ${isActive ? (theme === 'light' ? 'bg-blue-50/80 border border-blue-200' : 'bg-blue-900/20 border border-blue-800/50') : 'border border-transparent'}
                                            ${isFuture ? 'opacity-50 grayscale' : ''}
                                            ${!isActive && (theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5')}
                                        `}
                                        onClick={() => handleNodeClick(node.id)}
                                    >
                                        <span className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                            {getIcon(node.type)}
                                        </span>
                                        <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} ${isActive ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                                            {node.name}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <img src={noHistoryIcon} alt="No history" />
                </div>
            )}
        </div>
    );
};
