import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { useDynamoDBQuery } from './dynamoDB/hook/useDynamoDBQuery';
import { getItemByMacAddressDynamoBD, createItemInMacAddressesDynamoDB } from './dynamoDB/macAddressesApis';
import { convertFromDynamoDBFormat } from './dynamoDB/utility/formatDynamoDBData';

export const useDemoMode = () => {
  const MILLISECONDS_IN_A_DAY = 8.64e7;
  const DEMO_DAYS = 300;
  const { user } = useAuth0();
  const [allowedUser, setallowedUser] = useState<boolean>(true);
  const [remainingDemoDays, setRemainingDemoDays] = useState<number>(DEMO_DAYS);
  const { execQuery2 } = useDynamoDBQuery();
  const dispatch = useDispatch();
  //console.log(user)

  // const getItemByMacAddress = async (
  //   faunaClient: Client,
  //   faunaQuery: typeof fql,
  //   macaddress: string,
  // ) => {
  //   const query = fql`getItemByMacAddress(${macaddress})`
  //   const response = await faunaClient.query(query)
  //     .catch((err) => {
  //       dispatch(
  //         setMessageInfoModal(
  //           'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
  //         ),
  //       );
  //       dispatch(setIsAlertInfoModal(false));
  //       dispatch(setShowInfoModal(true));
  //     });
  //   return (response as QuerySuccess<any>).data.data;
  // };

  // const createItemInMacAddresses = async (
  //   faunaClient: Client,
  //   faunaQuery: typeof fql,
  //   itemToSave: { macAddress: string; startTime: number },
  // ) => {
  //   const query = faunaQuery`MacAddresses.create(${itemToSave})`
  //   const response = faunaClient.query(query)
  //     .catch((err) => {
  //       dispatch(
  //         setMessageInfoModal(
  //           'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
  //         ),
  //       );
  //       dispatch(setIsAlertInfoModal(false));
  //       dispatch(setShowInfoModal(true));
  //     });
  //   return response;
  // };

  const demoElapsedDays = (demoStartTime: number) => {
    return Math.trunc(
      (new Date().getTime() - demoStartTime) / MILLISECONDS_IN_A_DAY,
    );
  };

  const checkDemoPeriod = () => {
    if(process.env.APP_MODE !== 'test'){
      window.electron.ipcRenderer.invoke('getMac').then((res) => {
        execQuery2(getItemByMacAddressDynamoBD, res, dispatch).then((resDynamo) => {
          let item:any[] = []
          if(resDynamo.Item){
            item.push(convertFromDynamoDBFormat(resDynamo.Item))
          }
          if (item.length !== 0) {
            let elapsedDays = demoElapsedDays(item[0].startTime);
            setRemainingDemoDays(DEMO_DAYS - elapsedDays);
            if (elapsedDays >= DEMO_DAYS) {
              setallowedUser(false);
              alert('The trial period has expired!');
              window.close();
            }
          } else {
            execQuery2(createItemInMacAddressesDynamoDB, {
              macAddress: res,
              startTime: new Date().getTime(),
            }, dispatch);
          }
        });
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkDemoPeriod();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        checkDemoPeriod();
      }
    }, MILLISECONDS_IN_A_DAY);
    return () => clearInterval(interval);
  }, []);

  return { allowedUser, remainingDemoDays };
};
