import { useFaunaQuery } from "cad-library"
import { useEffect, useState } from "react"
import faunadb from 'faunadb';
import { useAuth0 } from "@auth0/auth0-react";

export const useDemoMode = () => {
  const MILLISECONDS_IN_A_DAY = 8.64e7
  const DEMO_DAYS = 30
  const {user} = useAuth0()
  const [allowedUser, setallowedUser] = useState<boolean>(true)
  const [remainingDemoDays, setRemainingDemoDays] = useState<number>(DEMO_DAYS)
  const { execQuery } = useFaunaQuery()

  const getItemByMacAddress = async (
    faunaClient: faunadb.Client,
    faunaQuery: typeof faunadb.query,
    macaddress: string,
  ) => {
    const response = await faunaClient
      .query(
        faunaQuery.Select(
          'data',
          faunaQuery.Map(
            faunaQuery.Paginate(
              faunaQuery.Match(faunaQuery.Index('get_item_by_macaddress'), macaddress),
            ),
            faunaQuery.Lambda('item', {
              id: faunaQuery.Select(
                ['ref', 'id'],
                faunaQuery.Get(faunaQuery.Var('item')),
              ),
              item: faunaQuery.Select(
                ['data'],
                faunaQuery.Get(faunaQuery.Var('item')),
              ),
            }),
          ),
        ),
      )
      .catch((err) =>
        console.error(
          'Error: [%s] %s: %s',
          err.name,
          err.message,
          err.errors()[0].description,
        ),
      );
    return response;
  };


  const createItemInMacAddresses = async (
    faunaClient: faunadb.Client,
    faunaQuery: typeof faunadb.query,
    itemToSave: {macAddress: string, startTime: number},
  ) => {
    const response = await faunaClient
      .query(
        faunaQuery.Create(faunaQuery.Collection('MacAddresses'), {
          data: itemToSave
        }),
      )
      .catch((err) =>
        console.error(
          'Error: [%s] %s: %s',
          err.name,
          err.message,
          err.errors()[0].description,
        ),
      );
    return response;
  };

  const demoElapsedDays = (demoStartTime: number) => {
    return Math.trunc((new Date().getTime() - demoStartTime)/MILLISECONDS_IN_A_DAY)
  }

  const checkDemoPeriod = () => {
    window.electron.ipcRenderer.invoke('getMac').then(res => {
      execQuery(getItemByMacAddress, res).then(item => {
        if(item.length !== 0){
          let elapsedDays = demoElapsedDays(item[0].item.startTime)
          setRemainingDemoDays(DEMO_DAYS - elapsedDays)
          if(elapsedDays >= DEMO_DAYS){
            setallowedUser(false)
            alert("The trial period has expired!")
            window.close()
          }
        }else{
          execQuery(createItemInMacAddresses, {macAddress: res, startTime: new Date().getTime()})
        }
      })
    })
  }

  useEffect(() => {
    if (user){
      checkDemoPeriod()
    }
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => {
      if(user){
        checkDemoPeriod()
      }
    }, MILLISECONDS_IN_A_DAY);
    return () => clearInterval(interval);
  }, [])

  return {allowedUser, remainingDemoDays}
}
