// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        /**
         * QueryCommand is used to query all items from the table
         * QueryCommand allow this below attributes:
            * TableName: The name of the table where you want to query all the items
            * KeyConditionExpression: The condition to query the items
            * ExpressionAttributeValues: The values you want to use in the KeyConditionExpression
         */
        const params = new QueryCommand({
            TableName: 'UserTable',
            IndexName: 'isDeletedIndex',
            KeyConditionExpression: "isDeleted = :isDeleted",
            ExpressionAttributeValues: {
                ':isDeleted': 'false',
            },
        })
        const response = await dbClient.send(params);
        console.log('[INFO] query User successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        console.log('[ERROR] Error while query on user: ', error)
        throw error;
    }
};