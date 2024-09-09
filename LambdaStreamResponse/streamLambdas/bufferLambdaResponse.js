// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * Scans the entire DynamoDB table in chunks and returns the aggregated items
 * @param {Object} startKey - The starting key for scanning the table (for pagination)
 * @returns {Array} - Array of scanned records
 */
const scanWholeTable = async (startKey) => {
    try {
      let items = [];
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
    
      // concat scanned record to single array
      items = items.concat(scanUser.Items);
    
      // If there are more items to scan, recursively call the scanWholeTable function with the last evaluated key
      if (scanUser.LastEvaluatedKey) {
        const nextItems = await scanWholeTable(scanUser.LastEvaluatedKey);
        items = items.concat(nextItems);
      }
      
      console.log('[INFO] Scanned Items:', items);
      return items;
    } catch (error) {
      console.log('[ERROR] Error while scanning the table', error);
      throw error;
    }
}

module.exports.handler = async (event, context) => {
    try {
      console.log('[INFO] Event passed to lambda:', event)
      const finalUserInfo = await scanWholeTable(null);
      return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
        },
        body: JSON.stringify({userData:finalUserInfo}),
      }
    } catch (error) {
      console.info('[ERROR] Error in the handler:', error);
      throw error;
    }
};
