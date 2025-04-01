import {
  DeleteItemInput,
  PutItemInput,
  ScanInput,
} from 'aws-sdk/clients/dynamodb';
import { dynamoDB } from '../esymia/aws/s3Config';
import {
  setMessageInfoModal,
  setIsAlertInfoModal,
  setShowInfoModal,
} from '../esymia/store/tabsAndMenuItemsSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { QuerySuccess } from 'fauna';
import toast from 'react-hot-toast';
import { FaunaCadModel } from '../cad_library';
import { setLoadingSpinner } from '../cadmia/store/modelSlice';
import { convertToDynamoDBFormat } from './utility/formatDynamoDBData';

export const getModelsByOwnerDynamoDB = async (
  owner_id: string,
  dispatch: Dispatch,
) => {
  let params: ScanInput = {
    TableName: 'CadModels',
    FilterExpression: '#owner_id = :owner_id',
    ExpressionAttributeValues: {
      ':owner_id': { S: owner_id },
    },
    ExpressionAttributeNames: {
      '#owner_id': 'owner_id',
    },
  };
  return await dynamoDB
    .scan(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
};

export const createOrUpdateModelInDynamoDB = async (
  modelToSave: FaunaCadModel,
  dispatch: Dispatch,
) => {
  let params: PutItemInput = {
    TableName: 'CadModels',
    Item: convertToDynamoDBFormat(modelToSave),
  };
  return await dynamoDB
    .putItem(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
};

export async function deleteModelDynamoDB(
  modelToDelete: string,
  dispatch: Dispatch,
) {
  let params: DeleteItemInput = {
    TableName: 'CadModels',
    Key: { id: { S: modelToDelete } },
  };
  return await dynamoDB
    .deleteItem(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
}
