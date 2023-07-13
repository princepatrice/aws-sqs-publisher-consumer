require("dotenv").config()
const readline = require('readline');
const AWS = require('aws-sdk');

// Set the AWS credentials using environment variables
AWS.config.update({
    accessKeyId: process.env.YOUR_ACCESS_KEY,
    secretAccessKey: process.env.YOUR_SECRET_KEY,
    region: process.env.PREFERED_REGION
});

// Create a readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Create an SQS client
const sqs = new AWS.SQS();

function introduceApp() {
    console.log("----------------------------------------------------------------------------")
    console.log("                          CONSUMER                                          ")
    console.log("----------------------------------------------------------------------------")
    setImmediate(()=>setupConsumerArn())
}

function setupConsumerArn() {
    rl.question(' (DKP) Enter the Consumer Custom (Any name you want) :  ', (userInput) => {
        const consumerName = userInput;
        rl.question(' (DKP) Enter the Consumer AWS QueuUrl : ', (userInput) => {
            const QueuUrl = userInput;
            console.log("-------------------------- Messages-------------------------------------")
            receiveMessages(QueuUrl, consumerName)
        })
    })
}


function receiveMessages(queueUrl, consumerName) {
    const params = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20 // Long polling to reduce unnecessary API calls
    };

    sqs.receiveMessage(params, (err, data) => {
        if (err) {
            console.log('Error receiving message:', err);
            setTimeout(() => receiveMessages(queueUrl), 1000); // Retry after 1 second
        } else if (data.Messages) {
            const message = data.Messages[0];
            const body =  JSON.parse (message.Body)
            console.log("Consumer (", consumerName, ') received message:', body.Message);

            // Delete the message from the queue
            const deleteParams = {
                QueueUrl: queueUrl,
                ReceiptHandle: message.ReceiptHandle
            };
            sqs.deleteMessage(deleteParams, (err, data) => {
                if (err) {
                    console.log('Error deleting message:', err);
                } else {
                    //console.log('Message deleted successfully:', data);
                }
                receiveMessages(queueUrl, consumerName); // Continue receiving messages
            });
        } else {
            console.log('No messages in the queue.');
            receiveMessages(queueUrl, consumerName); // Continue receiving messages
        }
    });
}

introduceApp();