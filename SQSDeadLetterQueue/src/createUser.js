const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4} = require('uuid');

const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * This function create a user in the user table
 * @param {Object} event - Event of records info received from the SQS
 * @param {Object} context - Context of the lambda
 * @returns 
 */
module.exports.handler = async (event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event);
        const userInfo = JSON.parse(Records[0].body);
        const params = {
            TableName: process.env.USER_TABLE,
            Item: {
                ...userInfo,
                userId: v4()
            }
        }
        const createUserResponse = await dbClient.send(new PutCommand(params))
        console.log('[INFO] User created successfully:', createUserResponse);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User created successfully',
                data: createUserResponse
            }),
            headers: {
                'Acess-control-allow-origin': '*',
                'Content-Type': 'application/json',
            }
        }
    } catch (error) {
        console.log('[ERROR] error while creating user', error);
        // In order to recieve the unfinished message details in SQS Dead-Letter-Queue, we need to throw the error instead of returning it.
        throw error;
    }
};