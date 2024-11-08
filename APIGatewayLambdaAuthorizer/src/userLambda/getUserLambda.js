/**
 * This function will be invoked from api gateway
 * @param {object} event - The event object that is passed to the lambda authorizer
 * @returns {object} - response
 */
module.exports.handler = async (event) => {
    try {
        console.log('[INFO] Event Passed To Lambda Authorizer:', JSON.stringify(event))
        return {
          statusCode: 200,
          body: JSON.stringify('User Found!'),
        };
    } catch (error) {
        console.log('[ERROR] Error:', error)
        return {
            statusCode: 500,
            body: JSON.stringify('Internal Server Error'),
        };
    }
};
