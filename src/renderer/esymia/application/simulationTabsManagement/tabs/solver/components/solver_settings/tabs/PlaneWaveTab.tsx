import React, { Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../../../store/tabsAndMenuItemsSlice';
import { InputGraphData } from '../../ShowInputGraphModal';
import { PlaneWaveSettings } from '../../planeWave/PlaneWaveSettings';

type SetGraphData = Dispatch<SetStateAction<InputGraphData | undefined>>;

interface PlaneWaveTabProps {
    setGraphData: SetGraphData;
}

export const PlaneWaveTab: React.FC<PlaneWaveTabProps> = ({
    setGraphData,
}) => {
    const theme = useSelector(ThemeSelector);
    return (
        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <PlaneWaveSettings setGraphData={setGraphData} />
        </div>
    );
};
