import { User, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import {
  createUserSessionInfo,
  getUserSessionInfo,
  updateUserSessionInfo,
} from './esymia/faunadb/projectsFolderAPIs';
import {
  FaunaUserSessionInfo,
  UserSessionInfo,
} from './esymia/model/FaunaModels';
import { useDispatch } from 'react-redux';
import { useFaunaQuery } from './esymia/faunadb/hook/useFaunaQuery';

export const useAllowSingleSessionUser = () => {
  const { user } = useAuth0();
  const { execQuery } = useFaunaQuery();
  const [loggedUser, setLoggedUser] = useState<
    FaunaUserSessionInfo | undefined
  >(undefined);
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) {
      execQuery(getUserSessionInfo, user.email as string, dispatch).then((item) => {
        if (item.length !== 0) {
          let logged = item[0].userSessionInfo.logged;
          if (!logged) {
            let newSessionInfo = {
              ...item[0].userSessionInfo,
              logged: true,
            } as UserSessionInfo;
            execQuery(updateUserSessionInfo, {
              ...item[0],
              userSessionInfo: newSessionInfo,
            } as FaunaUserSessionInfo, dispatch);
            setLoggedUser({
              ...item[0],
              userSessionInfo: newSessionInfo,
            } as FaunaUserSessionInfo);
          } else {
            window.electron.ipcRenderer.sendMessage('logout', [
              process.env.REACT_APP_AUTH0_DOMAIN,
            ]);
            alert(
              'You are already logged in to another device. Close that connection in order to start a new one.',
            );
          }
        } else {
          let newUserSessionInfo = {
            email: user.email as string,
            logged: true,
          } as UserSessionInfo;
          execQuery(createUserSessionInfo, newUserSessionInfo, dispatch).then(
            (ret: any) => {
              setLoggedUser({
                id: ret.ref.value.id,
                userSessionInfo: newUserSessionInfo,
              } as FaunaUserSessionInfo);
            },
          );
        }
      });
    }
  }, [user]);

  const closeUserSessionOnFauna = () => {
    if (loggedUser) {
      let newSessionInfo = {
        email: loggedUser.userSessionInfo.email,
        logged: false,
      } as UserSessionInfo;
      execQuery(updateUserSessionInfo, {
        id: loggedUser.id,
        userSessionInfo: newSessionInfo,
      } as FaunaUserSessionInfo, dispatch);
    }
    setLoggedUser(undefined)
  };

  return {closeUserSessionOnFauna}
};
