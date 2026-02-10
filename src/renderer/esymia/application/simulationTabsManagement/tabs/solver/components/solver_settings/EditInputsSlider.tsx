import React from 'react';
import { FaLock, FaLockOpen } from 'react-icons/fa6';

interface EditInputsSliderProps {
    isUnlocked: boolean;
    toggleSlider: () => void;
}

export const EditInputsSlider: React.FC<EditInputsSliderProps> = ({
    isUnlocked,
    toggleSlider,
}) => {
    return (
        <div className="inline-flex items-center h-10">
            <span className="text-sm xl:text-base mr-2">Edit Inputs</span>
            <div
                className="relative cursor-pointer"
                onClick={toggleSlider}
                role="switch"
                aria-checked={isUnlocked}
                aria-label="Toggle edit inputs"
            >
                <div className="w-14 h-6 bg-gray-300 rounded-full"></div>
                <span
                    className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 transform ${isUnlocked ? 'translate-x-8' : 'translate-x-0'
                        }`}
                ></span>
            </div>
            <span className="ml-2">
                {isUnlocked ? (
                    <FaLockOpen
                        size={20}
                        className="text-red-600"
                        aria-label="Unlocked"
                    />
                ) : (
                    <FaLock size={20} className="text-green-600" aria-label="Locked" />
                )}
            </span>
        </div>
    );
};
