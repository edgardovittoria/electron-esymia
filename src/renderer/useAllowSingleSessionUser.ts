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
import { useDynamoDBQuery } from './dynamoDB/hook/useDynamoDBQuery';
import { getUserSessionInfoDynamoDB, createOrUpdateUserSessionInfoDynamoDB } from './dynamoDB/usersSessionManagementApi';
import { convertFromDynamoDBFormat } from './dynamoDB/utility/formatDynamoDBData';

export const useAllowSingleSessionUser = () => {
  const { user } = useAuth0();
  const { execQuery2 } = useDynamoDBQuery();
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
      execQuery2(getUserSessionInfoDynamoDB, user.email as string, dispatch).then((res) => {
        let item:any = []
        if(res.Item){
          item.push(convertFromDynamoDBFormat(res.Item))
        }
        if (item) {
          let logged = item[0].logged;
          if (!logged) {
            window.electron.ipcRenderer.invoke('getMac').then((mac) => {
              let newSessionInfo = {
                email: item[0].email,
                mac: mac,
                logged: true,
              } as UserSessionInfo;
              execQuery2(createOrUpdateUserSessionInfoDynamoDB, newSessionInfo, dispatch);
              setLoggedUser({
                userSessionInfo: newSessionInfo,
              } as DynamoUserSessionInfo);
            })
          } else {
            if(process.env.APP_MODE !== 'test'){
              window.electron.ipcRenderer.invoke('getMac').then((res) => {
                if(res !== item[0].mac){
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
              execQuery2(createOrUpdateUserSessionInfoDynamoDB, newUserSessionInfo, dispatch).then(
                (ret: any) => {
                  setLoggedUser({
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
    if (loggedUser) {
      let newSessionInfo = {
        ...loggedUser.userSessionInfo,
        logged: false,
      } as UserSessionInfo;
      execQuery2(createOrUpdateUserSessionInfoDynamoDB, newSessionInfo, dispatch)
    }
    setLoggedUser(undefined)
  };

  return {closeUserSessionOnFauna}
};
