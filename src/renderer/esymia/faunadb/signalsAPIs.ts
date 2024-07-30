import faunadb from "faunadb"
import { Signal } from "../model/esymiaModels";
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from "../store/tabsAndMenuItemsSlice";
import { Dispatch } from "@reduxjs/toolkit";

export async function getSignals(faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, dispatch: Dispatch) {
    const response = await faunaClient.query(
        faunaQuery.Select("data",
            faunaQuery.Map(
                faunaQuery.Paginate(faunaQuery.Match(faunaQuery.Index("signals_all"))),
                faunaQuery.Lambda("signal", faunaQuery.Select("data", faunaQuery.Get(faunaQuery.Var("signal"))))
            )
        )
    )
        .catch((err) => {
          dispatch(
            setMessageInfoModal(
              'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
            ),
          );
          dispatch(setIsAlertInfoModal(false));
          dispatch(setShowInfoModal(true));
        });
    return response as Signal[]
}

export async function saveSignal(faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, newSignal: Signal) {
    await faunaClient.query((
        faunaQuery.Create(
            faunaQuery.Collection('Signals'),
            {
                data: {
                    ...newSignal
                }
            }
        )
    ))

}
