// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4 } = require('uuid');
// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * data is the object which will be passed to the API Gateway
 * {
        "userId": "1",
        "userName": "John Doe",
        "age": 25,
        "email": "john@gmail.com",
        "isDeleted": "false"
    }
*/
module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const data = JSON.parse(event.body);
        /*
         * PutCommand is used to create a new item in the table
         * PutCommand allow this below attributes:
            * TableName: The name of the table where you want to create the item
            * Item: The item information you want to create
            * ReturnValues: The return values of the operation. For example, NONE, ALL_OLD, UPDATED_OLD, ALL_NEW, UPDATED_NEW
         */
        const params = new PutCommand({
            TableName: 'UserTable',
            Item: {
                ...data,
                isDeleted: 'false',
                userId: v4()
            },
            ReturnValues: 'ALL_OLD'
        })
        const response = await dbClient.send(params);
        console.log('[INFO] User created successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.log('[ERROR] Error while creating user: ', error)
        throw error;
    }
};