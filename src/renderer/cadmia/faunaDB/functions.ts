import faunadb from 'faunadb';
import { FaunaCadModel } from 'cad-library';
import { Dispatch } from '@reduxjs/toolkit';
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from '../../esymia/store/tabsAndMenuItemsSlice';

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
  dispatch: Dispatch
) {
  try {
    await faunaClient.query(
      faunaQuery.Delete(
        faunaQuery.Ref(faunaQuery.Collection('CadModels'), modelToDelete),
      ),
    ).catch((err) =>
      {
        dispatch(
          setMessageInfoModal(
            'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
          ),
        );
        dispatch(setIsAlertInfoModal(false));
        dispatch(setShowInfoModal(true));
      }
    );
  } catch (e) {
    console.log(e);
  }
}

export const updateModelInFauna = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  modelToUpdate: FaunaCadModel,
  dispatch: Dispatch
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
      {
        dispatch(
          setMessageInfoModal(
            'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
          ),
        );
        dispatch(setIsAlertInfoModal(false));
        dispatch(setShowInfoModal(true));
      }
    );
  return response;
};

export const getSharedModels = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  user: string,
  dispatch: Dispatch
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
      {
        dispatch(
          setMessageInfoModal(
            'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
          ),
        );
        dispatch(setIsAlertInfoModal(false));
        dispatch(setShowInfoModal(true));
      }
    );
  return (response as FaunaModelDetails[]).map((el) =>
    faunaModelDetailsToFaunaCadModel(el),
  );
};
