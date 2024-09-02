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
```
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
│   │   ├── resource/
│   │   │   └── userRestApiRootResource.yml
│   │   ├── permission/
│   │   │   ├── createUserInvokePermission.yml
│   │   │   ├── deleteUserInvokePermission.yml
│   │   │   ├── getUserInvokePermission.yml
│   │   │   └── updateUserInvokePermission.yml
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
```

Each folder under `resources` is dedicated to a specific component of the architecture:

### API Gateway
Remember how you created an API Gateway in the console? You started by selecting REST API, then navigated through the steps to create resources and attach methods to them. Finally, you deployed the API to stages to make it available to the frontend. In this project, i mirror that process by organizing each task: `API definition, resource creation, method attachment,Invoke permission and deployment`—into separate folders under `resources/apiGateway.`

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
Now we arrive at one of the core objectives of this repository: creating a REST API using the `AWS::ApiGateway::RestApi` resource. This is a crucial step in building out the API infrastructure, and it is defined in the `resources/apiGateway/api/userRestApi.yml` file.

In this file, you'll specify key attributes such as:

1. **Name and Description:** These define the identity of your REST API. The name should be descriptive enough to reflect the API's purpose, and the description should provide additional context about what the API does or how it's intended to be used.

Here's how the setup looks:
![Step3APICreation](screenshots/Screenshot%202024-09-01%20at%203.28.25%20PM.png)

After the REST API has been defined, the next critical step is to create a resource for this API. A resource in API Gateway represents a URL path that you will expose as part of the API. This configuration is done in the `resources/apiGateway/resource/userRestApiRootResource.yml` file. 

In this file, you'll:

2. **Define the Path:** The path is the part of the URL that comes after the domain name. For example, in the URL https://api.example.com/todo, the path is /todo.

3. **Reference the REST API:** You need to link this resource back to the REST API created earlier, ensuring that the path is correctly associated with your API structure.

Here’s how the resource setup is illustrated:
![step3APIResource](screenshots/Screenshot%202024-09-01%20at%203.31.58%20PM.png)

Below is a visual guide to how these resources should be arranged in the `serverless.yml `file:
![step3yml](/screenshots/Screenshot%202024-09-01%20at%203.11.32%20PM.png)

**Step 4:** Creating POST, PUT, GET, DELETE Methods for API Gateway Resource
Now comes one of the most crucial and often challenging parts: creating methods for your API Gateway resources. If you're setting your Lambda function as the target for these methods, there's a high likelihood (almost 101%) that you might reference your Lambda name incorrectly, leading to frustrating debugging sessions. To help you avoid this, let me break down how to properly create methods for your API Gateway resource. The implementation details can be found in the `resources/apiGateway/methods/ directory`

### Breaking Down a Single Method
Let's focus on a single example file to understand the process, with the understanding that the others will follow a similar structure. Consider the `resources/apiGateway/methods/createUserMethod.yml` file:
![step4MethodsCreate](screenshots/Screenshot%202024-09-01%20at%203.44.56%20PM.png)

In this file, you'll need to define several key elements:

1. **Authorization:** Specifies who can invoke this method. If you're not using any custom authorizers, you might set this to `NONE`.

2.**HTTP Method:** Defines the type of request (e.g., POST, GET, PUT, DELETE) this method will handle. In this example, it's `POST`.

3. **Integration:** This section defines where the request should be sent—in this case, to a Lambda function. The `AWS_PROXY` integration type is commonly used, as it enables API Gateway to pass the request directly to Lambda, allowing the function to process the request and return a response.

4. **Method Responses:** Specifies the responses that API Gateway should expect from the Lambda function, such as 200 for success or 400 for a bad request.

5. **Resource and REST API References:** You’ll also need to reference the `rootResource` and `restApi` that were created in `Step 3` to ensure this method is properly attached to the API Gateway.

### Key Consideration: Lambda Function Naming
When setting the Lambda function as the target, it's critical to specify `AWS_PROXY` as the integration type and use the correct function URI. Here’s where it gets tricky: you need to reference the CloudFormation-generated name of the Lambda function, not the resource name you defined in the `serverless.yml.`

For instance, if your Lambda is named `createUser`, CloudFormation will create it with a name like `CreateUserLambdaFunction`. Therefore, you must reference it in this exact form in the integration section to avoid errors.

### Applying This to Other Methods
This explanation applies to all other methods (GET, PUT, DELETE) as well. Each method will follow a similar structure, with adjustments to the HTTP method and the target Lambda function.

By the end, your method definitions will look something like this in the YAML file:
![Step4allMethods](screenshots/Screenshot%202024-09-01%20at%203.11.39%20PM.png)

**Step 5:** Providing Invoke Permission for REST API Gateway
In AWS, security and permissions are paramount. For your API Gateway to successfully trigger a Lambda function, you must explicitly grant it the necessary invoke permissions. This is accomplished using the `AWS::Lambda::Permission`resource in the CloudFormation template.

In this project, these permissions are organized under the `resources/apiGateway/permission/` directory. Let me break down what each file in this directory does.

1. **Resource Type:** The resource type AWS::Lambda::Permission is used to grant the API Gateway permission to invoke a specific Lambda function.

2.**DependsOn:** This attribute ensures that the Lambda permissions are only applied after the REST API has been fully created. This guarantees that your API Gateway is properly set up before invoking the Lambda.

3. **Action:** The action specified is lambda:InvokeFunction, which allows the API Gateway to execute the Lambda function.

4. **FunctionName:** This is the name of the Lambda function you want to invoke. Make sure this matches the Lambda function you have defined earlier in your serverless.yml file.

5. **Principal:** The principal here is the API Gateway service, which is identified by apigateway.amazonaws.com. This means that only API Gateway can invoke the specified Lambda function using this permission.

Below is a screenshot of how this configuration should look:
![step5Invokepermission](screenshots/Screenshot%202024-09-02%20at%204.15.05%20PM.png)

And finally, within the `serverless.yml` file, your setup should be referenced as follows:
![step5Invoke](screenshots/Screenshot%202024-09-02%20at%204.14.36%20PM.png)

**Step 6:** Deploying the API Gateway to the DEV Stage
Congratulations! You've successfully created a REST API with the necessary resources and methods. Now it's time to deploy your API so that it can be accessed beyond the AWS Console. Once deployed, you can share the API endpoint with your frontend team, other developers, or even with friends.

The deployment process is meticulously defined in the r`esources/apiGateway/deployment/userRestApiDeployment.yml` file. Here’s what happens during the deployment:

1. **DependsOn Attribute**: The DependsOn attribute is used to ensure that all API methods are fully created before the deployment takes place. This guarantees that the API Gateway has all its resources properly configured and linked before making the API accessible.

2. **Stage Name:** During the deployment, you'll specify a stage name, such as `DEV`. This stage acts as an environment where your API can be tested or used. You can have multiple stages like `DEV`, `TEST`, or `PROD`, each representing a different environment with potentially different configurations.

3. **REST API Reference:** The deployment process references the REST API you previously created. This reference is crucial for correctly deploying the API to the specified stage and making it accessible via a public endpoint.

Below is a screenshot demonstrating how the deployment configuration looks:
![Step5deploy](screenshots/Screenshot%202024-09-01%20at%204.04.00%20PM.png)

Finally, in the `serverless.yml` file, the deployment resource is referenced as shown below:
![step5ymldeploy](screenshots/Screenshot%202024-09-01%20at%203.11.46%20PM.png)

## Deploy
To deploy your entire setup, simply run the command:
`sls deploy` 
Once the deployment is complete, your API will be live and ready for use.

## Conclusion
In this guide, we've walked through the process of creating and deploying a REST API in the Serverless Framework using a resource-based approach. By organizing the configuration into modular YAML files, we've maintained clarity and flexibility in our setup. This structure not only makes the deployment process smoother but also ensures that your API Gateway is properly configured with custom names, resources, methods, and stages. Now, your API is ready for use, whether it's for a frontend application or any other integration you need.
