import React from 'react';
import { IoMdLogIn } from 'react-icons/io';
import { useAuth0 } from '@auth0/auth0-react';
import cadmiaImage from '../../../assets/cadmia.png';


export interface HomeProps {
  setSelectedTab: (v: string) => void
}

const Home: React.FC<HomeProps> = ({setSelectedTab}) => {
  const { loginWithPopup, user } = useAuth0();
  return (
    <div className="flex flex-row">
      <div className='w-full h-[97vh]'>
        {user ?
          <>
            <div className='w-full h-full flex flex-col gap-4 justify-center items-center'>
              <div className='w-4/5 flex flex-row items-center gap-20'>
                <div className='flex flex-col w-full items-center gap-4'>
                  <h5>CADmIA</h5>
                  <div className='rounded-xl shadow-xl p-1 cadmia w-full h-[400px] border border-black hover:scale-105 transition'
                       onClick={() => setSelectedTab('cadmia')}
                  />
                </div>
                <div className='flex flex-col w-full items-center gap-4'>
                  <h5>ESymIA</h5>
                  <div className='rounded-xl shadow-xl esymia w-full h-[400px] border border-black hover:scale-105 transition'
                       onClick={() => setSelectedTab('esymia')}
                  />
                </div>
              </div>
            </div>
          </>
          :
          <div className='w-full h-full relative flex flex-col gap-4 justify-center items-center'>
            <div className='w-4/5 flex flex-row items-center gap-10'>
              <div className='flex flex-col w-full items-center gap-4'>
                <h5>CADmIA</h5>
                <div className='rounded-xl shadow-xl p-1 cadmia w-full h-[400px] border border-black hover:scale-105 transition'/>
              </div>
              <div className='flex flex-col w-full items-center gap-4'>
                <h5>ESymIA</h5>
                <div className='rounded-xl shadow-xl esymia w-full h-[400px] border border-black hover:scale-105 transition'/>
              </div>
            </div>
            <div className='flex flex-col w-full items-center gap-4 absolute bottom-10'>
              <span className="font-semibold text-xl">Log in/Sign in to use applications</span>
              <div
                className='flex flex-col gap-5 w-1/5 items-center px-10 py-2 border border-black rounded-xl hover:bg-white hover:text-black hover:cursor-pointer'
                onClick={() => loginWithPopup()}
              >
                <div className='flex flex-row justify-between items-center gap-2'>
                  <IoMdLogIn size={25} />
                  <span className='text-xl font-semibold'>Login/Register</span>
                </div>
              </div>
            </div>

          </div>

        }

      </div>
    </div>

  );
};

export default Home;
