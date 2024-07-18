import faunadb from 'faunadb';

export const getItemByMacAddress = async (
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


export const createItemInMacAddresses = async (
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
