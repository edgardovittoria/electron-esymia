import faunadb from 'faunadb';
import { FaunaCadModel } from 'cad-library';

type FaunaModelDetails = {
  id: string;
  details: FaunaCadModel;
};

function faunaModelDetailsToFaunaCadModel(modelDetails: FaunaModelDetails) {
  return {
    id: modelDetails.id,
    ...modelDetails.details,
  } as FaunaCadModel;
}
export async function deleteFaunadbModel(
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  modelToDelete: string,
) {
  try {
    await faunaClient.query(
      faunaQuery.Delete(
        faunaQuery.Ref(faunaQuery.Collection('CadModels'), modelToDelete),
      ),
    );
  } catch (e) {
    console.log(e);
  }
}

export const updateModelInFauna = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  modelToUpdate: FaunaCadModel,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(faunaQuery.Collection('CadModels'), modelToUpdate.id),
        {
          data: modelToUpdate,
        },
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

export const getSharedModels = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  user: string,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Select(
        'data',
        faunaQuery.Map(
          faunaQuery.Paginate(
            faunaQuery.Match(faunaQuery.Index('models_shared_with'), user),
          ),
          faunaQuery.Lambda('model', {
            id: faunaQuery.Select(
              ['ref', 'id'],
              faunaQuery.Get(faunaQuery.Var('model')),
            ),
            details: faunaQuery.Select(
              'data',
              faunaQuery.Get(faunaQuery.Var('model')),
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
  return (response as FaunaModelDetails[]).map((el) =>
    faunaModelDetailsToFaunaCadModel(el),
  );
};
