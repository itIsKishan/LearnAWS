// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

const createRecord = async (tableName, data) => {
    try {

        const params = new PutCommand({
            TableName: tableName,
            Item: {
                ...data,
                isDeleted: 'false',
            },
            ReturnValues: 'ALL_OLD'
        })
        const response = await dbClient.send(params);
        console.log('[INFO] record created successfully: ', response)
        return response;
    } catch (error) {
        console.log('[ERROR] Error while creating record: ', error)
        throw error;
    }
}

module.exports = {
    createRecord,
}