import toast from "react-hot-toast";
import { Client, fql, QuerySuccess } from "fauna";

export type FaunaCadModel = {
    id?: string,
    name: string,
    components: string,
    bricks?: string,
    owner_id: string,
    owner: string,
    userSharingWith?: string[]
}

type FaunaModelDetails = {
    id: string
    details: FaunaCadModel
}

function faunaModelDetailsToFaunaCadModel(modelDetails: FaunaModelDetails) {
    return {
        id: modelDetails.id,
        ...modelDetails.details
    } as FaunaCadModel
}

export async function saveNewModel(faunaClient: Client, faunaQuery: typeof fql, newModel: FaunaCadModel) {
    try {
        await faunaClient.query(
          faunaQuery`CadModels.create(${newModel})`
        )
        toast.success("Model successfully saved!")
    } catch (e) {
        toast.error("Model not saved! See console log for error details.")
        console.log(e)
    }
}

export const getModelsByOwner = async (faunaClient: Client, faunaQuery: typeof fql, owner_id: string) => {
    try {
        const response = await faunaClient.query(
          faunaQuery`CadModels.models_by_owner(${owner_id})`
        )
            .catch((err: { name: any; message: any; errors: () => { description: any; }[]; }) => console.error(
                'Error: [%s] %s: %s',
                err.name,
                err.message,
                err.errors()[0].description,
            ));
        let res: FaunaModelDetails[] = ((response as QuerySuccess<any>).data.data as any[]).map((item: any) => {return {id: item.id, details: {...item} as FaunaCadModel}})
        return res.map(el => faunaModelDetailsToFaunaCadModel(el))
    } catch (e) {
        console.log(e)
        return {} as [];
    }
}
