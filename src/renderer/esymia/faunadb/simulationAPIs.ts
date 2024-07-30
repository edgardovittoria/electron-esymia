import faunadb from "faunadb"
import { Simulation } from "../model/esymiaModels";
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from "../store/tabsAndMenuItemsSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const getSimulationByName = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, name: string, dispatch: Dispatch) => {
    const response = await faunaClient.query(
        faunaQuery.Select("data", faunaQuery.Get(faunaQuery.Match(faunaQuery.Index('simulation_by_name'), name)))
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
    return response as Simulation

}
