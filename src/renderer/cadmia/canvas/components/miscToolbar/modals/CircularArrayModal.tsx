import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../esymia/store/tabsAndMenuItemsSlice';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { addComponent, ComponentEntity, numberOfGeneratedKeySelector, selectedComponentSelector } from '../../../../../cad_library';
import { generateCircularArray } from '../../../../../cad_library/components/auxiliaryFunctionsUsingThree/patterningUtilities';

interface CircularArrayModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CircularArrayModal: React.FC<CircularArrayModalProps> = ({ isOpen, onClose }) => {
    const theme = useSelector(ThemeSelector);
    const dispatch = useDispatch();
    const selectedComponent = useSelector(selectedComponentSelector);
    const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector) as number;

    const [count, setCount] = useState(4);
    const [angle, setAngle] = useState(360);
    const [axis, setAxis] = useState<'X' | 'Y' | 'Z'>('Z');
    const [centerX, setCenterX] = useState(0);
    const [centerY, setCenterY] = useState(0);
    const [centerZ, setCenterZ] = useState(0);

    const handleApply = () => {
        if (!selectedComponent) return;

        const newEntities = generateCircularArray(
            selectedComponent as ComponentEntity,
            count,
            [centerX, centerY, centerZ],
            axis,
            angle,
            () => 0 // Placeholder
        );

        let keyCounter = numberOfGeneratedKey;
        newEntities.forEach(entity => {
            keyCounter++;
            entity.keyComponent = keyCounter;
            dispatch(addComponent(entity));
        });

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
                                        Circular Array
                                    </Dialog.Title>
                                    <IoCloseCircleOutline
                                        size={24}
                                        className="cursor-pointer hover:opacity-70"
                                        onClick={onClose}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Count</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={count}
                                                onChange={(e) => setCount(parseInt(e.target.value))}
                                                className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Total Angle (°)</label>
                                            <input
                                                type="number"
                                                value={angle}
                                                onChange={(e) => setAngle(parseFloat(e.target.value))}
                                                className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Axis of Rotation</label>
                                        <div className="flex gap-4">
                                            {['X', 'Y', 'Z'].map((ax) => (
                                                <label key={ax} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="axis"
                                                        checked={axis === ax}
                                                        onChange={() => setAxis(ax as 'X' | 'Y' | 'Z')}
                                                    />
                                                    {ax}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Center X</label>
                                            <input
                                                type="number"
                                                value={centerX}
                                                onChange={(e) => setCenterX(parseFloat(e.target.value))}
                                                className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Center Y</label>
                                            <input
                                                type="number"
                                                value={centerY}
                                                onChange={(e) => setCenterY(parseFloat(e.target.value))}
                                                className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Center Z</label>
                                            <input
                                                type="number"
                                                value={centerZ}
                                                onChange={(e) => setCenterZ(parseFloat(e.target.value))}
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
