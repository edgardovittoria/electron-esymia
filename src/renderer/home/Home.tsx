import React from 'react';
import { IoMdLogIn, IoMdArrowForward } from 'react-icons/io';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import { ThemeSelector } from '../esymia/store/tabsAndMenuItemsSlice';
import cadmia_logo from '../../../assets/cadmia_logo.png';
import teema_logo from '../../../assets/logo_teema_dark.png';
import teema_logo_light from '../../../assets/logo_teema_light.png';
import esimia_logo from '../../../assets/esimia_logo.png';

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
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900'}`}>

      {/* Header / Logo */}
      <div className="absolute top-24 w-full flex justify-center animate-fade-in-down">
        <img
          src={isDark ? teema_logo_light : teema_logo}
          alt="Teema Studio"
          className="w-48 md:w-[350px] opacity-90 hover:opacity-100 transition-opacity duration-300"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-12 z-10 w-full max-w-6xl px-4">

        {/* App Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full md:w-4/5 lg:w-3/4">

          {/* Cadmia Card */}
          <div
            onClick={() => user && setSelectedTab('cadmia')}
            className={`group relative flex flex-col items-center justify-center p-10 rounded-3xl border border-opacity-20 backdrop-blur-md transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${!user ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:border-opacity-50'
              } ${isDark ? 'bg-white/5 border-white shadow-black/50' : 'bg-white/40 border-black shadow-gray-300/50'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src={cadmia_logo} alt="Cadmia" className="w-3/4 md:w-2/3 object-contain z-10 drop-shadow-lg group-hover:scale-105 transition-transform duration-500" />
            <div className={`mt-6 text-lg font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Launch Cadmia
            </div>
          </div>

          {/* Esymia Card */}
          <div
            onClick={() => user && setSelectedTab('esymia')}
            className={`group relative flex flex-col items-center justify-center p-10 rounded-3xl border border-opacity-20 backdrop-blur-md transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${!user ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:border-opacity-50'
              } ${isDark ? 'bg-white/5 border-white shadow-black/50' : 'bg-white/40 border-black shadow-gray-300/50'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src={esimia_logo} alt="Esymia" className="w-3/4 md:w-2/3 object-contain z-10 drop-shadow-lg group-hover:scale-105 transition-transform duration-500" />
            <div className={`mt-6 text-lg font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Launch Esymia
            </div>
          </div>

        </div>

        {/* Login Section */}
        {!user && (
          <div className="flex flex-col items-center gap-6 animate-fade-in-up">
            <p className={`text-lg font-light tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to access your workspace
            </p>
            <button
              onClick={handleLogin}
              className={`group flex items-center gap-3 px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${isDark
                ? 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                : 'bg-black text-white hover:bg-gray-800 shadow-black/20'
                }`}
            >
              <IoMdLogIn size={24} />
              <span>Login / Register</span>
              <IoMdArrowForward className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </button>
          </div>
        )}
      </div>

      {/* Footer / Copyright */}
      <div className={`absolute bottom-4 text-xs font-light tracking-widest opacity-80 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        © {new Date().getFullYear()} TEEMA STUDIO
      </div>

    </div>
  );
};

export default Home;
