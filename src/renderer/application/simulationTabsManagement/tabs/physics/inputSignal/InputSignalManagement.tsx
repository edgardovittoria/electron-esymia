import React, { ReactNode } from 'react';

interface InputSignalManagementProps {
    children: ReactNode
}

export const InputSignalManagement: React.FC<InputSignalManagementProps> = (
    {
        children
    }
) => {
    return(
        <>
            < div className="flex-col p-[20px] overflow-y-scroll overflow-x-hidden">
                {children}
            </div>
        </>
    )

}
