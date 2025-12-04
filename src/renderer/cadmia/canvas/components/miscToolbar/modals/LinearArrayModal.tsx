import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../esymia/store/tabsAndMenuItemsSlice';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { generateLinearArray } from '../../../../../cad_library/components/auxiliaryFunctionsUsingThree/patterningUtilities';
import { multipleSelectionEntitiesKeysSelector } from '../miscToolbarSlice';
import { addNode } from '../../../../store/historySlice';
import uniqid from 'uniqid';
import { ComponentEntity } from '../../../../../cad_library';
import { selectedComponentSelector, componentseSelector, numberOfGeneratedKeySelector, addComponent, incrementNumberOfGeneratedKey } from '../../../../../cad_library/components/store/canvas/canvasSlice';

interface LinearArrayModalProps {
    isOpen: boolean;
    onClose: () => void;
}


// Modal for creating a linear array of objects
export const LinearArrayModal: React.FC<LinearArrayModalProps> = ({ isOpen, onClose }) => {
    const theme = useSelector(ThemeSelector);
    const dispatch = useDispatch();
    const selectedComponent = useSelector(selectedComponentSelector);
    const components = useSelector(componentseSelector);
    const multipleSelectionKeys = useSelector(multipleSelectionEntitiesKeysSelector);
    const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector) as number;

    const [count, setCount] = useState(2);
    const [offsetX, setOffsetX] = useState(10);
    const [offsetY, setOffsetY] = useState(0);
    const [offsetZ, setOffsetZ] = useState(0);

    const handleApply = () => {
        let entitiesToPattern: ComponentEntity[] = [];

        if (multipleSelectionKeys.length > 0) {
            entitiesToPattern = components.filter(c => multipleSelectionKeys.includes(c.keyComponent));
        } else if (selectedComponent) {
            entitiesToPattern = [selectedComponent as ComponentEntity];
        }

        if (entitiesToPattern.length === 0) return;

        let currentKeyCount = numberOfGeneratedKey;
        const getNewKey = () => {
            currentKeyCount++;
            return currentKeyCount;
        };

        const existingNames = components.map(c => c.name);
        let totalNewKeys = 0;

        entitiesToPattern.forEach(entity => {
            const newEntities = generateLinearArray(
                entity,
                count,
                [offsetX, offsetY, offsetZ],
                getNewKey,
                existingNames
            );

            const generatedKeys: number[] = [];
            newEntities.forEach(newEntity => {
                existingNames.push(newEntity.name); // Add new names to the list to avoid collisions within the same batch
                dispatch(addComponent(newEntity));
                generatedKeys.push(newEntity.keyComponent);
                totalNewKeys++;
            });

            dispatch(addNode({
                id: uniqid(),
                name: `Linear Pattern (${entity.name})`,
                type: 'LINEAR_PATTERN',
                params: {
                    count,
                    offset: [offsetX, offsetY, offsetZ]
                },
                timestamp: Date.now(),
                outputKey: 0, // Multiple outputs, handled by re-execution or params
                inputKeys: [entity.keyComponent, ...generatedKeys], // Input is original, outputs are generated
                suppressed: false
            }));
        });

        dispatch(incrementNumberOfGeneratedKey(totalNewKeys));
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                                        Linear Array
                                    </Dialog.Title>
                                    <IoCloseCircleOutline
                                        size={24}
                                        className="cursor-pointer hover:opacity-70"
                                        onClick={onClose}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Count (Copies)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={count}
                                            onChange={(e) => setCount(parseInt(e.target.value))}
                                            className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Offset X</label>
                                            <input
                                                type="number"
                                                value={offsetX}
                                                onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                                                className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Offset Y</label>
                                            <input
                                                type="number"
                                                value={offsetY}
                                                onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                                                className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Offset Z</label>
                                            <input
                                                type="number"
                                                value={offsetZ}
                                                onChange={(e) => setOffsetZ(parseFloat(e.target.value))}
                                                className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleApply}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
