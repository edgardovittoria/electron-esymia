import { useAuth0 } from "@auth0/auth0-react";
import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, unsetUser } from "../store";

export const SetUserInfo:FC<{}> = () => {

    const { user } = useAuth0()
    const dispatch = useDispatch()

    useEffect(() => {
      //TODO: sostituire user.name con user.email nella versione integrale
        (user && user.nickname && user.name) ? dispatch(setUser({email: user.name, userName: user.nickname, userRole: user['https://db.fauna.com/roles'][0]})) : dispatch(unsetUser())
      }, [user])

      return <></>
}