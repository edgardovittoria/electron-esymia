import { Material, useFaunaQuery } from "cad-library";
import {useEffect, useState} from "react";
import faunadb from 'faunadb'
import { useAuth0 } from "@auth0/auth0-react";
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from "../../../../../../esymia/store/tabsAndMenuItemsSlice";
import { useDispatch } from "react-redux";

export const useMaterials = () => {
    const {user} = useAuth0()
    const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
    const {execQuery} = useFaunaQuery()
    const dispatch = useDispatch()
    async function getMaterials(faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query) {
        const response = await faunaClient.query(
            faunaQuery.Select("data",
                faunaQuery.Map(
                    faunaQuery.Paginate(faunaQuery.Match(faunaQuery.Index("materials_all"))),
                    faunaQuery.Lambda("material", faunaQuery.Select("data", faunaQuery.Get(faunaQuery.Var("material"))))
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
        return response as Material[]
    }

    const updateMaterials = () => {
        execQuery(getMaterials)?.then(res => setAvailableMaterials(res as Material[]))
    }

    useEffect(() => {
        (user) && execQuery(getMaterials)?.then(res => setAvailableMaterials(res as Material[]))
    }, []);

    return {availableMaterials, updateMaterials}
}
