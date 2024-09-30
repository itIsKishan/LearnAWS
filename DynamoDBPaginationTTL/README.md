## Introduction
You have a large e-commerce with tons of order details stored in DynamoDB?, and once the order is completed, it will be cost to have keeping it write? to fix it we can make use of DynamoDB TTL, and you have large number of orders per user, and you only want to show case the result in pages? then yes you cna achieve both with the DynamoDB TTL & PaginatedQuery,

## Scenario
Imagine you are managing an e-commerce website that processes a vast number of orders daily. Each order contains crucial details such as the items purchased, order status, and customer information. Typically, an order is completed within 14 days, and retaining these records beyond a certain point can lead to unnecessary storage costs and clutter in your database.

To optimize storage and maintain efficiency, you decide to implement a strategy that deletes order records after 90 days. This approach ensures that only relevant and recent data is retained in your database, while older records are safely archived. Before deleting these records, you can store them in Amazon S3, providing an option for retrieval if needed in the future. This allows you to maintain compliance with data retention policies without sacrificing access to historical order information.

Additionally, when it comes to retrieving order details for a particular user, you may find that some users have placed more than 100 orders. In such cases, an infinite scroll would not be practical or user-friendly. Instead, implementing pagination allows users to navigate through their order history efficiently, viewing a set number of orders per page. This not only enhances the user experience but also optimizes the performance of your application.

In this project, we will learn how to leverage AWS services such as DynamoDB for efficient data storage, implement Time to Live (TTL) to automate record deletion, and use pagination to manage and display order details effectively. Let's dive in and explore how to build a robust system that meets these requirements on AWS!


## File Structure
To maintain clarity and avoid overloading the `serverless.yml` file, I’ve organized the resources into separate folders. Below is the folder structure of the project:
```
├── resources/
│   ├── dynamoDB/
│   │   └── orderTable.yml
│   ├── lambda/
│   │   ├── createOrderWithTTLLambda.yml
│   │   ├── retrievePaginatedOrderWithTTLLambda.yml
│   │   └── updateOrderByTTLLambda.yml
│   └── role/
│       └── role.yml
├── src/
│   ├── TTL/
│   │   ├── createOrderWithTTLLambda.js
│   │   ├── retrievePaginatedOrdersWithTTLLambda.js
│   │   └── updateOrderByTTLLambda.js
│   └── Utils/
│       └── getTime.js
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── serverless.yml
```
**1. resources/:** This folder contains all the infrastructure-related configuration files for AWS resources, including DynamoDB, Lambda functions, and IAM roles.

  - **1.1 dynamoDB/:** This subfolder contains the configuration for the DynamoDB table used in the project.
    - **orderTable.yml:** Defines the schema and configuration for the `Order` table, which includes TTL for managing item expiration.
  
  - **1.2 lambda/:** This folder contains the YAML files defining the configuration for the Lambda functions used in the project.
    - **createOrderWithTTLLambda.yml:** Configures the Lambda function that creates orders with TTL (Time to Live) enabled.
    - **retrievePaginatedOrderWithTTLLambda.yml:** Configures the Lambda function for retrieving paginated orders using TTL.
    - **updateOrderByTTLLambda.yml:** Configures the Lambda function for updating orders based on TTL settings.

  - **1.3 role/:** This subfolder contains the IAM role configuration, granting the necessary permissions for the Lambda functions to interact with other AWS services like DynamoDB.

**2. src/:** The source code for the Lambda functions is organized here. The code is separated into `TTL` and `Utils` folders for better modularity.

  - **2.1 TTL/:** This folder contains the JavaScript code for handling the creation, retrieval, and updating of orders with TTL.
    - **createOrderWithTTLLambda.js:** Contains the logic for creating new orders in the `Order` table, with TTL enabled to handle expiration.
    - **retrievePaginatedOrdersWithTTLLambda.js:** Handles the retrieval of paginated order data, considering the TTL settings for expired records.
    - **updateOrderByTTLLambda.js:** Updates existing orders, managing TTL-based expiration as necessary.

  - **2.2 Utils/:** This folder holds utility functions that are used across the Lambda functions.
    - **getTime.js:** Contains helper functions, such as fetching the current timestamp, used for managing TTL and time-sensitive operations.

## Explanation Of YAML's
**Step1: Create Lambda Functions To Perform Create, Update & paginated query**
![step1](screenshots/Screenshot%202024-09-29%20at%2010.38.08%20PM.png)
### 1. Create Order Lambda Function
This function is responsible for creating an order in the DynamoDB table. 
```
name: createOrderWithTTLLambda
description: creates an order
handler: src/TTL/createOrderWithTTLLambda.handler
timeout: 30
memorySize: 128
role: userOrderRole
environment:
  ORDER_TABLE_NAME: orderTable
events:
  - http:  
      path: /createOrder
      method: post
      cors: true
```
- **Name:** `createOrderWithTTLLambda`
  - This is the unique identifier for the Lambda function.
- **Description:** 
  - A brief explanation of the function's purpose, which is to create an order.
- **Handler:** 
  - Specifies the file path and the exported function that will handle the request. In this case, it points to `src/TTL/createOrderWithTTLLambda.handler`.
- **Timeout:** 
  - Sets the maximum time (in seconds) that the function is allowed to run. Here, it is set to 30 seconds.
- **Memory Size:** 
  - Defines the amount of memory allocated to the function, which is set to 128 MB in this case.
- **Role:** 
  - The IAM role assigned to this function (`userOrderRole`), granting the necessary permissions to perform actions on AWS resources.
- **Environment Variables:** 
  - The `ORDER_TABLE_NAME` environment variable is used to specify the name of the DynamoDB table (`orderTable`).
- **Events:** 
  - Specifies the triggers for this function. It listens for HTTP events:
    - **Path:** `/createOrder`, the API endpoint that invokes this function.
    - **Method:** `POST`, the HTTP method that triggers the function.
    - **CORS:** Indicates that Cross-Origin Resource Sharing is enabled for this function.

### 2. Update Order Lambda Function
This function updates the Time to Live (TTL) attribute of an existing order in DynamoDB.

```
name: updateOrderByTTLLambda
description: updates the TTL of an order
handler: src/TTL/updateOrderByTTLLambda.handler
timeout: 30
memorySize: 128
role: userOrderRole
environment:
  ORDER_TABLE_NAME: orderTable
events:
  - http:
      path: /updateOrderTTL
      method: post
      cors: true
```
- **Name:** `updateOrderByTTLLambda`
  - The unique identifier for this Lambda function.
- **Description:** 
  - This function's purpose is to update the TTL of an order.
- **Handler:** 
  - Points to `src/TTL/updateOrderByTTLLambda.handler` to specify the function to be executed.
- **Timeout:** 
  - Set to 30 seconds, limiting the maximum execution time of the function.
- **Memory Size:** 
  - Allocated memory for this function is 128 MB.
- **Role:** 
  - The IAM role assigned to this function (`userOrderRole`), which grants necessary permissions.
- **Environment Variables:** 
  - `ORDER_TABLE_NAME` is set to `orderTable` for identifying the DynamoDB table.
- **Events:** 
  - Triggers for this function include:
    - **Path:** `/updateOrderTTL`, the endpoint for invoking this function.
    - **Method:** `POST`, the HTTP method that triggers the function.
    - **CORS:** Enables Cross-Origin Resource Sharing for this endpoint.

### 3. Paginated Query Lambda Function
This function retrieves orders from DynamoDB in a paginated manner.

```
name: retrievePaginatedOrdersWithTTLLambda
description: paginates orders
handler: src/TTL/retrievePaginatedOrdersWithTTLLambda.handler
timeout: 30
memorySize: 128
role: userOrderRole
environment:
  ORDER_TABLE_NAME: orderTable
events:
  - http:
      path: /retrievePaginatedOrderWithTTL
      method: get
      cors: true
```
- **Name:** `retrievePaginatedOrdersWithTTLLambda`
  - The unique identifier for the paginated query function.
- **Description:** 
  - This function's purpose is to paginate through orders stored in DynamoDB.
- **Handler:** 
  - Specifies the file path for the handler function, pointing to `src/TTL/retrievePaginatedOrdersWithTTLLambda.handler`.
- **Timeout:** 
  - The function is allowed a maximum execution time of 30 seconds.
- **Memory Size:** 
  - Allocated memory for this function is also 128 MB.
- **Role:** 
  - The IAM role for this function is `userOrderRole`, granting necessary permissions to access AWS resources.
- **Environment Variables:** 
  - The `ORDER_TABLE_NAME` environment variable specifies the `orderTable`.
- **Events:** 
  - The function is triggered by HTTP events:
    - **Path:** `/retrievePaginatedOrderWithTTL`, the API endpoint for this function.
    - **Method:** `GET`, indicating that this function responds to GET requests.
    - **CORS:** Cross-Origin Resource Sharing is enabled for this endpoint.



**Step2:Create DynaomDB Table**
In this step, we will create a DynamoDB table that will store order details. The configuration for the table is as follows:
![step2](screenshots/Screenshot%202024-09-29%20at%2010.38.15%20PM.png)
```
Type: AWS::DynamoDB::Table
Properties:
  TableName: orderTable
  BillingMode: PAY_PER_REQUEST
  AttributeDefinitions:
    - AttributeName: orderId
      AttributeType: S
    - AttributeName: userId
      AttributeType: S
  KeySchema: #Primary Key: orderId
    - AttributeName: orderId
      KeyType: HASH
  GlobalSecondaryIndexes: #GSI: creating userIdIndex to fetch order details of specific user
    - IndexName: userIdIndex
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
      Projection:
        ProjectionType: ALL
  TimeToLiveSpecification: #TTL: to set the TTL for the item in the table
    AttributeName: expiresAt #attribute: used to set the TTL
    Enabled: true
```
### Table Configuration

- **Type:** 
  - `AWS::DynamoDB::Table` 
  - This specifies that we are creating a DynamoDB table.

### Properties:

- **TableName:** 
  - `orderTable` 
  - The name of the DynamoDB table where order details will be stored.

- **BillingMode:** 
  - `PAY_PER_REQUEST` 
  - This billing mode allows you to pay only for the read and write requests that you actually make, making it cost-effective for unpredictable workloads.

- **AttributeDefinitions:** 
  - This section defines the attributes for the table. In this case, we have two attributes:
    - **AttributeName:** `orderId`
      - **AttributeType:** `S` (String)
      - This attribute serves as the primary key for the table.
    - **AttributeName:** `userId`
      - **AttributeType:** `S` (String)
      - This attribute is used to associate orders with specific users.

- **KeySchema:** 
  - This section defines the primary key of the table:
    - **AttributeName:** `orderId`
      - **KeyType:** `HASH`
      - The `orderId` serves as the partition key for the table.

- **GlobalSecondaryIndexes:** 
  - This section defines a Global Secondary Index (GSI) to enable efficient querying based on a different attribute:
    - **IndexName:** `userIdIndex`
      - This index allows us to fetch order details for a specific user.
      - **KeySchema:**
        - **AttributeName:** `userId`
          - **KeyType:** `HASH`
          - The `userId` serves as the partition key for this index.
      - **Projection:**
        - **ProjectionType:** `ALL`
        - This means all attributes from the items will be projected into the index.

- **TimeToLiveSpecification:** 
  - This section configures the Time to Live (TTL) for items in the table:
    - **AttributeName:** `expiresAt`
      - This attribute is used to set the TTL for the items in the table.
    - **Enabled:** `true`
      - This enables TTL, allowing DynamoDB to automatically delete items after the specified expiration time.


**Step3: Role**
In this step, we will define an IAM role that allows the Lambda functions to perform operations on the DynamoDB table. This role grants the necessary permissions for the Lambda functions to read and write data in DynamoDB.
![step3](screenshots/Screenshot%202024-09-29%20at%2010.38.26%20PM.png)
The role configuration is specified in the `resources/role/role.yml` file. This YAML file includes the necessary permissions and trust policy to ensure that the Lambda functions can access the DynamoDB table effectively.

## Explanation Of Code
The folder structure for the code is organized as follows:
```
├── src/
│   ├── TTL/
│   │   ├── createOrderWithTTLLambda.js
│   │   ├── retrievePaginatedOrdersWithTTLLambda.js
│   │   └── updateOrderByTTLLambda.js
│   └── Utils/
│       └── getTime.js
```

### `utils/getTime.js`
This utility file helps calculate the current time and the expiration time for setting TTL (Time to Live) in the DynamoDB table.

This function, getCurrentTime(), converts the current time to epoch seconds. It’s useful for setting timestamps when an order is created.
```
// get the current time in milliseconds
const currentTime = new Date().getTime();

const getCurrentTime = () => {
    // converting the current time to epoch second format
    const createdAt = Math.floor(currentTime / 1000) 
    return createdAt;
}
```
To calculate the expireAt time, which defines when the TTL will delete the record, you use this function:
```
const getExpireAt = (days) => {
    // setting the expireAt attribute to 90 days from the current time
    const expireAt = Math.floor((currentTime + days * 24 * 60 * 60 * 1000) / 1000);
    return expireAt;
}
```
The getExpireAt() function calculates the expiration time for the TTL attribute by adding a specified number of days to the current time.

### TTL/createOrderWithTTLLambda.js
This Lambda function is used to create an order in DynamoDB with a TTL. The TTL attribute, expiresAt, will be set to 90 days from the order creation time.
```
// Extract the orderData from the event
const orderData = JSON.parse(event.body);
// get the current time
const createdAt = getCurrentTime();
// get the expire time for 90 days
const expiresAt = getExpireAt(90)
```
Next, the order data is prepared with the createdAt, expiresAt, and orderId fields:
```
const params = new PutCommand({
    TableName: process.env.ORDER_TABLE_NAME,
    Item: {
        ...orderData,
        orderId: v4(),
        createdAt,
        expiresAt
    }
})
```
and once all done we need to send the db request to create the record
```
const response = await dbClient.send(params);
```
After successful execution, the order is created with a TTL of 90 days. Once that time passes, the order will be automatically deleted.

### TTL/updateOrderByTTLLambda.js
When updating order details (e.g., adding a phone number), the function ensures that the order’s TTL is still valid before updating. The TTL is extended for another 90 days on each update.
```
const { phone } = JSON.parse(event.body);
const { orderId } = event.queryStringParameters;

// get the current time and expires time set to 90 days
const updatedAt = getCurrentTime();
const expiresAt = getExpireAt(90);
```
The UpdateCommand prepares the update operation with a condition to check if the TTL has expired:
```
const params = new UpdateCommand({
    TableName: process.env.ORDER_TABLE_NAME,
    Key: {
        orderId
    },
    ConditionExpression: '#expiresAt > :updatedAt', //TTL: Check if the order is expired, if it is expired then return 400 status code or else update the order
    UpdateExpression: 'SET #contactDetails.#phone = :phone, #updatedAt = :updatedAt, #expiresAt = :expiresAt',
    ExpressionAttributeNames: { 
        '#contactDetails': 'contactDetails',
        '#phone': 'phone',
        '#updatedAt': 'updatedAt',
        '#expiresAt': 'expiresAt'
    },
    ExpressionAttributeValues: {
        ':phone': phone,
        ':updatedAt': updatedAt,
        ':expiresAt': expiresAt
    },
    ReturnValues: "ALL_NEW",
});
```
so to do that we use ConditionExpression to make sure, where we use the currentTime to check if expiresAt is greater than current time if it is true then order info is updated , if it is false an error is thrown and a error message is returned
```
ConditionExpression: '#expiresAt > :updatedAt',
```
while we update the contactDetails of the user along with we update the updatedAt and expiresAt time as well using the UpdateExpression
```
UpdateExpression: 'SET #contactDetails.#phone = :phone, #updatedAt = :updatedAt, #expiresAt = :expiresAt',
```
and then we need to send a request to DDB to update the order as below
```
const response = await dbClient.send(params);
```
If the order has expired, a conditional error (ConditionalCheckFailedException) will be thrown, and a 400 status code will be returned:
```
if(error.name === 'ConditionalCheckFailedException') {
    return {
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
        },
        statusCode: 400,
        body: JSON.stringify('Order is expired')
    };
};
```

### TTL/retrievePaginatedOrdersWithTTLLambda.js
This function retrieves orders for a user using pagination and ensures that expired orders are not included in the result.
```
const { userId } = event.queryStringParameters;
const expiresAt = getCurrentTime()
const paginatedOrders = [];
const params = {
    TableName: process.env.ORDER_TABLE_NAME,
    IndexName: 'userIdIndex', //GSI: Use the userIdIndex to query the orders based on userId
    FilterExpression: 'expiresAt > :expiresAt', //TTL: Check if the order is expired, if it is expired then return 400 status code or else update the order
    KeyConditionExpression: "userId = :userId", 
    ExpressionAttributeValues: {
        ':userId': userId,
        ':expiresAt': expiresAt,
    },
    Limit: 100, //Limit: Limit the number of items to be returned per page
}
```
The query uses the Global Secondary Index (GSI) userIdIndex to fetch the orders for the specified user, and the FilterExpression ensures only non-expired orders are retrieved:
```
IndexName: 'userIdIndex',
```
and to make sure those orders are not expired we make use of FileterExpression to check for it
```
FilterExpression: 'expiresAt > :expiresAt',
```
KeyConditionExpression is where we check for the userId
```
KeyConditionExpression: "userId = :userId", 
```
and next step is to use the paginatedQuery to get the query result, the first params is client for which we need to send the dbclinet, and then the params that we preapred in the above step
```
const paginatedResponse = paginateQuery({client: dbClient}, params);
```
once we get the result we need to loop through the paginatedResponse which is async so we use await for each individual objects and then attach the Items to our array to send back the response
```
for await (const paginatedObject of paginatedResponse) {
    console.log('[INFO] paginatedObject', paginatedObject)
    paginatedOrders.push(paginatedObject.Items);
}
```
## Conclusion
This solution effectively handles order creation with a TTL, updates order details while checking TTL status, and retrieves user orders using pagination. By leveraging DynamoDB's TTL and pagination, you can efficiently manage storage and retrieval of large datasets, improving both performance and cost-effectiveness.