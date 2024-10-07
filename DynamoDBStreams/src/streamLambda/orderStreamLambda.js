const { getOrderInfo } = require("../utils/getOrderInfo");
const { sendMail } = require("../utils/sendMail");

/**
 * This Lambda will get the order info which is shipped status and send a mail to the respective customer.
 * @param {Object} event - event record passed to the stream lambda
 * @param {Object} context - context
 * @returns 
 */
module.exports.handler = async (event, context) => {
    try {
        console.log('[INFO] Event passed to lambda:', JSON.stringify(event));
        const { Records } = event;
        const streamRecord = Records[0].dynamodb;
        //fetch the requried order info
        const orderInfo = getOrderInfo(streamRecord);

        //send email to the customer
        await sendMail(orderInfo)
        
        return {
            statusCode: 200,
            message: 'Sent Email'
        }
    } catch (error) {
        console.log('[ERROR] Error while processing the stream', error);
        throw error;
    }
}
