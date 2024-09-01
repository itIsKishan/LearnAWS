# Intoduction
Building a REST API in the Serverless Framework can be approached in two primary ways:

1. Attaching the event directly during function creation, specifying the method, path, authorization, etc.
2. Defining the REST API using the **AWS::ApiGateway::RestApi** resource, followed by resource creation, method attachment, and then deployment to a stage.

The first approach is widely used, especially in personal projects. When deploying using this method, CloudFormation automatically creates an API Gateway with a name derived from the `serviceName-stage` specified in the `serverless.yml` file.

But what if you want a custom name for your API Gateway? How can you achieve that?

# Aim
This repository aims to provide a walkthrough on creating a REST API using resources, allowing you to specify a custom name for your API Gateway.

## Folder Structure
To maintain clarity and avoid overloading the `serverless.yml` file, I’ve organized the resources into separate folders. Below is the folder structure of the project:
/
├── resources/
│   ├── apiGateway/
│   │   ├── api/
│   │   │   └── userRestApi.yml
│   │   ├── deployment/
│   │   │   └── userRestApiDeployment.yml
│   │   ├── methods/
│   │   │   ├── createUserMethod.yml
│   │   │   ├── deleteUserMethod.yml
│   │   │   ├── getUserMethod.yml
│   │   │   └── updateUserMethod.yml
│   │   └── resource/
│   │       └── userRestApiRootResource.yml
│   ├── dynamoDB/
│   │   └── userTable.yml
│   ├── lambda/
│   │   ├── createUserLambda.yml
│   │   ├── deleteUserLambda.yml
│   │   ├── getUserLambda.yml
│   │   └── updateUserLambda.yml
│   └── role/
│       └── role.yml
├── userLambdas/
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── serverless.yml

Each folder under `resources` is dedicated to a specific component of the architecture:

### API Gateway
Remember how you created an API Gateway in the console? You started by selecting REST API, then navigated through the steps to create resources and attach methods to them. Finally, you deployed the API to stages to make it available to the frontend. In this project, i mirror that process by organizing each task: `API definition, resource creation, method attachment, and deployment`—into separate folders under `resources/apiGateway.`

### Lambda, Role & DynamoDB
Within `resources/role`, `resources/lambda`, and `resources/dynamoDB`, each folder contains a single YAML file that simplifies the process by focusing on creating the necessary resources for the CRUD Lambda functions.

## Explanation of the serverless.yml
**Step 1:** Creating CRUD Functions in `serverless.yml`
Navigate to the serverless.yml file and define the CRUD functions. Each Lambda function should be specified with attributes such as handler, timeout, role, name, and description. Notice that we haven't attached any events yet, as the focus here is on setting up the functions, with event configurations handled separately in the resource section.
![Step1Lambda](screenshots/Screenshot%202024-09-01%20at%203.11.01%20PM.png)

**Step 2:** Creating the Required Table & Role
For your CRUD Lambda functions to operate effectively, it's essential to have a DynamoDB table in place, along with the necessary permissions to perform CRUD operations. While I won't go into detail about the Lambda and role configurations here, you can refer to the [`DynamoDBCRUD`](https://github.com/itIsKishan/LearnAWS/tree/main/DynamoDBCRUD) folder in this repository for more information on setting up and managing DynamoDB operations.

![Step2DDBRole](screenshots/Screenshot%202024-09-01%20at%203.11.14%20PM.png)

**Step 3:** Creating REST API Gateway.
Now we arrive at the main objective of this repository: creating a REST API using the `AWS::ApiGateway::RestApi` resource. This is done in the `resources/apiGateway/api/userRestApi.yml` file, where you'll specify the name and description of your REST API.
![Step3APICreation](screenshots/Screenshot%202024-09-01%20at%203.28.25%20PM.png)

After setting up the REST API, the next step is to create the resource for this API. This configuration is handled in `resources/apiGateway/resource/userRestApiRootResource.yml`, where you'll define the **path** for the resource and reference the REST API you created earlier.
![step3APIResource](screenshots/Screenshot%202024-09-01%20at%203.31.58%20PM.png)

Finally, make sure these resources are properly ordered within the `serverless.yml` file, as shown below:
![step3yml](/screenshots/Screenshot%202024-09-01%20at%203.11.32%20PM.png)

**Step 4:** Creating POST, PUT, GET, DELETE Methods for API Gateway Resource
Now comes the crucial and often challenging part: creating methods for your API Gateway resources. If you're setting your Lambda function as the target for these methods, there's a high likelihood (almost 101%) that you might reference your Lambda name incorrectly, leading to frustrating debugging sessions. To help you avoid this, let me break down how to properly create methods for your API Gateway resource. The implementation details can be found in `resources/apiGateway/methods/.`

Let's break down a single example file, with the understanding that the others will follow a similar structure. Consider the `resources/apiGateway/methods/createUserMethod.yml` file:
![step4MethodsCreate](screenshots/Screenshot%202024-09-01%20at%203.44.56%20PM.png)

In this file, you'll define the authorization, HTTP method, integration, and method responses. You'll also reference the `rootResource` and `restApi` that were created in **Step 3** to ensure this method is properly attached to the API Gateway.

When setting the Lambda function as the target, it's critical to specify `AWS_PROXY` as the integration type and use the correct function URI. Here’s where it gets tricky: you need to reference the CloudFormation-generated name of the Lambda function, not the resource name you defined in the `serverless.yml.`

For example, if your Lambda is named `createUser`, you'll need to reference it as `CreateUserLambdaFunction` in the integration. This naming convention is because, during the deployment process, CloudFormation appends LambdaFunction to every Lambda it creates, which can cause confusion if you're referencing it incorrectly in the YAML file.

This explanation applies to all other methods (GET, PUT, DELETE) as well. By the end, your method definitions will look something like this in the YAML file:
![Step4allMethods](screenshots/Screenshot%202024-09-01%20at%203.11.39%20PM.png)

**Step 5:** Deploying the API Gateway to the DEV Stage
Congratulations! You've successfully created a REST API with resources and methods. Now, let's deploy your API so it can be accessed outside of the AWS Console. Once deployed, you can share the API endpoint with your frontend team or even with a friend.
The deployment process is handled in the `resources/apiGateway/deployment/userRestApiDeployment.yml` file. Here, we use the `DependsOn` attribute to ensure that all methods are created before the deployment occurs. We also specify a stage name for the deployment and reference the REST API we created earlier to deploy it correctly.
![Step5deploy](screenshots/Screenshot%202024-09-01%20at%204.04.00%20PM.png)
At the end of the serverless.yml file, the deployment resource is referenced as follows:
![step5ymldeploy](screenshots/Screenshot%202024-09-01%20at%203.11.46%20PM.png)

## Deploy
To deploy your entire setup, simply run the command:
`sls deploy` 
Once the deployment is complete, your API will be live and ready for use.

## Conclusion
In this guide, we've walked through the process of creating and deploying a REST API in the Serverless Framework using a resource-based approach. By organizing the configuration into modular YAML files, we've maintained clarity and flexibility in our setup. This structure not only makes the deployment process smoother but also ensures that your API Gateway is properly configured with custom names, resources, methods, and stages. Now, your API is ready for use, whether it's for a frontend application or any other integration you need.
