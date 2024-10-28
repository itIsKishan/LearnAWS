const { S3Client, GetObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = new S3Client({ region: "us-east-1" });

/**
 * This function is used to generate a pre-signed url to get object in s3
 * @param {Object} bucketParams - bucketParams contains the bucket name and key of the object you want to get in the bucket
 * @returns {String} - returns the presignedUrl to get object in the bucket
 */
const createGetPresingedUrl = async ( bucketParams ) => {
    const getObjectCommand = new GetObjectCommand(bucketParams);
    const signedRequest = await getSignedUrl(client, getObjectCommand, { expiresIn: 3600 });
    console.log('[INFO] Signed Request:', signedRequest);
    return signedRequest;
};

/**
 * This handler is used to generate a pre-signed url to get object in s3
 * @param {Object} event - Event passed to the lambda
 * @returns {Object} returns the presigned url to get object
 */
module.exports.handler = async(event) => {
    try {
        console.log('[INFO] Event passed to Lambda:', event);
        //Key: The key of the object you want to get in the bucket
        const { key } = event.queryStringParameters;
        const bucketParams = {
            Bucket: "sample-s3-test-dev",
            Key: key
        };

        // Create a presigned URL to get object in the bucket
        const getPresignedUrl = await createGetPresingedUrl(bucketParams);
        console.log('[INFO] Get Object Presigned URL:', getPresignedUrl);
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success',
                url: getPresignedUrl
            })
        };
    } catch (error) {
        console.log('[ERROR] Error while getting object from s3', error);
        throw error;
    }
};