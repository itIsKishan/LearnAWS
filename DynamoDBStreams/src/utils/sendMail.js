const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// Initialize the SES Client
const sesClient = new SESClient({ region: "us-east-1" }); // Replace with your region

/**
 * This function used to send mail to the recipient user after a order is shipped
 * @param {Object} orderInfo - orderInfo required to send mail
 * @returns {Boolean}
 */
const sendMail = async (orderInfo) => {
    const { email, orderId, status} = orderInfo;
    try {
        const params = {
            Source: "krrishkishan123@gmail.com", // Replace with your verified SES sender email
            Destination: {
                ToAddresses: [email], // Recipient's email
            },
            Message: {
                Subject: {
                    Data: `Order Status Update - Order #${orderId}`
                },
                Body: {
                    Text: {
                        Data: `Hello,\n\nYour order with ID ${orderId} is now ${status}. \n\nThank you for shopping with us!`
                    }
                }
            }
        };
        const emailParam = new SendEmailCommand(params)
        const emailResponse = await sesClient.send(emailParam);
        console.log('[INFO] Email Sent Successfuly', emailResponse)
        return true
    } catch (error) {
        console.log('[ERROR] Error while sending mail', error);
        throw error;
    }
}

module.exports = {
    sendMail,
}