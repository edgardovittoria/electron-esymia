import React from 'react';
import { SolverParameters } from '../SolverParameters';
import { ACAPortSelection } from '../ACAPortSelection';

interface SolverSetupTabProps {
    simulationType: 'Matrix' | 'Matrix_ACA' | 'Electric Fields';
}

export const SolverSetupTab: React.FC<SolverSetupTabProps> = ({
    simulationType,
}) => {
    return (
        <div className="flex flex-col gap-2">
            <SolverParameters />
            {simulationType === 'Matrix_ACA' && <ACAPortSelection />}
        </div>
    );
};
