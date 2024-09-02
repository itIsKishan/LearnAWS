// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const { userId } = event.queryStringParameters;
        /**
         * GetCommand is used to get a item from the table
         * GetCommand allow this below attributes:
            * TableName: The name of the table where you want to get the item
            * Key: The primary key of the item you want to get
         */
        const params = new GetCommand({
            TableName: 'userCache',
            Key: {
                userId
            }
        })
        const response = await dbClient.send(params);
        console.log('[INFO] User found successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        console.log('[ERROR] Error while getting user: ', error)
        throw error;
    }
};