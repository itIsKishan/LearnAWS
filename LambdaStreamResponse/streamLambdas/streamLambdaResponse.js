// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * This function is used to stream the whole table of users
 * @param {Object} responseStream - response stream object from aws
 * @param {Object} startKey - Start key for scanning the table
 * @returns {Array} - Array of scanned records
 */
const scanWholeTable = async (responseStream, startKey) => {
    try {
        const params = {
            TableName: 'stream-user-table',
            Limit: 15,
        };
        
        if (startKey) {
            params.ExclusiveStartKey = startKey;
        }
        console.log('[INFO] Scanning the table with params', params);
        // Use the DynamoDB object to scan the table with the specified parameters
        const command = new ScanCommand(params);
        const scanUser = await dbClient.send(command);
        
        // Send the scan result to the stream
        responseStream.write(JSON.stringify(scanUser.Items));
        console.log('[INFO] Scanned Items:', scanUser);

        // If there are more items to scan, recursively continue scanning
        if (scanUser.LastEvaluatedKey) {
            return await scanWholeTable(responseStream, scanUser.LastEvaluatedKey);
        }
    
        // End the response stream when scanning is complete
        responseStream.end();
    } catch (error) {
        console.log('[ERROR] Error while scanning the table', error);
        const errorResponse = {
            errorMessage: 'Error while scanning the table'
        }
        responseStream.write(JSON.stringify(errorResponse))
        responseStream.end();
    }
}


module.exports.handler = awslambda.streamifyResponse(async (event, responseStream, _context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        // Metadata passed to aws lambda stream response
        const metaData = {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        }
        responseStream = awslambda.HttpResponseStream.from(responseStream, metaData)
        await scanWholeTable(responseStream, null);
    } catch (error) {
        console.info('[ERROR] Error in the handler:', error);
        throw error;
    }
});;
