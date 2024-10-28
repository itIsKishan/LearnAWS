# Introduction
This project demonstrates how to generate pre-signed URLs using AWS Lambda to manage object access in an S3 bucket. The infrastructure and code are organized for efficient resource management and ease of deployment within the Serverless Framework, with a focus on modularizing configuration files and organizing Lambda functions, IAM roles, and AWS resources.

# File Structure
To maintain clarity and avoid overloading the `serverless.yml` file, I’ve organized the resources into separate folders. Below is the folder structure of the project:
```
├── resources/
│   ├── dynamoDB/
│   │   └── userTable.yml
│   ├── lambda/
│   │   ├── getObjectLambda.yml
│   │   └── putObjectLambda.yml
│   ├── role/
│   │   └── role.yml
│   └── s3/
│       └── sampleS3TestBucket.yml
├── src/
│   ├── getObjectLambda/
│   │   └── index.js
│   └── putObjectLambda/
│       └── index.js
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── serverless.yml
```
**1.resources**
This Folder contains the configuration related to the creation of the AWS resources, which includes DynamoDB, Lambda, IAM Role.

  **1.1 lambda/:** This subfolder contains infrastructure configuration of creating a lambda.
    **1.1.1 getObjectLambda.yml/:** This yaml contains configuration details of creating a `getObjectLamdba`.
    **1.1.2 putObjectLambda.yml/:** THis yaml contains configuration details of creating a `putObjectLambda`.
  
  **1.2 role/role.yml:** This subfolder contains configurations related to specifying the permission for the lambda to perform s3 operation.

  **1.3 s3/sampleS3TestBucket.yml** This subfolder contains configuration of creating a s3 bucket.

**2.src/**
This folder contains lambda handler codes
  **2.1 getObjectLambda/index.js:** This file contains code to get pre-signed url to get s3 bucket object
  **2.2 putObjectlambda/index.js:** This file contains code to get pre-signed url to put an object to s3 bucket.

# Explanation of YAML's
**Step1: Creating a Lambda Function**
The first step is to create a function which can generate pre-signed url for getting and putting object to s3 bucket.

In the `serverless.yml` step is described as below where as entire configuration lies in the file `resources/lambda/getObjectLambda.yml` & `resources/lambda/putObjectLambda.yml`

```
functions:
  #Step1: Create lambda for getting pre-signed url for get & put operation on bucket
  putObjectLambda: ${file(resources/lambda/putObjectLambda.yml)}
  getObjectLambda: ${file(resources/lambda/getObjectLambda.yml)}
```
both the lambda configuration contains `name`, `description`, `handler`, `timeout`, `memory` and an event is attached so that it can be triggered from the api gateway.

```
//putObject event
events: 
  - http: #events: api gateway event
      path: /putObject
      method: post
      cors: true

//getObject Event
events: 
  - http: #events: api gateway event
      path: /getObject
      method: get
      cors: true
```

**Step2: Creating IAM Role**
Next, let's step in to create IAM role for lambda allowing to put & get object on s3 on the bucket `sample-s3-test-dev`. The step is defined as in the `serverless.yml`
```
resources:
  Resources:
    #Step2: Create IAM Role for lambda
    userS3Role: ${file(resources/role/role.yml)}
```
the configuration file exists in `resources/role/role.yml`.
```
- Effect: Allow
  Action: #Action: Action you want to allow
    - s3:PutObject
    - s3:GetObject
  Resource: 
    - !Sub "arn:aws:s3:::sample-s3-test-dev/*"
```

**Step3: Creating a S3 Bucket**
So, you have created & configured the lambda properly, now let's have a bucket in place so that lambda can generate pre-signed url. under the resources `step3` is defined in the `serverless.yml`
```
#Step3: Create S3 Bucket
sampleS3Bucket: ${file(resources/s3/sampleS3TestBucket.yml)}
```
configuration file exists in `resources/s3/sampleS3TestBucket.yml`
```
Type: AWS::S3::Bucket #Bucket: create S3 Bucket
Properties:
  BucketName: sample-s3-test-dev #name: bucket name you want to define
  AccessControl: Private #AccessControl: Access control for the bucket
  VersioningConfiguration: #VersioningConfiguration: Versioning configuration for the bucket
    Status: Enabled
```

This steps will sum up on following the process to implement the pre-signed url from lambda.

# Conclusion 
By following the steps outlined in this guide, you can implement Lambda functions that generate pre-signed URLs, allowing secure access to S3 bucket objects. The modular structure of the configuration files in this project ensures clarity and scalability, making it easy to manage and expand functionality as needed.