// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4 } = require('uuid');
const { getCurrentTime, getExpireAt } = require("../utils/getTime");
// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * This Lambda is used to create order in DDB with the below attributes
 * {
 *   "userId": "uuidUser1"",
 *   "orderDetails": {
 *     "productId": "uuidProduct1",
 *     "quantity": 2,
 *     "price": 1000
 *     "total": 2000
 *   },
 *   "address": {
 *    "street": "1st Main",
 *    "city": "Bangalore",
 *    "state": "Karnataka",
 *    "pincode": "560001"
 *   },
 *   "contactDetails": {
 *    "email": "user1@gamil.com",
 *    "phone": "+91 1234567890"
 *   }
 *   "status": "active/shipped/completed",
 * }
 * and a TTL is added to the order which will expire in 90 days
 * @param {Object} event - The event parameter is the object which will be passed to the API Gateway
 * @param {Object} context - The context parameter is the object which will be passed to the API Gateway
 * @returns {Object} - Returns the response object
 * */
module.exports.handler = async (event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        // Extract the orderData from the event
        const orderData = JSON.parse(event.body);
        // get the current time
        const createdAt = getCurrentTime();
        // get the expire time for 90 days
        const expiresAt = getExpireAt(90)
        const params = new PutCommand({
            TableName: process.env.ORDER_TABLE_NAME,
            Item: {
                ...orderData,
                orderId: v4(),
                createdAt,
                expiresAt
            }
        })
        const response = await dbClient.send(params);
        console.log('[INFO] order created successfully: ', response)
        return {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify({
                message: 'order created successfully',
            })
        };
    } catch (error) {
        console.log('[ERROR] Error while creating order', error)
        throw error
    }
}