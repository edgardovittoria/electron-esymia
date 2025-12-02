import React from 'react';
import { IoMdLogIn, IoMdArrowForward } from 'react-icons/io';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../esymia/store/tabsAndMenuItemsSlice';
import cadmia_logo from '../../../assets/cadmia_logo.png';
import cadmia_logo_light from '../../../assets/cadmia_logo_light.png';
import teema_logo from '../../../assets/logo_teema_dark.png';
import teema_logo_light from '../../../assets/logo_teema_light.png';
import esimia_logo from '../../../assets/esimia_logo.png';
import esimia_logo_light from '../../../assets/esimia_logo_light.png';

export interface HomeProps {
  setSelectedTab: (v: string) => void;
}

const Home: React.FC<HomeProps> = ({ setSelectedTab }) => {
  const { loginWithPopup, user, loginWithRedirect } = useAuth0();
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  const handleLogin = () => {
    const isTestMode = process.env.APP_MODE === 'test';
    const isDemoVersion = process.env.APP_VERSION === 'demo';
    const authParams = isDemoVersion ? { authorizationParams: { connection: 'sms' } } : undefined;

    if (isTestMode) {
      loginWithRedirect(authParams);
    } else {
      loginWithPopup(authParams);
    }
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>

      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-purple-900' : 'bg-purple-300'}`}></div>
        <div className={`absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-blue-900' : 'bg-blue-300'}`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-pink-900' : 'bg-pink-300'}`} style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header / Logo */}
      <div className="absolute top-12 md:top-24 w-full flex justify-center z-20 animate-fade-in-down">
        <img
          src={isDark ? teema_logo_light : teema_logo}
          alt="Teema Studio"
          className="w-40 md:w-64 opacity-90 hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-16 w-full max-w-7xl px-6">

        {/* Welcome Text */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Welcome to Your Workspace
          </h1>
          <p className={`text-lg md:text-xl font-light max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Select an application to begin your simulation and design journey.
          </p>
        </div>

        {/* App Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full md:w-4/5 lg:w-2/3">

          {/* Cadmia Card */}
          <div
            onClick={() => user && setSelectedTab('cadmia')}
            data-testid="cadmia"
            className={`group relative flex flex-col items-center justify-center p-12 rounded-[2rem] border backdrop-blur-xl transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${!user ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'
              } ${isDark
                ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-black/50 hover:shadow-blue-500/20'
                : 'bg-white/60 border-white/40 hover:bg-white/80 shadow-xl hover:shadow-blue-500/20'
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={isDark ? cadmia_logo_light : cadmia_logo}
              alt="Cadmia"
              className="w-48 md:w-64 object-contain z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className={`mt-8 flex items-center gap-2 text-lg font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
              <span>Launch Cadmia</span>
              <IoMdArrowForward />
            </div>
          </div>

          {/* Esymia Card */}
          <div
            onClick={() => user && setSelectedTab('esymia')}
            data-testid="esymia"
            className={`group relative flex flex-col items-center justify-center p-12 rounded-[2rem] border backdrop-blur-xl transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${!user ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'
              } ${isDark
                ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-black/50 hover:shadow-purple-500/20'
                : 'bg-white/60 border-white/40 hover:bg-white/80 shadow-xl hover:shadow-purple-500/20'
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={isDark ? esimia_logo_light : esimia_logo}
              alt="Esymia"
              className="w-48 md:w-64 object-contain z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className={`mt-8 flex items-center gap-2 text-lg font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              <span>Launch Esymia</span>
              <IoMdArrowForward />
            </div>
          </div>

        </div>

        {/* Login Section */}
        {!user && (
          <div className="flex flex-col items-center gap-6 animate-fade-in-up delay-200">
            <button
              onClick={handleLogin}
              className={`group relative flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden ${isDark
                ? 'bg-white text-black hover:bg-gray-100 shadow-white/10'
                : 'bg-black text-white hover:bg-gray-900 shadow-black/20'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <IoMdLogIn size={24} />
              <span>Login / Register</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer / Copyright */}
      <div className={`absolute bottom-6 text-xs font-medium tracking-widest opacity-60 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        © {new Date().getFullYear()} TEEMA STUDIO
      </div>

    </div>
  );
};

export default Home;
