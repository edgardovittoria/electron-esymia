import faunadb from 'faunadb';
import { FaunaCadModel } from 'cad-library';
import { Dispatch } from '@reduxjs/toolkit';
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from '../../esymia/store/tabsAndMenuItemsSlice';
import { Client, fql, QuerySuccess } from 'fauna';

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
  faunaClient: Client,
  faunaQuery: typeof fql,
  modelToDelete: string,
  dispatch: Dispatch
) {
  try {
    await faunaClient.query(
      faunaQuery`CadModels.delete(${modelToDelete})`
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
  faunaClient: Client,
  faunaQuery: typeof fql,
  modelToUpdate: FaunaCadModel,
  dispatch: Dispatch
) => {
  const response = await faunaClient
    .query(
      faunaQuery`CadModels.byId(${modelToUpdate.id as string}).update(${modelToUpdate})`
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
  faunaClient: Client,
  faunaQuery: typeof fql,
  user: string,
  dispatch: Dispatch
) => {
  const response = await faunaClient
    .query(
      faunaQuery`CadModels.models_shared_with(${user})`
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
    let res:FaunaModelDetails[] = ((response as QuerySuccess<any>).data.data as any[]).map((item:any) => {return {id: item.id, details: {...item} as FaunaCadModel}})
  return res.map((el) =>
    faunaModelDetailsToFaunaCadModel(el),
  );
};
