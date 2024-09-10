import {useEffect, useState} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from "../../../../../../esymia/store/tabsAndMenuItemsSlice";
import { useDispatch } from "react-redux";
import { useFaunaQuery } from "../../../../../../esymia/faunadb/hook/useFaunaClient";
import { Client, fql, QuerySuccess } from "fauna";
import { Material } from "../../../../../../cad_library";

export const useMaterials = () => {
    const {user} = useAuth0()
    const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
    const {execQuery} = useFaunaQuery()
    const dispatch = useDispatch()
    async function getMaterials(faunaClient: Client, faunaQuery: typeof fql) {
        const response = await faunaClient.query(
          faunaQuery`Materials.all()`
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
        return (response as QuerySuccess<any>).data.data as Material[]
    }

    const updateMaterials = () => {
        execQuery(getMaterials)?.then(res => setAvailableMaterials(res as Material[]))
    }

    useEffect(() => {
        (user) && execQuery(getMaterials)?.then(res => setAvailableMaterials(res as Material[]))
    }, []);

    return {availableMaterials, updateMaterials}
}
