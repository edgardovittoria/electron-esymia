import { Dispatch } from '@reduxjs/toolkit';
import { GetItemInput, PutItemInput } from 'aws-sdk/clients/dynamodb';
import { dynamoDB } from '../../aws/s3Config';
import {
  setMessageInfoModal,
  setIsAlertInfoModal,
  setShowInfoModal,
} from '../../store/tabsAndMenuItemsSlice';
import { convertToDynamoDBFormat } from './utility/formatDynamoDBData';

export const getItemByMacAddressDynamoBD = async (
  macaddress: string,
  dispatch: Dispatch,
) => {
  let params: GetItemInput = {
    TableName: 'MacAddresses',
    Key: {
      macAddress: {
        S: macaddress,
      },
    },
  };
  return await dynamoDB
    .getItem(params)
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

export const createItemInMacAddressesDynamoDB = async (
  itemToSave: { macAddress: string; startTime: number },
  dispatch: Dispatch,
) => {
  let params: PutItemInput = {
    TableName: 'MacAddresses',
    Item: convertToDynamoDBFormat(itemToSave),
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
