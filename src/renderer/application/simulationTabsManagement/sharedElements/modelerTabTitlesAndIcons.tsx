import { GiAtom, GiAtomicSlashes, GiCubeforce } from 'react-icons/gi';
import { AiOutlineBarChart } from 'react-icons/ai';
import { SiAzurefunctions } from 'react-icons/si';

const modelerTabTitle = <div className='flex items-center'>
  <div className='w-[25%]'><GiCubeforce color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
  <div className='w-[65%]'>Modeler</div>
</div>;


const materialTabTitle = <div className='flex items-center'>
  <div className='w-[25%]'><GiAtomicSlashes color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
  <div className='w-[65%]'>Materials</div>
</div>;

const physicsTabTitle = <div className='flex items-center'>
  <div className='w-[25%]'><GiAtom color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
  <div className='w-[65%]'>Physics</div>
</div>;

const simulatorTabTitle = <div className='flex items-center'>
  <div className='w-[25%]'><GiAtomicSlashes color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
  <div className='w-[65%]'>Materials</div>
</div>;

const resultsTabTitle = <div className='flex items-center'>
  <div className='w-[25%]'><AiOutlineBarChart color={'#00ae52'} style={{ width: '25px', height: '25px' }} /></div>
  <div className='w-[65%]'>Results</div>
</div>;

const portsTabTitle = <div className='flex items-center gap-2'>
  <GiAtom color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  <div>Ports</div>
</div>;

const signalsTabTitle = <div className='flex items-center gap-2'>
  <SiAzurefunctions color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  <div>Signals</div>
</div>;

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
    key: 'Ports',
    object: portsTabTitle,
    icon: <GiAtom color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  },
  {
    key: 'Signals',
    object: signalsTabTitle,
    icon: <SiAzurefunctions color={'#00ae52'} style={{ width: '25px', height: '25px' }} />
  }

];
