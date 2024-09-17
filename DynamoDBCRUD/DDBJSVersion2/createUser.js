const aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });
const { v4 } = require('uuid');

const dynamodb = new aws.DynamoDB.DocumentClient();

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const data = JSON.parse(event.body);
        const params = {
            TableName: 'UserTable',
            Item: {
                ...data,
                isDeleted: 'false',
                userId: v4()
            },
            ReturnValues: 'ALL_OLD'
        };
        const response = await dynamodb.put(params).promise();
        console.log('[INFO] User created successfully: ', response)
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