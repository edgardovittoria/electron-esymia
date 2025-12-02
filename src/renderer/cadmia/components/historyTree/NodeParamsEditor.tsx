import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateNodeParams, rebuildHistory, HistoryNode } from '../../store/historySlice';
import { ThemeSelector } from '../../../esymia/store/tabsAndMenuItemsSlice';
import { useSelector } from 'react-redux';

interface NodeParamsEditorProps {
    node: HistoryNode;
}

export const NodeParamsEditor: React.FC<NodeParamsEditorProps> = ({ node }) => {
    const dispatch = useDispatch();
    const theme = useSelector(ThemeSelector);
    const [params, setParams] = useState(node.params);

    useEffect(() => {
        setParams(node.params);
    }, [node]);

    const handleChange = (key: string, value: number) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        dispatch(updateNodeParams({ id: node.id, params: newParams }));
        // @ts-ignore
        dispatch(rebuildHistory());
    };

    const handleTransformChange = (type: 'position' | 'rotation' | 'scale', axis: number, value: number) => {
        const currentVector = params[type] as [number, number, number] || [0, 0, 0];
        const newVector = [...currentVector];
        newVector[axis] = value;

        const newParams = { ...params, [type]: newVector };
        setParams(newParams);
        dispatch(updateNodeParams({ id: node.id, params: newParams }));
        // @ts-ignore
        dispatch(rebuildHistory());
    };

    if (!params) return null;

    const renderInput = (label: string, value: number, onChange: (val: number) => void) => (
        <div className="flex items-center justify-between gap-2 mb-1">
            <label className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{label}</label>
            <input
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className={`w-20 px-1 py-0.5 text-xs rounded border ${theme === 'light' ? 'bg-white border-gray-300 text-gray-800' : 'bg-black/20 border-white/10 text-gray-200'}`}
            />
        </div>
    );

    if (node.type === 'TRANSFORM') {
        return (
            <div className={`p-2 mt-2 rounded border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
                <h4 className={`text-xs font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Transformation</h4>
                {['position', 'rotation', 'scale'].map(type => (
                    <div key={type} className="mb-2">
                        <div className={`text-xs font-semibold capitalize mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{type}</div>
                        <div className="flex gap-1">
                            {renderInput('X', (params[type] as number[])[0], (v) => handleTransformChange(type as any, 0, v))}
                            {renderInput('Y', (params[type] as number[])[1], (v) => handleTransformChange(type as any, 1, v))}
                            {renderInput('Z', (params[type] as number[])[2], (v) => handleTransformChange(type as any, 2, v))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Basic Shapes
    return (
        <div className={`p-2 mt-2 rounded border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <h4 className={`text-xs font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Parameters</h4>
            {Object.keys(params).map(key => {
                if (typeof params[key] === 'number') {
                    return (
                        <div key={key}>
                            {renderInput(key, params[key], (v) => handleChange(key, v))}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};
