require("dotenv").config()
const readline = require('readline');
const AWS = require('aws-sdk');

// Set the AWS credentials using environment variables
AWS.config.update({
    accessKeyId: process.env.YOUR_ACCESS_KEY,
    secretAccessKey: process.env.YOUR_SECRET_KEY,
    region: process.env.PREFERED_REGION
});

// Create an SNS client
const sns = new AWS.SNS();

// Create a readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function introduceApp() {
    console.log("----------------------------------------------------------------------------")
    console.log("                          PRODUCER                                          ")
    console.log("----------------------------------------------------------------------------")
    setImmediate(()=>setupProducerArn())
    

}

function setupProducerArn(){
    rl.question(' \n (DKP) Setup a valid TOPIC ARN: ', (topicArn) => {
        askForMessages(topicArn);
    })
}

// Loop to ask for messages until the user enters "no"
function askForMessages(topicArn) {
    let message = '';
    rl.question(' (DKP) Enter the message to publish (enter "no" to stop): ', (userInput) => {
        message = userInput;
        if (message.toLowerCase() !== 'no') {

            // Publish the message to the topic
            sns.publish({ TopicArn: topicArn, Message: message }, (err, data) => {
                if (err) {
                    console.log('\nError publishing message:', err);
                } else {
                   // console.log('\nMessage published successfully:', data);
                }
            });
            // Ask for the next message
            askForMessages(topicArn);

        } else {
            rl.close();
        }
    });
}

introduceApp(); // Start asking for messages
