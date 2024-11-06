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
import { useDispatch, useSelector } from 'react-redux';
import { useFaunaQuery } from './esymia/faunadb/hook/useFaunaQuery';
import { isConfirmedInfoModalSelector, setIsAlertInfoModal, setMessageInfoModal, setShowInfoModal } from './esymia/store/tabsAndMenuItemsSlice';

export const useAllowSingleSessionUser = () => {
  const { user } = useAuth0();
  const { execQuery } = useFaunaQuery();
  const [loggedUser, setLoggedUser] = useState<
    FaunaUserSessionInfo | undefined
  >(undefined);
  const dispatch = useDispatch()
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);

  useEffect(() => {
    if(isAlertConfirmed){
      execQuery(updateUserSessionInfo, {
        ...loggedUser,
        userSessionInfo: {
          ...loggedUser?.userSessionInfo,
          logged: false
        },
      } as FaunaUserSessionInfo, dispatch);
    }
  }, [isAlertConfirmed])

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
            if(process.env.APP_MODE !== 'test'){
              window.electron.ipcRenderer.invoke('getMac').then((res) => {
                if(res !== item[0].userSessionInfo.mac){
                  if(process.env.APP_MODE !== 'test'){
                    window.electron.ipcRenderer.sendMessage('logout', [
                      process.env.REACT_APP_AUTH0_DOMAIN,
                    ]);
                  }
                  dispatch(
                    setMessageInfoModal(
                      'You are already logged in to another device. Close that connection in order to start a new one. If not possible, you can manually terminate active session using confirm button. This may cause errors if within the active session there were pending operations, so use it carefully!',
                    ),
                  );
                  dispatch(setIsAlertInfoModal(false));
                  dispatch(setShowInfoModal(true));
                }
              })
            }
          }
        } else {
          if(process.env.APP_MODE !== 'test'){
            window.electron.ipcRenderer.invoke('getMac').then((res) => {
              let newUserSessionInfo = {
                email: user.email as string,
                mac: res,
                logged: true,
              } as UserSessionInfo;
              execQuery(createUserSessionInfo, newUserSessionInfo, dispatch).then(
                (ret: any) => {
                  setLoggedUser({
                    id: ret.data.id,
                    userSessionInfo: newUserSessionInfo,
                  } as FaunaUserSessionInfo);
                },
              );
            });
          }
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
