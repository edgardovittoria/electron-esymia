import AWS from 'aws-sdk';

export const s3Config = {
  bucketName: process.env.REACT_APP_AWS_BUCKET_NAME,
  region: 'eu-north-1',
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  s3Url: `https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/`,
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
  region: "eu-north-1",
  dynamoDbCrc32: false,
});

export const s3 = new AWS.S3();
export const dynamoDB = new AWS.DynamoDB()
