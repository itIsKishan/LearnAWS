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
                userId
            }
        };
        const response = await dynamodb.put(params).promise();
        console.log('[INFO] User deleted successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        console.log('[ERROR] Error while deleting user: ', error)
        throw error;
    }
};