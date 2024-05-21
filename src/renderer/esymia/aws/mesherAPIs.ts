import ReactS3Client from 'react-aws-s3-typescript';
import {s3Config} from './s3Config';
import { IConfig } from 'react-aws-s3-typescript/dist/types';
import { Project } from '../model/esymiaModels';


export const uploadFileS3 = async (file: File, selectedProject?: Project) => {
    const s3 = new ReactS3Client(s3Config as IConfig);
    try {
        return await s3.uploadFile(file)
    } catch (exception) {
        console.log(exception);
    }
}

export const deleteFileS3 = async (key: string) => {
    const s3 = new ReactS3Client(s3Config as IConfig);
    try {
        return await s3.deleteFile(key)
    } catch (exception) {
        console.log(exception);
    }
}

