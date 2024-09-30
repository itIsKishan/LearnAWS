// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, paginateQuery } = require("@aws-sdk/lib-dynamodb");
const { getCurrentTime } = require("../utils/getTime");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * This Function is used to retrieve the paginated orders based on userId and check for expiresAt
 * @param {Object} event - The event parameter is the object which will be passed to the API Gateway
 * @param {Object} context - The context parameter is the object which will be passed to the API Gateway
 * @returns {Object} - Returns the response object
 */
module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const { userId } = event.queryStringParameters;
        const expiresAt = getCurrentTime()
        const paginatedOrders = [];
        const params = {
            TableName: process.env.ORDER_TABLE_NAME,
            IndexName: 'userIdIndex', //GSI: Use the userIdIndex to query the orders based on userId
            FilterExpression: 'expiresAt > :expiresAt', //TTL: Check if the order is expired, if it is expired then return 400 status code or else update the order
            KeyConditionExpression: "userId = :userId", 
            ExpressionAttributeValues: {
                ':userId': userId,
                ':expiresAt': expiresAt,
            },
            Limit: 100, //Limit: Limit the number of items to be returned per page
        }

        //paginateQuery: Elemenate the processs of checking the lastEvalutedKey and ExclusiveStartKey and return the paginated response
        const paginatedResponse = paginateQuery({client: dbClient}, params);
        for await (const paginatedObject of paginatedResponse) {
            console.log('[INFO] paginatedObject', paginatedObject)
            paginatedOrders.push(paginatedObject.Items);
        }
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(paginatedOrders)
        };
    } catch (error) {
        console.log('[ERROR] Error while query on order: ', error)
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