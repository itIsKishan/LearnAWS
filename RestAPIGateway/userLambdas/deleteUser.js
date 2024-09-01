// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const { userId } = event.queryStringParameters;
        /**
         * DeleteCommand is used to delete a item from the table
         * DeleteCommand allow this below attributes:
            * TableName: The name of the table where you want to delete the item
            * Key: The primary key of the item you want to delete
         */
        const params = new DeleteCommand({
            TableName: 'UserTable',
            Key: {
                userId
            }
        })
        const response = await dbClient.send(params);
        console.log('[INFO] User deleted successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.metadata)
        };
    } catch (error) {
        console.log('[ERROR] Error while deleting user: ', error)
        throw error;
    }
};