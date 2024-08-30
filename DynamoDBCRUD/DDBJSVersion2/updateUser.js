const aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });
const { uuid:v4 } = require('uuid');

const dynamodb = new aws.DynamoDB.DocumentClient();

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const data = JSON.parse(event.body);
        const params = {
            TableName: 'UserTable',
            Key: {
                userId: data.userId,
            },
            UpdateExpression: 'set #name = :name, #email = :email',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#email': 'email',
            },
            ExpressionAttributeValues: {
                ':name': data.name,
                ':email': data.email,
            },
            ReturnValues: 'ALL_NEW',
        };
        const response = await dynamodb.update(params).promise();
        console.log('[INFO] User created successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.log('[ERROR] Error while creating user: ', error)
        throw error;
    }
};