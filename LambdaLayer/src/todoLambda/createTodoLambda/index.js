const { v4 } = require('uuid');
const { createRecord } = require('/opt/nodejs/utils/createRecord')
/**
 * This lambda function is used to create a todo in todoTable
 * @param {Object} event - event object which will be passed to the lambda
 * @param {Object} context - context object which will be passed to the lambda
 * data is the object which will be passed to the API Gateway in event body
 * {
    "userId": "898446e8-85aa-491a-b0b1-1c445f9d452b",
    "task": "create a public repo",
    "status": "inProgress"
  }
*/
module.exports.handler = async(event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', event)
        const eventData = JSON.parse(event.body);
        const data = {
            todoId: v4(),
            ...eventData
        }
        // using the lambda layer utility to create a record in todoTable
        const response = await createRecord('todoTable', data)
        console.log('[INFO] todo created successfully: ', response)
        return {
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
            },
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        console.log('[ERROR] Error while creating todo: ', error)
        throw error;
    }
};
