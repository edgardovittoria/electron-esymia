import { User, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import {
  createUserSessionInfo,
  getUserSessionInfo,
  updateUserSessionInfo,
} from './esymia/faunadb/projectsFolderAPIs';
import {
  DynamoUserSessionInfo,
  UserSessionInfo,
} from './esymia/model/DynamoModels';
import { useDispatch, useSelector } from 'react-redux';
import { useFaunaQuery } from './esymia/faunadb/hook/useFaunaQuery';
import { isConfirmedInfoModalSelector, setIsAlertInfoModal, setMessageInfoModal, setShowInfoModal } from './esymia/store/tabsAndMenuItemsSlice';
import { useEffectNotOnMount } from './esymia/hook/useEffectNotOnMount';

export const useAllowSingleSessionUser = () => {
  const { user } = useAuth0();
  const { execQuery } = useFaunaQuery();
  const [loggedUser, setLoggedUser] = useState<
    DynamoUserSessionInfo | undefined
  >(undefined);
  const dispatch = useDispatch()
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
  const [openAlert, setOpenAlert] = useState(false)

  useEffectNotOnMount(() => {
    console.log("isAlertConfirmed -> ", isAlertConfirmed)
    console.log("openAlert -> ", openAlert)
    if(openAlert){
      if(isAlertConfirmed){
        // execQuery(updateUserSessionInfo, {
        //   ...loggedUser,
        //   userSessionInfo: {
        //     ...loggedUser?.userSessionInfo,
        //     logged: false
        //   },
        // } as FaunaUserSessionInfo, dispatch).then(() => {
        //   setOpenAlert(false)
        // });
        setOpenAlert(false)
      }else{
        if(process.env.APP_MODE !== 'test'){
          window.electron.ipcRenderer.sendMessage('logout', [
            process.env.REACT_APP_AUTH0_DOMAIN,
          ]);
        }
        setOpenAlert(false)
      }
    }
  }, [openAlert, isAlertConfirmed])


  useEffect(() => {
    if (user) {
      execQuery(getUserSessionInfo, user.email as string, dispatch).then((item) => {
        if (item.length !== 0) {
          let logged = item[0].userSessionInfo.logged;
          if (!logged) {
            window.electron.ipcRenderer.invoke('getMac').then((mac) => {
              let newSessionInfo = {
                email: item[0].userSessionInfo.email,
                mac: mac,
                logged: true,
              } as UserSessionInfo;
              execQuery(updateUserSessionInfo, {
                id: item[0].id,
                userSessionInfo: newSessionInfo,
              } as DynamoUserSessionInfo, dispatch);
              setLoggedUser({
                id: item[0].id,
                userSessionInfo: newSessionInfo,
              } as DynamoUserSessionInfo);
            })
          } else {
            if(process.env.APP_MODE !== 'test'){
              window.electron.ipcRenderer.invoke('getMac').then((res) => {
                if(res !== item[0].userSessionInfo.mac){
                  dispatch(
                    setMessageInfoModal(
                      'You are already logged in to another device. Close that connection in order to start a new one. If not possible, you can manually terminate active session using confirm button. This may cause errors if within the active session there were pending operations, so use it carefully!',
                    ),
                  );
                  dispatch(setIsAlertInfoModal(false));
                  dispatch(setShowInfoModal(true));
                  setOpenAlert(true)
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
                  } as DynamoUserSessionInfo);
                },
              );
            });
          }
        }
      });
    }
  }, [user]);

  const closeUserSessionOnFauna = () => {
    console.log(loggedUser)
    if (loggedUser) {
      let newSessionInfo = {
        ...loggedUser.userSessionInfo,
        logged: false,
      } as UserSessionInfo;
      execQuery(updateUserSessionInfo, {
        id: loggedUser.id,
        userSessionInfo: newSessionInfo,
      } as DynamoUserSessionInfo, dispatch)
    }
    setLoggedUser(undefined)
  };

  return {closeUserSessionOnFauna}
};
