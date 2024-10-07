// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * This function will update the order status
 * @param {Object} event - The event parameter is the object which will be passed to the API Gateway
 * @param {Object} context - The context parameter is the object which will be passed to the API Gateway
 * @returns {Object} - Returns the response object
 */
module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event);
        const { status } = JSON.parse(event.body);
        const { orderId } = event.queryStringParameters;

        // get the current time for updatedAt
        const currentTime = new Date().getTime();
        const updatedAt = Math.floor(currentTime / 1000) 

        const params = new UpdateCommand({
            TableName: process.env.ORDER_TABLE_NAME,
            Key: {
                orderId
            },
            UpdateExpression: 'SET #updatedAt = :updatedAt, #status = :status',
            ExpressionAttributeNames: { 
                '#updatedAt': 'updatedAt',
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':updatedAt': updatedAt,
                ':status': status
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
        throw error;
    }
};