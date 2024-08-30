// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        /**
         * ScanCommand is used to scan all items from the table
         * ScanCommand allow this below attributes:
            * TableName: The name of the table where you want to scan all the items
            * ProjectionExpression: The attributes you want to get from the table
            * ExpressionAttributeNames: The attribute names you want to use in the ProjectionExpression
         */
        const params = new ScanCommand({
            TableName: 'UserTable',
            ProjectionExpression: "#userName, #age, email, isDeleted",
            ExpressionAttributeNames: { 
                "#userName": "userName",
                "#age": "age",
            },
        })
        const response = await dbClient.send(params);
        console.log('[INFO] scan User successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        console.log('[ERROR] Error while scan on user: ', error)
        throw error;
    }
};