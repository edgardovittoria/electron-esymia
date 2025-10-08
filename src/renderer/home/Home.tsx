import React from 'react';
import { IoMdLogIn } from 'react-icons/io';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../esymia/store/tabsAndMenuItemsSlice';
import cadmia_logo from '../../../assets/cadmia_logo.png'
import teema_logo from '../../../assets/logo_teema_dark.png'
import teema_logo_light from '../../../assets/logo_teema_light.png'
import esimia_logo from '../../../assets/esimia_logo.png'

export interface HomeProps {
  setSelectedTab: (v: string) => void;
}

const Home: React.FC<HomeProps> = ({ setSelectedTab }) => {
  const { loginWithPopup, user, loginWithRedirect } = useAuth0();
  const theme = useSelector(ThemeSelector);
  return (
    <div className="flex flex-row">
      <div className="w-full h-[97vh]">
        {user ? (
          <>
            <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
              {theme === 'light' ?
                <img src={teema_logo} alt="" className='w-[25%] z-50 absolute top-20 right-1/2 translate-x-1/2'/> : 
                <img src={teema_logo_light} alt="" className='w-[25%] z-50 absolute top-20 right-1/2 translate-x-1/2'/>
            }
              
              <div className="w-4/5 flex flex-row items-center gap-20">
                <div className="relative flex flex-col w-full cadmia items-center gap-4 rounded-2xl border-2 border-[#2c2c2c] py-[10vh] shadow-2xl shadow-white hover:cursor-pointer hover:opacity-70"
                  onClick={() => setSelectedTab('cadmia')}
                >
                  {/* <div className="absolute top-0 w-full rounded-full border-8 py-[15vh] backdrop-blur-sm h-full"/> */}
                  <img src={cadmia_logo} alt="" className='w-[70%] z-50'/>
                </div>
                <div className="relative flex flex-col w-full esymia items-center gap-4 rounded-2xl border-2 border-[#2c2c2c] py-[10vh] shadow-2xl shadow-white hover:cursor-pointer hover:opacity-70"
                  onClick={() => setSelectedTab('esymia')}
                >
                  {/* <div className="absolute top-0 w-full rounded-full border-8 py-[15vh] backdrop-blur-sm h-full"/> */}
                  <img src={esimia_logo} alt="" className='w-[70%] z-50'/>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full relative flex flex-col gap-4 justify-center items-center">
            <img src={teema_logo} alt="" className='w-[20%] z-50 absolute top-20'/>
            <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
              <div className="w-3/5 flex flex-row items-center gap-20">
                <div className="relative flex flex-col w-full cadmia items-center gap-4 rounded-2xl border-2 border-[#2c2c2c] py-[10vh] shadow-2xl shadow-white">
                  {/* <div className="absolute top-0 w-full rounded-full border-8 py-[15vh] backdrop-blur-sm h-full"/> */}
                  <img src={cadmia_logo} alt="" className='w-[70%] z-50'/>
                </div>
                <div className="relative flex flex-col w-full esymia items-center gap-4 rounded-2xl border-2 border-[#2c2c2c] py-[10vh] shadow-2xl shadow-white">
                  {/* <div className="absolute top-0 w-full rounded-full border-8 py-[15vh] backdrop-blur-sm h-full"/> */}
                  <img src={esimia_logo} alt="" className='w-[70%] z-50'/>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full items-center gap-4 absolute bottom-10">
              <span className="font-semibold text-sm">
                Log in/Sign in to use applications
              </span>
              <div
                className="flex flex-col gap-5 w-1/5 items-center px-10 py-2 border bg-[#2c2c2c] text-white border-black rounded-xl hover:bg-white hover:text-black hover:cursor-pointer"
                onClick={() =>
                  process.env.APP_MODE === 'test'
                    ? (process.env.APP_VERSION === 'demo') ? loginWithRedirect({
                        authorizationParams: {
                          connection: 'sms',
                        },
                      }) : loginWithRedirect()
                    : (process.env.APP_VERSION === 'demo') ? loginWithPopup({
                        authorizationParams: {
                          connection: 'sms',
                        },
                      }) : loginWithPopup()
                }
              >
                <div className="flex flex-row justify-between items-center gap-2">
                  <IoMdLogIn size={25} />
                  <span className="text-xl font-semibold">Login/Register</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
