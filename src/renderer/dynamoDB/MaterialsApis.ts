import { DeleteItemInput, PutItemInput, QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb';
import { MaterialDynamoDB } from '../cadmia/canvas/components/objectsDetailsBar/components/materialSelection/addNewMaterialModal';
import { convertToDynamoDBFormat } from './utility/formatDynamoDBData';
import { dynamoDB } from '../esymia/aws/s3Config';
import {
  setMessageInfoModal,
  setIsAlertInfoModal,
  setShowInfoModal,
} from '../esymia/store/tabsAndMenuItemsSlice';
import { Dispatch } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

export async function createOrUpdateMaterialDynamoDB(
  newMaterial: MaterialDynamoDB,
  dispatch: Dispatch,
) {
  let params: PutItemInput = {
    TableName: 'Materials',
    Item: convertToDynamoDBFormat(newMaterial),
  };
  return await dynamoDB
    .putItem(params)
    .promise()
    .catch((err) => {
      toast.error('Material not saved! See console log for error details.');
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
}

export async function getMaterialsDynamoDB(dispatch: Dispatch, ownerEmail: string) {
  let params: QueryInput = {
    TableName: 'Materials',
    IndexName: 'MaterialsByUserEmail',
    KeyConditionExpression: '#ownerEmail = :ownerEmail',
    ExpressionAttributeValues: {
      ':ownerEmail': { S: ownerEmail },
    },
    ExpressionAttributeNames: {
      '#ownerEmail': 'ownerEmail',
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

export async function deleteMaterialDynamoDB(
  materialToDelete: string,
  dispatch: Dispatch,
) {
  let params: DeleteItemInput = {
    TableName: 'Materials',
    Key: { id: { S: materialToDelete } },
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
