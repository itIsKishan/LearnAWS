const aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });

const dynamodb = new aws.DynamoDB.DocumentClient();

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const params = {
            TableName: 'UserTable',
            IndexName: 'isDeleted-index',
            KeyConditionExpression: 'isDeleted = :isDeleted',
            ExpressionAttributeValues: {
                ':isDeleted': 'false',
            },
        };
        const response = await dynamodb.query(params).promise();
        console.log('[INFO] Users queried successfully: ', response);
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        console.log('[ERROR] Error while creating user: ', error)
        throw error;
    }
};