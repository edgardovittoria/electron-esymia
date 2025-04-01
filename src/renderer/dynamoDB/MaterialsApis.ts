import { PutItemInput, ScanInput } from 'aws-sdk/clients/dynamodb';
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

export async function getMaterialsDynamoDB(dispatch: Dispatch) {
  let params: ScanInput = {
    TableName: 'Materials',
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
}
