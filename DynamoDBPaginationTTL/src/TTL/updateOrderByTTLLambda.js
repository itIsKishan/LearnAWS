// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { getCurrentTime, getExpireAt } = require("../utils/getTime");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * This function will update the order with the contactdetails, more specifically phone number, and before updating the order it will check if the order is expired or not
    * if it is expired then it will return 400 status code
    * if it is not expired then it will update the order with the phone number
 * @param {Object} event - The event parameter is the object which will be passed to the API Gateway
 * @param {Object} context - The context parameter is the object which will be passed to the API Gateway
 * @returns {Object} - Returns the response object
 */
module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event);
        const { phone } = JSON.parse(event.body);
        const { orderId } = event.queryStringParameters;

        // get the current time and expires time set to 90 days
        const updatedAt = getCurrentTime();
        const expiresAt = getExpireAt(90);

        const params = new UpdateCommand({
            TableName: process.env.ORDER_TABLE_NAME,
            Key: {
                orderId
            },
            ConditionExpression: '#expiresAt > :updatedAt', //TTL: Check if the order is expired, if it is expired then return 400 status code or else update the order
            UpdateExpression: 'SET #contactDetails.#phone = :phone, #updatedAt = :updatedAt, #expiresAt = :expiresAt',
            ExpressionAttributeNames: { 
                '#contactDetails': 'contactDetails',
                '#phone': 'phone',
                '#updatedAt': 'updatedAt',
                '#expiresAt': 'expiresAt'
            },
            ExpressionAttributeValues: {
                ':phone': phone,
                ':updatedAt': updatedAt,
                ':expiresAt': expiresAt
            },
            ReturnValues: "ALL_NEW",
        });
        const response = await dbClient.send(params);
        console.log('[INFO] Order Updated successfully: ', response);
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Attributes)
        };
    } catch (error) {
        console.log('[ERROR] Error while updating order: ', error);
        // If the order is expired, return 400 status code
        if(error.name === 'ConditionalCheckFailedException') {
            return {
                headers:{
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*',
                },
                statusCode: 400,
                body: JSON.stringify('Order is expired')
            };
        };
        throw error;
    }
};