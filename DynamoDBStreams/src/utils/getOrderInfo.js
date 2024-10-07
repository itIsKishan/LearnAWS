const { unmarshall } = require('@aws-sdk/util-dynamodb');

/**
 * this function is used to get certain info from the stream data after unmarshall
 * @param {Object} streamRecord - marshalled stream record passed to lambda
 * @returns {Object} - return email, status, orderId after process
 */
const getOrderInfo = (streamRecord) => {
    const record = unmarshall(streamRecord.NewImage);
    const { status, orderId, contactDetails:{ email } } = record
    return { email, status, orderId };
};

module.exports = {
    getOrderInfo,
}