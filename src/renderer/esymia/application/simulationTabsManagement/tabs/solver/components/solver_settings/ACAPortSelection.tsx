import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';
import { selectedProjectSelector, setAcaSelectedPorts } from '../../../../../../store/projectSlice';

export const ACAPortSelection: React.FC = () => {
    const theme = useSelector(ThemeSelector);
    const selectedProject = useSelector(selectedProjectSelector);
    const dispatch = useDispatch();

    // Get all ports (excluding lumped elements)
    const availablePorts = selectedProject?.ports.filter(p => p.category === 'port') || [];

    // Initialize with saved ports or first port selected by default
    const [selectedPortIndices, setSelectedPortIndices] = useState<number[]>(() => {
        if (selectedProject?.acaSelectedPorts && selectedProject?.acaSelectedPorts.length > 0) {
            return selectedProject?.acaSelectedPorts;
        }
        return availablePorts.length > 0 ? [0] : [];
    });

    // Update selection when ports change
    useEffect(() => {
        if (availablePorts.length > 0 && selectedPortIndices.length === 0) {
            setSelectedPortIndices([0]);
        }
    }, [availablePorts.length]);

    // Save selected ports to simulation state whenever they change
    useEffect(() => {
        if (selectedProject && selectedPortIndices.length > 0) {
            dispatch(setAcaSelectedPorts(selectedPortIndices));
        }
    }, [selectedPortIndices, dispatch, selectedProject]);

    const togglePortSelection = (index: number) => {
        setSelectedPortIndices(prev => {
            if (prev.includes(index)) {
                // Don't allow deselecting if it's the last one
                if (prev.length === 1) return prev;
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index].sort((a, b) => a - b);
            }
        });
    };

    const getSelectedPortsLabel = () => {
        if (selectedPortIndices.length === 0) return 'Select ports...';
        if (selectedPortIndices.length === availablePorts.length) return 'All ports';
        return selectedPortIndices.map(i => availablePorts[i]?.name).join(', ');
    };

    return (
        <div className={`p-4 mt-3 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <div className="p-2">
                <h6 className="text-sm font-medium mb-3 opacity-80">ACA Ports to Observe</h6>
                <p className="text-xs opacity-60 mb-3">Select which ports to compute during ACA simulation</p>

                <div className="dropdown dropdown-bottom w-full">
                    <label
                        tabIndex={0}
                        className={`flex items-center justify-between px-4 py-2.5 w-full text-sm rounded-lg border cursor-pointer transition-all ${theme === 'light'
                            ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-500'
                            : 'bg-black/40 text-gray-200 border-white/10 hover:border-blue-500'
                            } ${selectedProject?.simulation?.status === 'Completed' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                        <span className="truncate">{getSelectedPortsLabel()}</span>
                        <span className="text-xs opacity-50 ml-2">▼</span>
                    </label>
                    <ul
                        tabIndex={0}
                        className={`dropdown-content mt-2 p-2 shadow-xl rounded-xl w-full max-h-[300px] overflow-y-auto custom-scrollbar backdrop-blur-md border z-50 ${theme === 'light'
                            ? 'bg-white/95 text-gray-700 border-gray-100'
                            : 'bg-black/80 text-gray-200 border-white/10'
                            }`}
                    >
                        {availablePorts.length === 0 ? (
                            <li className="p-3 text-center text-sm opacity-60">No ports available</li>
                        ) : (
                            availablePorts.map((port, index) => {
                                const isSelected = selectedPortIndices.includes(index);
                                return (
                                    <li
                                        key={index}
                                        className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                                            }`}
                                        onClick={() => togglePortSelection(index)}
                                    >
                                        <span className="text-sm font-medium">{port.name}</span>
                                        <input
                                            type="checkbox"
                                            className={`checkbox checkbox-xs rounded ${theme === 'light'
                                                ? 'checkbox-primary'
                                                : 'checkbox-primary border-white/30'
                                                }`}
                                            checked={isSelected}
                                            onChange={() => togglePortSelection(index)} // Handled by li onClick
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>

                <div className="mt-3 text-xs opacity-60">
                    <span className="font-semibold">{selectedPortIndices.length}</span> port{selectedPortIndices.length !== 1 ? 's' : ''} selected
                </div>
            </div>
        </div>
    );
};
