import {
  DeleteItemInput,
  PutItemInput,
  QueryInput,
  QueryOutput,
} from 'aws-sdk/clients/dynamodb';
import { dynamoDB } from '../esymia/aws/s3Config';
import {
  setMessageInfoModal,
  setIsAlertInfoModal,
  setShowInfoModal,
} from '../esymia/store/tabsAndMenuItemsSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { FaunaCadModel } from '../cad_library';
import { convertToDynamoDBFormat } from './utility/formatDynamoDBData';

export const getModelsByOwnerDynamoDB = async (
  owner_id: string,
  dispatch: Dispatch,
) => {
  let params: QueryInput = {
    TableName: 'CadModels',
    IndexName: 'ModelsByUserEmail',
    KeyConditionExpression: '#owner_id = :owner_id',
    ExpressionAttributeValues: {
      ':owner_id': { S: owner_id },
    },
    ExpressionAttributeNames: {
      '#owner_id': 'owner_id',
    },
    Limit: 3
  };
  let allItems: any[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined;

  try {
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const result = await dynamoDB.query(params).promise();
      if (result && result.Items) {
        allItems.push(...result.Items);
      }
      lastEvaluatedKey = result?.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return { Items: allItems } as QueryOutput; // Restituisci un oggetto simile a QueryOutput

  } catch (err: any) {
    dispatch(
      setMessageInfoModal(
        'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
      ),
    );
    dispatch(setIsAlertInfoModal(false));
    dispatch(setShowInfoModal(true));
    return undefined; // Indica che c'è stato un errore
  }
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
