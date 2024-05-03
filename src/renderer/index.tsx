import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN as string}
    clientId={process.env.REACT_APP_AUTH0_ID as string}
    authorizationParams={{
      redirect_uri:
        process.env.NODE_ENV === 'production'
          ? 'file://callback'
          : window.location.origin,
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    }}
  >
    <Provider store={store}>
      <div>
        <Toaster position="top-center" />
      </div>
      <App />
    </Provider>
  </Auth0Provider>,
);



window.electron.ipcRenderer.on('runSolver', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
