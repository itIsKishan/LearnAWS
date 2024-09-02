// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const { userName, email, age } = JSON.parse(event.body);
        const { userId } = event.queryStringParameters;
        /**
         * UpdateCommand is used to update a item in the table
         * UpdateCommand allow this below attributes:
            * TableName: The name of the table where you want to update the item
            * Key: The primary key of the item you want to update
            * UpdateExpression: The attributes you want to update in the item
            * ExpressionAttributeValues: The values you want to update in the item
            * ReturnValues: The return values of the operation. For example, NONE, ALL_OLD, UPDATED_OLD, ALL_NEW, UPDATED_NEW
         */
        const params = new UpdateCommand({
            TableName: 'userCache',
            Key: {
                userId
            },
            UpdateExpression: 'SET #name = :name, #age = :age, #email = :email',
            ExpressionAttributeNames: { 
                '#name': 'userName',
                '#age': 'age', 
                '#email': 'email' 
            },
            ExpressionAttributeValues: {
                ':name': userName,
                ':age': age,
                ':email': email
            },
            ReturnValues: "ALL_NEW",
        })
        const response = await dbClient.send(params);
        console.log('[INFO] User Updated successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        console.log('[ERROR] Error while updating user: ', error)
        throw error;
    }
};