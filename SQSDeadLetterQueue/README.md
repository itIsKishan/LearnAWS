# Introduction
Imagine having thousand of requests to your lambda on daily basis, and you left without knowing about the un-processed event? and your customer came to you to know about those failed events? does it became headache now? not really we can utilize the SQS DLQ to store unconsumed messages, by having a dead letter queue which is held by a source queue. 

So what is SQS DLQ?
AWS SQS provide a feature called Dead-Letter-queue, by attaching a DLQ to a source queue, you can send the unconsumed message from the lambda to DLQ.
A source queue will have the Lamdba trigger attached and whenever the lamdba throw error because of failed execution, source queue will recieve this failed events and then will be stored in the Dead-Letter-Queue.

then let's learn how to implement the architecture!
# File Structure
To maintain clarity and avoid overloading the `serverless.yml` file, I’ve organized the resources into separate folders. Below is the folder structure of the project:
```
├── resources/
│   ├── dynamoDB/
│   │   └── userTable.yml
│   ├── lambda/
│   │   └── createUserLambda.yml
│   ├── role/
│   │   └── role.yml
│   └── sqs/
│       ├── userQueue.yml
│       └── userDeadLetterQueue.yml
├── src/
│   └── createUser.js
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── serverless.yml
```
**1.resources**
  This folder contains the configuration related to the  creation of the AWS resources, which includes DynamoDB, Lambda, IAM role, and SQS.
  **1.1 dynamoDB/:** This subfolder contains infrastructure configuration of creating a dynamoDB table.
    **1.1.1 userTable.yml:** This yaml configuration defines the schema of the `user` tablee.
  
  **1.2 lambda/:** This subfolder contains configurations related to create a lambda
    **1.2.1 createUserLamdba.yml:** This yaml contains configuration details of creating a `createUserLamdba`
  
  **1.3 role/role.yml:** This subfolder contains configurations related to specifying the permission for the lambda

  **1.4 sqs/:** This subfolder contains configuration related to creation of sqs and DLQ
    **1.4.1 userQueue.yml:** This yaml configuration contains specification related to sqs queue
    **1.4.2 userDeadLetterQueue.yml:** This yaml contains configuration to create a DLQ for the above source queue

**2.src/**
  This folder contains lambda handler codes
  **2.1 createUser.js:** This file contains code to createUser using version 3 of DDB Client.

# Explanation of YAML's
**Step1: Creating a Lambda Function**
So the first step to implement SQS DLQ to have unconsumed message is to have a Lambda function which is going to be triggered from the `userQueue`. The lambda code does simply create a user with provided info from the records of source queue, while to make sure failed executions are stored in the Dead-Letter-queue, we need to `throw` error in the lambda, instead of returning the error message.

In the `serverless.yml` step is described as below where as entire configuration lies in the file `resources/lambda/createUserLamdba.yml`
```
#Step1: Create the lambda which do create user operation 
createUserLambda: ${file(resources/lambda/createUserLambda.yml)}
```
in the above yml `createUserLamdba.yml`, we do define the configuration requried to create a lamdba along with that, in the events, a `sqs` type is added to make sure this lamdba is going to be triggered from the `userQueue`, where `arn` is mentioned of the source queue along with the `batchSize` of `1`
```
events: 
  - sqs: #SQS: setting sqs event so that lambda is triggered from SQS
      arn: !GetAtt userQueue.Arn
      enabled: true
      batchSize: 1
```

This setup make sure a lambda with sqs trigger is been added to implement the architecture.

**Step2: Creating DDB Table With IAM Role**
As The lamdba created in the previous step is going to perform create action on the `UserCache` table, it is required to have a table created & permission attached to the lambda to perform create action on table, and sqs queue.

  **Step2.1: IAM Role**
    Now comes to the AWS root, where we need to specify the action which our created lamdba is going to perform, in the first policy we make sure the lambda will be able to have cloudwatch logs, along with PutItem action is allowed for the lamdba on the table `UserCache`, the policy defined looks something like below

    ```
      -  PolicyName: UserCachePolicy #UserCachePolicy: Allow lambda to perform Create operations on UserCache table
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action: 
                - dynamodb:PutItem
              Resource: 
                - !Sub "arn:aws:dynamodb:${self:provider.region}:${AWS::AccountId}:table/UserCache"
                - !Sub "arn:aws:dynamodb:${self:provider.region}:${AWS::AccountId}:table/UserCache/*"
            - Effect: Allow
              Action:
                - logs:CreateLogGroup
                - logs:CreateLogStream
                - logs:PutLogEvents
              Resource: "*"
    ```
    Next to make sure that lambda is triggered from the source queue, we need to provide the lamdba to perform, sendMessage, deleteMessage, recieveMessage actions, to do that next policy is created as below

    ```
      - PolicyName: sqsPolicy #SQSPolicy: we need to set this permission to the lambda which is going to trigerr from SQS queue
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: "Allow"
              Action:
                - "sqs:SendMessage"
                - "sqs:DeleteMessage"
                - "sqs:ReceiveMessage"
                - "sqs:GetQueueAttributes"
              Resource: 
                - !Sub "arn:aws:sqs:${self:provider.region}:${AWS::AccountId}:user-queue"
    ```
    This step will ensure that all the required permission for the lambda is been properly created and attached while creating the lambda

**Step3: Creating SQS & DLQ**
Now the last step of implementing the architecture flow is to create two queues, with name `user-queue` & `user-dead-letter-queue`, where first one is the source queue and the next one is `Dead-Letter-Queue`, to be able to attach the DLQ to the source queue we need to first create the `Dead-Letter-Queue`.
So lets configure the `Dead-Letter-Queue`, with attributes: QueueName, VisibilityTimeout, MessageRetentionPeriod, MaximumMessageSize
the yaml defination exists in `resources/sqs/userDeadLetterQueue.yml`
```
Type: AWS::SQS::Queue #SQSDLQ: This is the dead letter queue for the userQueue
Properties:
  QueueName: user-dead-letter-queue #QueueName: name of the queue
  VisibilityTimeout: 30 #VisibilityTimeout: time set to make the message invisible to other consumers after a consumer has received it.
  MessageRetentionPeriod: 1209600 #MessageRetentionPeriod: time for which the message is retained in the queue(14 days in this case)
  MaximumMessageSize: 262144 #MaximumMessageSize: maximum size of the message(256kib in this case)
```
where each attribute is responsible for:
**1. Type:** `AWS::SQS::Queue` this is to define the queue
**2. QueueName:** to speicify the name for the queue
**3. VisibilityTimeout:** time set to make the message invisible to other consumers after a consumer has received it.
**4. MessageRetentionPeriod:** time for which the message is retained in the queue(14 days in this case)
**5. MaximumMessageSize:** maximum size of the message(256kib in this case)

as the `Dead-Letter-Queue` with name `user-dead-letter-queue` is created, let's create a source queue and then attach this DLQ as redivePolicy to the source queue.
the yaml defination exists in `resources/sqs/userQueue.yml`
```
Type: AWS::SQS::Queue #userQueue: This is the queue which is used to store the user data
Properties:
  QueueName: user-queue #QueueName: name of the queue
  VisibilityTimeout: 30
  MessageRetentionPeriod: 1209600 #MessageRetentionPeriod: time for which the message is retained in the queue(14 days in this case)
  MaximumMessageSize: 262144 #MaximumMessageSize: maximum size of the message(256kib in this case)
  RedrivePolicy: #RedrivePolicy: setting the dead letter queue for the userQueue
    deadLetterTargetArn: !GetAtt userDeadLetterQueue.Arn
    maxReceiveCount: 1
```
The configuration remains to be same as creating the `Dead-Letter-Queue`, the difference is that we will use `RedrivePolicy` to attach the created queue, and make sure this queue use that as DLQ to store unconsumed message.
to set the destination of the DLQ we need to use the attribute `deadLetterTargetArn` under `RedrivePolicy` as below
```
deadLetterTargetArn: !GetAtt userDeadLetterQueue.Arn
```
we can also set the maximum receive count to the queue, using the attribute called `maxReceiveCount`, and the value can be anywhere between 1 to 1000
```
maxReceiveCount: 1
```

This steps will sum up on following the process to implement the SQS Dead-Letter-Queue.

# Conclusion
In this guide, we came to know that by implementing an SQS `Dead-Letter-Queue(DLQ)` you can ensure that any failed event from the lambda functions are not lost. Instead they are captured in a dedicated queue for a later review, enabling you to diagnose and address issues with ease. This setup provides greater reliability and accountability in handling AWS Lambda-triggered events, ultimately improving your application’s resilience and operational visibility.

Following the steps in this guide, you’ll have a well-structured setup that integrates DynamoDB, Lambda, and SQS with DLQ to maintain and troubleshoot event-processing workflows effectively.