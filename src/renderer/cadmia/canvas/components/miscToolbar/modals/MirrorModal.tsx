import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../esymia/store/tabsAndMenuItemsSlice';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { addComponent, ComponentEntity, numberOfGeneratedKeySelector, selectedComponentSelector } from '../../../../../cad_library';
import { generateMirror } from '../../../../../cad_library/components/auxiliaryFunctionsUsingThree/patterningUtilities';

interface MirrorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MirrorModal: React.FC<MirrorModalProps> = ({ isOpen, onClose }) => {
    const theme = useSelector(ThemeSelector);
    const dispatch = useDispatch();
    const selectedComponent = useSelector(selectedComponentSelector);
    const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector) as number;

    const [plane, setPlane] = useState<'XY' | 'YZ' | 'XZ'>('XY');
    // For now, we only support standard planes passing through origin or offset?
    // Let's add a simple offset.
    const [offset, setOffset] = useState(0);

    const handleApply = () => {
        if (!selectedComponent) return;

        let normal: [number, number, number] = [0, 0, 1]; // Default XY plane (normal Z)
        if (plane === 'YZ') normal = [1, 0, 0]; // Normal X
        if (plane === 'XZ') normal = [0, 1, 0]; // Normal Y

        const newEntity = generateMirror(
            selectedComponent as ComponentEntity,
            normal,
            offset,
            () => numberOfGeneratedKey + 1
        );

        dispatch(addComponent(newEntity));
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
                                        Mirror
                                    </Dialog.Title>
                                    <IoCloseCircleOutline
                                        size={24}
                                        className="cursor-pointer hover:opacity-70"
                                        onClick={onClose}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Mirror Plane</label>
                                        <div className="flex gap-4">
                                            {['XY', 'YZ', 'XZ'].map((p) => (
                                                <label key={p} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="plane"
                                                        checked={plane === p}
                                                        onChange={() => setPlane(p as 'XY' | 'YZ' | 'XZ')}
                                                    />
                                                    {p}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Plane Offset</label>
                                        <input
                                            type="number"
                                            value={offset}
                                            onChange={(e) => setOffset(parseFloat(e.target.value))}
                                            className={`w-full border rounded-lg px-3 py-2 ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-700 border-gray-600'}`}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Distance from origin along the normal axis.</p>
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
