const { S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = new S3Client({ region: "us-east-1" });

/**
 * This function is used to generate a pre-signed url to put object in s3
 * @param {Object} bucketParams - bucketParams contains the bucket name and key of the object you want to put in the bucket
 * @returns {String} - returns the presignedUrl to put object in the bucket
 */
const createPutPresingedUrl = async ( bucketParams ) => {
    const putObjectCommand = new PutObjectCommand(bucketParams);
    const signedRequest = await getSignedUrl(client, putObjectCommand, { expiresIn: 3600 });
    console.log('[INFO] Signed Request:', signedRequest);
    return signedRequest;
};

/**
 * This handler is used to generate a pre-signed url to put object in s3
 * @param {Object} event - Event passed to the lambda
 * @returns {Object} returns the presigned url to put object
 */
module.exports.handler = async(event) => {
    try {
        console.log('[INFO] Event passed to Lambda:', event);
        //Key: The key of the object you want to put in the bucket
        const { key } = JSON.parse(event.body);
        const bucketParams = {
            Bucket: "sample-s3-test-dev",
            Key: key
        };

        // Create a presigned URL to put object in the bucket
        const putPresignedUrl = await createPutPresingedUrl(bucketParams);
        console.log('[INFO] Put Object Presigned URL:', putPresignedUrl);

        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success',
                url: putPresignedUrl
            })
        };
    } catch (error) {
        console.log('[ERROR] Error while putting object to s3', error);
        throw error;
    }
};