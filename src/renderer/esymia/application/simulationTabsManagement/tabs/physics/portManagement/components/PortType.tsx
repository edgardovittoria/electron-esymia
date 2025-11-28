import React from "react";
import { TempLumped } from '../../../../../../model/esymiaModels';
import portType1 from '../../../../../../../../../assets/portType1.png';
import portType2 from '../../../../../../../../../assets/portType2.png';
import portType3 from '../../../../../../../../../assets/portType3.png';
import portType4 from '../../../../../../../../../assets/portType4.png';
import portType5 from '../../../../../../../../../assets/portType5.png';
import portType1Dark from '../../../../../../../../../assets/portType1Dark.png';
import portType2Dark from '../../../../../../../../../assets/portType2Dark.png';
import portType3Dark from '../../../../../../../../../assets/portType3Dark.png';
import portType4Dark from '../../../../../../../../../assets/portType4Dark.png';
import portType5Dark from '../../../../../../../../../assets/portType5Dark.png';
import { useSelector } from "react-redux";
import { ThemeSelector } from "../../../../../../store/tabsAndMenuItemsSlice";

interface PortTypeProps {
	setShow: Function;
	selectedPort: TempLumped;
	disabled: boolean;
}

export const PortType: React.FC<PortTypeProps> = ({
	setShow,
	selectedPort,
	disabled,
}) => {
	const theme = useSelector(ThemeSelector)
	return (
		<div className={`mt-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
			<div className="flex flex-col gap-4">
				<div className="flex flex-row justify-between items-center">
					<h6 className={`text-sm font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Port Type</h6>
					<button
						disabled={disabled}
						className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${theme === 'light'
								? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
								: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
							} disabled:opacity-50 disabled:cursor-not-allowed`}
						onClick={() => setShow(true)}>
						Choose Type
					</button>
				</div>

				<div className={`p-4 rounded-xl flex justify-center items-center ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/20 border border-white/10'
					}`}>
					{selectedPort.type === 1 && (
						<img className="max-h-[150px] object-contain" src={theme === 'light' ? portType1 : portType1Dark} alt="port type 1" />
					)}
					{selectedPort.type === 2 && (
						<img className="max-h-[150px] object-contain" src={theme === 'light' ? portType2 : portType2Dark} alt="port type 2" />
					)}
					{selectedPort.type === 3 && (
						<img className="max-h-[150px] object-contain" src={theme === 'light' ? portType3 : portType3Dark} alt="port type 3" />
					)}
					{selectedPort.type === 4 && (
						<img className="max-h-[150px] object-contain" src={theme === 'light' ? portType4 : portType4Dark} alt="port type 4" />
					)}
					{selectedPort.type === 5 && (
						<img className="max-h-[150px] object-contain" src={theme === 'light' ? portType5 : portType5Dark} alt="port type 5" />
					)}
				</div>
			</div>
		</div>
	);
};
