import { Material, useFaunaQuery } from "cad-library";
import {useEffect, useState} from "react";
import faunadb from 'faunadb'
import { useAuth0 } from "@auth0/auth0-react";

export const useMaterials = () => {
    const {user} = useAuth0()
    const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
    const {execQuery} = useFaunaQuery()
    async function getMaterials(faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query) {
        const response = await faunaClient.query(
            faunaQuery.Select("data",
                faunaQuery.Map(
                    faunaQuery.Paginate(faunaQuery.Match(faunaQuery.Index("materials_all"))),
                    faunaQuery.Lambda("material", faunaQuery.Select("data", faunaQuery.Get(faunaQuery.Var("material"))))
                )
            )
        )
            .catch((err) => console.error(
                'Error: [%s] %s: %s',
                err.name,
                err.message,
                err.errors()[0].description,
            ));
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