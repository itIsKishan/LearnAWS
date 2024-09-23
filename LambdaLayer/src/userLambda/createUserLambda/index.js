// import the required libraries
// const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4 } = require('uuid');
const { createRecord } = require('/opt/nodejs/utils/createRecord')

/**
 * This lambda function is used to create a user in userTable
 * @param {Object} event - event object which will be passed to the lambda
 * @param {Object} context - context object which will be passed to the lambda
 * data is the object which will be passed to the API Gateway in event body
 * {
        "userName": "John Doe",
        "age": 25,
        "email": "john@gmail.com",
    }
*/
module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const eventData = JSON.parse(event.body);
        const data = {
            userId: v4(),
            ...eventData
        }
        // using the lambda layer utility to create a record in todoTable
        const response = await createRecord('userTable', data)
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
