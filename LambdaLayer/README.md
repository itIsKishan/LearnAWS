## Intorduction
Did you know that AWS Lambda has a 3MB limit for unzipped function packages when deploying inline code? If you're working on a larger project with numerous utilities and dependencies, you can quickly exceed this limit. As a result, you’ll lose the ability to edit your Lambda function directly in the AWS Console and will need to deploy every time you want to test changes.

This repository demonstrates how to efficiently organize your code and dependencies by utilizing Lambda Layers. By leveraging layers, you can separate common dependencies and utilities from your function code, keeping your Lambda packages lightweight and manageable.

Let’s explore how to structure your project and optimize your Lambda functions with the help of Lambda Layers!.

## About Lambda Layers
A Lambda layer is a .zip file archive that contains supplementary code or data. Layers usually contain library dependencies, a custom runtime, or configuration files.

There are multiple reasons why you might consider using layers:

  **1. To reduce the size of your deployment packages.** Instead of including all of your function dependencies along with your function code in your deployment package, put them in a layer. This keeps deployment packages small and organized.

  **2. To separate core function logic from dependencies.** With layers, you can update your function dependencies independent of your function code, and vice versa. This promotes separation of concerns and helps you focus on your function logic.

  **3. To share dependencies across multiple functions.** After you create a layer, you can apply it to any number of functions in your account. Without layers, you need to include the same dependencies in each individual deployment package.

  **4. To use the Lambda console code editor.** The code editor is a useful tool for testing minor function code updates quickly. However, you can’t use the editor if your deployment package size is too large. Using layers reduces your package size and can unlock usage of the code editor.

To Know More Read This: ![Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html)

  ### Layer paths for each Lambda runtime
  When creating Lambda layers, the folder structure you need to maintain for the JavaScript runtime is essential for ensuring that your dependencies are correctly referenced. For Node.js runtimes, here’s how you should structure your layer: for more runtime ![read this](https://docs.aws.amazon.com/lambda/latest/dg/packaging-layers.html#packaging-layers-paths) 

  | **Runtime**          | **Required Path for Dependencies**            |
  |----------------------|-----------------------------------------------|
  | Node.js 16.x         | `nodejs/node16/node_modules` (NODE_PATH)      |
  | Node.js 18.x         | `nodejs/node18/node_modules` (NODE_PATH)      |
  | Node.js 20.x         | `nodejs/node20/node_modules` (NODE_PATH)      |
  | Default (Node.js)    | `nodejs/node_modules`                         |

When AWS Lambda creates an execution environment for your function, it mounts your layer's contents in the `/opt` directory. This allows you to access your dependencies or utilities using the `/opt` prefix in your code. For example:
```
const { createRecord } = require('/opt/nodejs/utils/createRecord')
```

## File Structure
To maintain clarity and avoid overloading the `serverless.yml` file, I’ve organized the resources into separate folders. Below is the folder structure of the project:
```
├── layers/
│   ├── nodejs.zip
│   ├── nodejs/
│   │   ├── node_modules/
│   │   ├── utils/
│   │       └── createRecord.yml
├── resources/
│   ├── dynamoDB/
│   │   ├── userTable.yml
│   │   └── todoTable.yml
│   ├── lambda/
│   │   ├── userLambda/
│   │   │   └── createUserLambda.yml
│   │   ├── todoLambda/
│   │       └── createTodoLambda.yml
│   └── role/
│       └── role.yml
├── src/
│   ├── userLambda/
│   │   └── createUserLambda/
│   │       └── index.js
│   ├── todoLambda/
│   │   └── createTodoLambda/
│   │       └── index.js
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── serverless.yml
```
**1. layers/:** This folder contains reusable code (in this case, the node_modules and custom utilities) that can be shared across multiple Lambda functions. Layers reduce redundancy and centralize common logic.

  **1.1 nodejs.zip:** A zipped version of the nodejs folder, containing dependencies and utilities for Lambda layers.
  **1.2 node_modules/:** This subfolder contains the Node.js dependencies required for your Lambda functions.
  **1.3 utils/:** Custom utility files, such as `createRecord.yml`, which might be used across various Lambda functions for creating records in your services like DynamoDB.

**2. resources/:** This folder contains all the infrastructure-related configuration files for your AWS resources, including DynamoDB, Lambda, and IAM roles.
  **2.1 dynamoDB/:** This subfolder houses YAML templates defining DynamoDB tables.
    **2.1.1 userTable.yml:** Defines the schema and configuration for the `User` table.
    **2.1.2 todoTable.yml:** Defines the schema and configuration for the `Todo` table.

  **2.2 lambda/:** Contains YAML files defining individual Lambda function resources.
    **2.2.1 userLambda/:** Contains the configuration for `createUserLambda` that handles user-related operations.
    **2.2.2 todoLambda/:** Contains the configuration for `createTodoLambda` that handles todo-related operations.

  **2.3 role/:** This subfolder contains the configuration for the IAM role that grants necessary permissions to your Lambda functions.

**3. src/:** The source code for your Lambda functions lives here.
  **3.1 userLambda/:** Contains code for handling user-related operations.
    **3.1.1 createUserLambda/:** The folder for the user creation function.
  **3.2 todoLambda/:** Contains code for handling todo-related operations.
    **3.2.1 createTodoLambda/:** The folder for the todo creation function.

## Why Lambda Layer?
In this repository, our primary goal is to create records in a DynamoDB table. To achieve this, we need several packages, as listed below:
```
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.651.1",
    "@aws-sdk/lib-dynamodb": "^3.651.1",
    "jest": "^29.7.0",
    "uuid": "^10.0.0"
  }
```
With these dependencies, the total package size for a Lambda function could reach up to 10MB, which can lead to limitations in managing the function directly through the AWS console.
![Deploy](screenshots/Screenshot%202024-09-23%20at%203.33.52%20PM.png)
As shown in the image, once the package size exceeds certain limits, you may lose the ability to edit the function directly in the console:
![LambdaConsole](screenshots/Screenshot%202024-09-23%20at%203.34.18%20PM.png)

Given that we have two Lambda functions focused on creating user and todo records, there’s considerable overlap in the code required for creating records in DynamoDB. If additional Lambda functions are introduced for similar data creation tasks, we risk duplicating code, which can lead to maintenance challenges.

To address this, we can create a common utility function for record creation. Here’s an example of how that code looks:
```
// import the required libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// create a new DynamoDB client and a new DynamoDBDocumentClient so you can do CRUD operation on table
const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

const createRecord = async (tableName, data) => {
    try {

        const params = new PutCommand({
            TableName: tableName,
            Item: {
                ...data,
                isDeleted: 'false',
            },
            ReturnValues: 'ALL_OLD'
        })
        const response = await dbClient.send(params);
        console.log('[INFO] record created successfully: ', response)
        return response;
    } catch (error) {
        console.log('[ERROR] Error while creating record: ', error)
        throw error;
    }
}

module.exports = {
    createRecord,
}
```
By incorporating this function into your Lambda, you can easily create records by simply calling it with the required `tableName` and `data`. This approach streamlines the code and enhances maintainability.

By utilizing Lambda Layers to package the `node_modules` and this common utility code, we can significantly reduce the package size from 10MB to just 51KB.
![lambdaLayer](screenshots/Screenshot%202024-09-23%20at%203.29.45%20PM.png)
And as a result, you regain the option to edit your function directly in the console!
![consoleLambda](screenshots/Screenshot%202024-09-23%20at%203.29.10%20PM.png)

In this way, we have effectively leveraged all the benefits of Lambda Layers discussed in the previous section.

## Explanation Of YAML's

### Step1: Creating a required Lambda to create User & Todo
In this step, we’ll create two Lambda functions: one for creating a user and another for creating a todo task. This modular approach allows for clear separation of concerns in our application.
![step1Lambda](screenshots/Screenshot%202024-09-23%20at%204.48.52%20PM.png)
The YAML definitions for these functions are located in:
  1. `resources/lambda/userLambda/createUserLambda.yml`
  2. `resources/lambda/todoLambda/createTodoLambda.yml`
In these files, we define the Lambda configurations, including the function name, description, timeout settings, memory size, and the role assigned to allow the Lambda to perform the create actions. Additionally, we specify an event to trigger the function from the API Gateway.
```
name: createTodo
handler: src/todoLambda/createTodoLambda/index.handler
description: Create user task using SDK Version 3 method
timeout: 30
memorySize: 512
layers: #referring the layer to the lambda function
  - !Ref UserLambdaLayer
role: userLambdaRole
events: 
  - http:
      path: /createTodo
      method: POST
      cors: true
```

### Step2: Create Table to store user & todo record
With the required Lambdas in place, it’s essential to have corresponding tables for data storage.
![Step2DDB](screenshots/Screenshot%202024-09-23%20at%204.49.10%20PM.png) 
The YAML definitions for the tables are found in:
  1. resources/dynamoDB/userTable.yml
  2. resources/dynamoDB/todoTable.yml
In these definitions, we create tables with specific names and partition keys, such as `todoId` for todos and `userId` for users.
```
Type: AWS::DynamoDB::Table
Properties:
  TableName: userTable
  BillingMode: PAY_PER_REQUEST
  AttributeDefinitions:
    - AttributeName: userId
      AttributeType: S
  KeySchema:
    - AttributeName: userId
      KeyType: HASH

```

### Step3: Create a Role
Next, we need to create a role that grants the necessary permissions for both Lambdas to perform the PutItem action, allowing them to store user and todo data. and the yaml definition exists in `resources/role/role.yml`
![Step3Role](screenshots/Screenshot%202024-09-23%20at%204.49.19%20PM.png)

### Step4: Lambda Layer
Finally, we reach the core aspect of this repository: the Lambda Layers.
![Step4LambdaLayer](screenshots/Screenshot%202024-09-23%20at%204.49.29%20PM.png)
```
  user:
    package: #referring the zip file as artifact
      artifact: layers/nodejs.zip
    name: ${self:provider.stage}-user #name of the layer
    compatibleRuntimes: #compatible runtimes
      - nodejs18.x
    compatibleArchitectures: #compatible architectures
      - x86_64
      - arm64
```
Explanation of Each Attribute
  **1. user:** This is the logical name for the layer. You can choose any name here, but it’s often helpful to use something descriptive.

  **2. package:** This section specifies the package settings for the layer.

    **2.1 artifact:** The path to the zipped file that contains your layer's code and dependencies. In this case, `layers/nodejs.zip` refers to the zip file that has been created and will be used as the content for this layer.

  **2. name:** This attribute defines the name of the layer. The value `${self:provider.stage}-user` indicates that the layer name will dynamically include the deployment stage (like `dev`, `prod`, etc.), followed by `-user`. This is useful for distinguishing between different environments.

  **3. compatibleRuntimes:** This section specifies which runtimes are compatible with this layer. In this case, nodejs18.x indicates that the layer can be used with `Node.js 18.x` Lambda functions. You can specify multiple runtimes if your layer supports them.

  **4. compatibleArchitectures:** This attribute defines the architectures that are supported by the layer. Specifying both `x86_64` and `arm64` means that the layer can be used in Lambda functions running on either of these architectures, offering flexibility depending on your deployment needs.

By structuring your layer this way, you ensure that your Lambda functions can access shared code and dependencies efficiently, enhancing maintainability and reducing deployment package sizes.

## How To Create Lambda Layer
In Step 4, we referenced the artifact layers/nodejs.zip, but you might be wondering how we arrived at that. To create this zip file, follow these steps:
```
├── layers/
│   ├── nodejs.zip
│   ├── nodejs/
│   │   ├── node_modules/
│   │   ├── utils/
│   │       └── createRecord.yml
```
### Step-by-Step Process
  **1. Create the Layers Folder:** Start by creating a layers folder at the root level of your project. This folder will contain all your Lambda Layer files.

  **2. Create the Node.js Folder:** Inside the layers folder, create a subfolder named nodejs. This naming convention is required for the Node.js runtime, as it tells AWS Lambda where to find the dependencies. For more Info about folder Name referr the ![article](https://docs.aws.amazon.com/lambda/latest/dg/packaging-layers.html#packaging-layers-paths)

  **3. Add Dependencies:** Within the nodejs folder, paste your node_modules directory. Here, you can include all necessary dependencies required by your Lambda functions. This helps keep your function package size smaller by allowing you to share these dependencies across multiple functions.

  **4. Create Utility Functions:** You can also create a utils folder within the nodejs directory to store any utility files you may need. For example, for our use case created a  file called createRecord.js inside the utils folder. which will create record in dynamodb table

  **5. Zip the Folder:** Once you have all the required code and dependencies in place, navigate to the layers directory and create a zip file of the nodejs folder. The resulting file should be named nodejs.zip and will be saved in the layers folder.

  After zipping the folder, your nodejs.zip file will be ready for use when creating your Lambda Layer. This structured approach ensures that your layers are well-organized and compliant with AWS Lambda requirements, making it easier to manage your dependencies efficiently.

Once done we need to referr this created layer in the lambda as below:
```
layers: #referring the layer to the lambda function
  - !Ref UserLambdaLayer
```

## Deploy
To deploy your entire setup, simply run the command:
`sls deploy` 
Once the deployment is complete, your API will be live and ready for use.

## Conclusion
This repository demonstrates the effective use of AWS Lambda Layers to manage dependencies and utility functions, streamlining the development and deployment of serverless applications. By structuring your project thoughtfully, you can significantly reduce the size of your deployment packages, enhance code maintainability, and improve your workflow within the AWS console.

We explored how to create a common utility function for record creation, which not only minimizes code duplication but also allows multiple Lambda functions to share the same logic efficiently. The use of Lambda Layers facilitates this sharing and ensures that updates to dependencies can be managed independently from function code.

By following the guidelines and structure outlined in this README, you can leverage the power of AWS Lambda and its features to build scalable and efficient applications. Whether you're creating user records, todo items, or other data types, this approach lays a solid foundation for your serverless architecture.

Feel free to explore, modify, and expand upon this setup to suit your own needs!