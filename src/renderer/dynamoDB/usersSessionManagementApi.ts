import { Dispatch } from '@reduxjs/toolkit';
import {
  GetItemInput,
  PutItemInput,
} from 'aws-sdk/clients/dynamodb';
import { convertToDynamoDBFormat } from './utility/formatDynamoDBData';
import { dynamoDB } from '../esymia/aws/s3Config';
import { UserSessionInfo } from '../esymia/model/DynamoModels';
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from '../esymia/store/tabsAndMenuItemsSlice';

export const getUserSessionInfoDynamoDB = async (
  user: string,
  dispatch: Dispatch,
) => {
  let params: GetItemInput = {
    TableName: 'UserSessionManagement',
    Key: {
      email: {
        S: user,
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

export const createOrUpdateUserSessionInfoDynamoDB = async (
  userSessionInfo: UserSessionInfo,
  dispatch: Dispatch,
) => {
  let params: PutItemInput = {
    TableName: 'UserSessionManagement',
    Item: convertToDynamoDBFormat(userSessionInfo),
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
