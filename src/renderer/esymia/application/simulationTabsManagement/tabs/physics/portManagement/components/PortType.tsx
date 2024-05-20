import React from "react";
import { Port, TempLumped } from '../../../../../../model/esymiaModels';
import portType1 from '../../../../../../../../../assets/portType1.png';
import portType2 from '../../../../../../../../../assets/portType2.png';
import portType3 from '../../../../../../../../../assets/portType3.png';
import portType4 from '../../../../../../../../../assets/portType4.png';
import portType5 from '../../../../../../../../../assets/portType5.png';

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
	return (
		<div className="p-[10px] text-center border-[1px] border-secondaryColor bg-[#f6f6f6]">
			<div className="w-100 xl:text-start text-center mb-2">
				<h6 className="text-[12px] xl:text-base">Port Type</h6>
			</div>
			<button
				disabled={disabled}
				className={`${disabled && 'opacity-40'} button buttonPrimary mb-2 w-100 xl:text-base text-[12px]`}
				onClick={() => setShow(true)}>
				Choose the port type
			</button>
			{selectedPort.type === 1 && (
				<img className="m-auto" src={portType1} alt="port type 1" />
			)}
			{selectedPort.type === 2 && (
				<img className="m-auto" src={portType2} alt="port type 2" />
			)}
			{selectedPort.type === 3 && (
				<img className="m-auto" src={portType3} alt="port type 3" />
			)}
			{selectedPort.type === 4 && (
				<img className="m-auto" src={portType4} alt="port type 4" />
			)}
			{selectedPort.type === 5 && (
				<img className="m-auto" src={portType5} alt="port type 5" />
			)}
		</div>
	);
};
