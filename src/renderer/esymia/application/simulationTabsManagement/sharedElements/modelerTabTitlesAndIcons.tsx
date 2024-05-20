import { GiAtom, GiAtomicSlashes, GiCubeforce } from 'react-icons/gi';
import { AiOutlineBarChart } from 'react-icons/ai';
import { SiAzurefunctions } from 'react-icons/si';
import {
  modelerLeftPanelTitle,
  physicsLeftPanelTitle, physicsRightPanelTitle,
  resultsLeftPanelTitle,
  simulatorLeftPanelTitle
} from '../../config/panelTitles';
import React, { ReactNode } from 'react';

const TitleContainer:React.FC<{children: ReactNode}> = ({ children }) => <div className='flex items-center gap-2'>{children}</div>

const modelerTabTitle =
  <TitleContainer>
    <div><GiCubeforce color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
    <div>{modelerLeftPanelTitle.first}</div>
  </TitleContainer>



const materialTabTitle = <TitleContainer>
  <div><GiAtomicSlashes color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
  <div>{modelerLeftPanelTitle.second}</div>
</TitleContainer>;

const physicsTabTitle = <TitleContainer>
  <div className="flex flex-row items-center gap-2">
    <div><GiAtom color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
    <div>{physicsLeftPanelTitle.first}</div>
  </div>
</TitleContainer>;

const simulatorTabTitle = <TitleContainer>
  <div><GiAtomicSlashes color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
  <div>{simulatorLeftPanelTitle.second}</div>
</TitleContainer>;

const resultsTabTitle = <TitleContainer>
  <div><AiOutlineBarChart color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
  <div>{resultsLeftPanelTitle.first}</div>
</TitleContainer>;

const portsTabTitle = <TitleContainer>
  <GiAtom color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  <div>{physicsRightPanelTitle.first}</div>
</TitleContainer>;

const signalsTabTitle = <TitleContainer>
  <SiAzurefunctions color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  <div>{physicsRightPanelTitle.second}</div>
</TitleContainer>;

export const tabTitles = [
  {
    key: 'Modeler',
    object: modelerTabTitle,
    icon: <GiCubeforce color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  },
  {
    key: 'Materials',
    object: materialTabTitle,
    icon: <GiAtomicSlashes color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  },
  {
    key: 'Physics',
    object: physicsTabTitle,
    icon: <GiAtom color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  },
  {
    key: 'Simulator',
    object: simulatorTabTitle,
    icon: <GiAtomicSlashes color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  },
  {
    key: 'Results',
    object: resultsTabTitle,
    icon: <AiOutlineBarChart color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  },
  {
    key: 'Terminations',
    object: portsTabTitle,
    icon: <GiAtom color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  },
  {
    key: 'Frequencies',
    object: signalsTabTitle,
    icon: <SiAzurefunctions color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  }

];
