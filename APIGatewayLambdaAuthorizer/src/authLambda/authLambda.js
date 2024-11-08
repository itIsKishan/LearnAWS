const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

/**
 * This function is used to generate the policy for the user to allow/deny the access/trigger the api gateway endpoint
 * @param {String} principalId - The principalId is the user that is making the request
 * @param {String} effect - The effect is the access that is being granted or denied
 * @param {String} resource - The resource is the API endpoint that is being accessed
 * @returns {object} - The policy that is being generated
*/
const generatePolicy = (principalId, effect, resource) => {
    const policy = {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource,
          },
        ],
      },
    };
    return policy;
};

/**
 * This function is used to get the user info from the database
 * if the user is found then return the user info
 * else if the user Item does not have userId then throw an error
 * otherwise throw an error which will be caught in the catch block
 * @param {String} userId - The userId is the user that is making the request
 * @returns {object} - The user info that is being fetched from the database
*/
const getUserInfo = async (userId) => {
    try {
        // DDB: prepare the get command to get the user info from the database
        const params = new GetCommand({
            TableName: 'userTable',
            Key: {
                userId
            }
        })
        const { Item } = await dbClient.send(params);
        console.log('[INFO] User found successfully: ', Item)

        // DDB: check if the user info is found or not
        if(!Item.hasOwnProperty('userId')) {
            throw new Error('User Not Found');
        }
        return Item;
    } catch (error) {
        console.log('[ERROR] Error while getting user info:', error)
        throw error;
    }
}

/**
 * This function is used to verify the token using jsonwebtoken
 * if the token is valid then return the token info
 * otherwise throw an error which will be caught in the catch block
 * @param {String} authToken - token used while making request to api
 * @returns {object} - returns the verified token info
*/
const verifyToken = ( authToken ) => {
    try {
        //JWT: verify the token provided with the secret key
        const verifedTokenInfo = jwt.verify(authToken, 'secret');
        return verifedTokenInfo;
    } catch (error) {
        console.log('[ERROR] Error while verifying token:', error)
        throw error;
    }
}

/**
 * This function is the handler for the lambda authorizer
 * Step1: Verify the token
 * Step2: Get the user info from the database
 * Step3: Generate the policy based on the effect
 * if any error occurs in the above steps then catch the error and generate the policy with effect as deny
 * @param {object} event - The event object that is passed to the lambda authorizer
 * @returns {object} - The policy that is generated
*/
module.exports.handler = async (event) => {
    let effect = 'Allow';
    try {
        console.log('[INFO] Event Passed To Lambda Authorizer:', JSON.stringify(event))
        const authToken = event.authorizationToken.split(' ')[1];

        //JWT: verify the auth token 
        const verifedTokenInfo = verifyToken(authToken);

        //DDB: get the user info from the database
        await getUserInfo(verifedTokenInfo?.userId);

        // IAM: generate the policy based on the effect for the user to hit the api gateway endpoint
        const policy = generatePolicy('user', effect, event.methodArn);
        return policy;
    } catch (error) {
        console.log('[ERROR] Error while generating policy:', error)
        effect = 'Deny';
        return generatePolicy('user', effect, event.methodArn);
    }
};
