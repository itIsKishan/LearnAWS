const aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });

const dynamodb = new aws.DynamoDB.DocumentClient();

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const { userId } = event.queryStringParameters;
        const params = {
            TableName: 'UserTable',
            Key: {
                userId,
            },
        };
        const response = await dynamodb.get(params).promise();
        console.log('[INFO] User retrieved successfully: ', response);
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Item)
        };
    } catch (error) {
        console.log('[ERROR] Error while creating user: ', error)
        throw error;
    }
};