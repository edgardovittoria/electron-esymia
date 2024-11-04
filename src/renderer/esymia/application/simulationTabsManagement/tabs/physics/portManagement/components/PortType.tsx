import React from "react";
import { Port, TempLumped } from '../../../../../../model/esymiaModels';
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
		<div className={`p-[10px] text-center border-[1px] mt-2 ${theme === 'light' ? 'border-secondaryColor bg-[#f6f6f6]' : 'border-secondaryColorDark bg-bgColorDark'}`}>
			<div className="w-100 xl:text-start text-center mb-2">
				<h6 className="text-[12px] xl:text-base">Port Type</h6>
			</div>
			<button
				disabled={disabled}
				className={`${disabled && 'opacity-40'} button buttonPrimary ${theme === 'light' ? '' : 'bg-secondaryColorDark'} mb-2 w-100 xl:text-base text-[12px]`}
				onClick={() => setShow(true)}>
				Choose the port type
			</button>
			{selectedPort.type === 1 && (
				<img className="m-auto" src={theme === 'light' ? portType1 : portType1Dark} alt="port type 1" />
			)}
			{selectedPort.type === 2 && (
				<img className="m-auto" src={theme === 'light' ? portType2 : portType2Dark} alt="port type 2" />
			)}
			{selectedPort.type === 3 && (
				<img className="m-auto" src={theme === 'light' ? portType3 : portType3Dark} alt="port type 3" />
			)}
			{selectedPort.type === 4 && (
				<img className="m-auto" src={theme === 'light' ? portType4 : portType4Dark} alt="port type 4" />
			)}
			{selectedPort.type === 5 && (
				<img className="m-auto" src={theme === 'light' ? portType5 : portType5Dark} alt="port type 5" />
			)}
		</div>
	);
};
