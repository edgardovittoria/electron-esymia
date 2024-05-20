import AWS from 'aws-sdk';

export const s3Config = {
  bucketName: process.env.REACT_APP_AWS_BUCKET_NAME as string,
  region: 'us-east-1',
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY as string,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY as string,
  s3Url: 'https://models-bucket-49718971291.s3.amazonaws.com/',
};

AWS.config.update({
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY as string,
  },
  httpOptions: {
    timeout: 900 * 1000,
    connectTimeout: 900 * 1000,
  },
});

export const s3 = new AWS.S3();
