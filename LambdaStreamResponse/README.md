## Introduction
Imagine you have a large dataset, say 6 MB, stored in DynamoDB. You send a request to retrieve it, but end up waiting for 30 seconds to get the result. Frustrating, right?

Now, what if I told you that you could view the first chunk of that data (6 MB) in just 3-4 seconds, and the entire 14 MB dataset in as little as 12 seconds? Sounds interesting, doesn’t it?

This README explores an efficient way to handle large datasets in DynamoDB, providing faster data retrieval using streaming techniques. You’ll learn how to break down large responses into smaller, more manageable chunks, significantly reducing wait times while improving the user experience.

## Lambda Stream Response
AWS Lambda allows you to configure function URLs to stream response payloads back to clients in real-time. This capability significantly improves latency-sensitive applications by enhancing **Time to First Byte (TTFB)** performance. Instead of waiting for the entire response to be generated, you can send partial responses to the client as soon as they are ready, creating a more efficient and responsive experience.

Streaming is particularly beneficial when dealing with larger payloads. While traditional buffered responses have a 6 MB limit, response streaming supports payloads of up to 20 MB. By streaming responses, your Lambda function also avoids the need to load the entire payload into memory, which helps reduce memory consumption and can be especially useful when handling large datasets.

In summary, response streaming provides several key advantages:

1. **Improved performance:** Faster TTFB by sending data incrementally.
2. **Handling larger payloads:** Stream up to 20 MB, well beyond the 6 MB limit for buffered responses.
3. **Lower memory usage**: The function doesn’t need to hold the entire response in memory, reducing resource costs for large datasets.

Learn More here: [Lambda Stream Response Doc](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html)

## Folder Structure
To maintain clarity and avoid overloading the `serverless.yml` file, I’ve organized the resources into separate folders. Below is the folder structure of the project:
```
/
├── resources/
│   ├── dynamoDB/
│   │   └── streamUserTable.yml
│   ├── lambda/
│   │   ├── lambdaCreation/
│   │   │   ├── bufferLambda.yml
│   │   │   └── streamLambda.yml
│   │   ├── lambdaURL/
│   │   │   └── streamLambdaURL.yml
│   │   ├── lambdaURLPermission/
│   │   │   └── streamLambdaURLInvokePermission.yml
│   └── role/
│       └── role.yml
├── streamLambdas/
│   ├── bufferLambdaResponse.js
│   └── streamLambdaResponse.js
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── serverless.yml
```
Each folder is dedicated to a specific component of the architecture:

### resources/
This folder contains YAML configurations for creating and managing AWS resources like DynamoDB tables, Lambda functions, and IAM roles.

  1. **resources/dynamoDB/streamUserTable.yml:** Defines the configuration for a DynamoDB table (stream-user-table) used to store user data. This file contains table attributes, provisioned throughput, and stream configuration.

  2. **resources/lambda/:** This folder manages various Lambda-related configurations.

    2.1 **lambdaCreation/:** Contains the YAML files for creating Lambda functions:
      2.1.1 **bufferLambda.yml:** Defines the Lambda function that handles buffering responses from DynamoDB.
      2.1.2 **streamLambda.yml:** Defines the Lambda function that streams responses from DynamoDB.

    2.2 **lambdaURL/:** Contains the Lambda URL configuration:
      2.2.1 **streamLambdaURL.yml:** Sets up an HTTP URL endpoint for the streamLambda function, allowing it to be invoked directly via a URL.

    2.3 **lambdaURLPermission/:** Grants permissions for invoking Lambda functions via URLs:
      2.3.1 **streamLambdaURLInvokePermission.yml:** Grants the necessary permissions for API Gateway or other services to invoke the streamLambda function using the Lambda URL.

  3. **resources/role/role.yml:** Defines IAM roles and their policies, specifying permissions required for the Lambda functions, DynamoDB, and other resources to operate securely.

### streamLambdas/
This folder contains the actual Lambda function code used for interacting with DynamoDB in a streaming manner.

  1. **streamLambdas/bufferLambdaResponse.js:** JavaScript code for the bufferLambda function, which retrieves and buffers DynamoDB data before returning the response.

  2. **streamLambdas/streamLambdaResponse.js:** JavaScript code for the streamLambda function, which streams data from DynamoDB in real-time, providing a faster response to clients.

## Explanationn of the YAML's
**Step1:** Creatinfg the Buffer & Stream Lambda.
The first step involves creating the Lambda functions that will handle buffering and streaming of responses. This setup is crucial for the functionality described in our project.
![step1Lambda](screenshots/Screenshot%202024-09-06%20at%2010.20.05%20PM.png)
In the YAML configuration files located in the **resources/lambda/lambdaCreation** directory, you will find definitions for two Lambda functions: `bufferLambda.yml` and `streamLambda.yml.` Here’s a breakdown of what each file contains:
1. **name:** Each file defines a Lambda function with a specific name:

  1.1 `bufferLambda.yml` specifies the function name as `bufferResponseLambda.`
  1.2 `streamLambda.yml` specifies the function name as `streamResponseLambda.`

2. **description:** Provides a description of what each Lambda function does:

  **2.1 bufferLambda.yml** describes the function as buffering the response from Lambda.
  **2.2 streamLambda.yml** describes the function as streaming the response from Lambda.

3. **handler:** Indicates the file and function that AWS Lambda should invoke:

  **3.1 bufferLambda.yml** specifies `streamLambdas/bufferLambdaResponse.`handler, meaning the handler function is located in `bufferLambdaResponse.js` within the streamLambdas directory.
  **3.2 streamLambda.yml** specifies `streamLambdas/streamLambdaResponse.`handler, indicating the handler function is located in `streamLambdaResponse.js` within the same directory.

4. **runtime & timeout:** Defines the execution environment and limits for each Lambda:

Both files set the timeout to 30 seconds, which is suitable for processing and responding within a reasonable time frame.

5. **role:** The streamLambdaRole defines the permissions and roles the Lambda function will assume when it runs. This role ensures the Lambda can interact with necessary AWS resources.

6. **events:** Configures the events that trigger the Lambda functions:

  In `bufferLambda.yml`, an HTTP event is defined to trigger the Lambda function. This is necessary because we use API Gateway to handle incoming requests for buffering.

  For `streamLambda.yml`, the event configuration is not included because the function will be accessed via a Lambda URL for direct streaming. This setup simplifies access and enhances security by allowing direct function invocation.

**Step2:** Creating DynamoDB To store User Data
The next step involves setting up a DynamoDB table to store user data. This table will be essential for managing and retrieving the 14MB of data required for stream responses.
![Step2DDB](screenshots/Screenshot%202024-09-08%20at%2010.20.02%20PM.png)
The YAML configuration file for this setup is located in the `resources/dynamoDB` directory and is named `streamUserTable.yml`. Here’s a detailed breakdown of the configuration:

**1. Type: AWS::DynamoDB::Table**
Specifies that the resource being created is a DynamoDB table.

2. **Properties:**

  **2.1 TableName:** stream-user-table
  Defines the name of the table as stream-user-table. This name is used to reference the table within the application.

  **2.2 BillingMode:** PAY_PER_REQUEST
  Sets the billing mode to PAY_PER_REQUEST. This means that you pay only for the read and write operations that you perform on the table, rather than provisioned capacity.

  **2.3 AttributeDefinitions:**
  AttributeName: userId
  AttributeType: S
  Defines an attribute named userId with type S (String). This attribute will be used to uniquely identify each record in the table.

  **2.4 KeySchema:**
  AttributeName: userId
  KeyType: HASH
  Configures userId as the partition key (HASH key). This is the primary key for the table and is used to uniquely identify each item.

**Step3:** Creating Role for lambda to perform scan operation on dynamoDB
next step is to give required permission to the lambda so that it will be able to perfrom the scan operation on the dynaomdb table created in step2
![step3Role](screenshots/Screenshot%202024-09-08%20at%2010.20.15%20PM.png)
the yaml exists in resource/role with name role.yml
where we give scan perfmission to the lambda

**Step4:** Creating Lambda URL With Invoke Permission
Now, we come to one of the most crucial parts of this repository — creating a Lambda URL for the `streamResponseLambda` function, enabling users to access it directly without going through API Gateway.
![step4URL](screenshots/Screenshot%202024-09-08%20at%2010.20.44%20PM.png)

In this step, we will configure two YAML files under the `resources/lambda/lambdaURL` and `resources/lambda/lambdaURLPermission` directories:

**1. Defining the Lambda URL (streamLambdaURL.yml):**
This file is located under `resources/lambda/lambdaURL` and defines the Lambda URL using the **AWS::Lambda::Url** resource.

**1. AuthType:** Set to NONE, as we are not requiring any authentication for this Lambda URL.

**2. InvokeMode:** To allow streaming, this is set to `RESPONSE_STREAM`, enabling the Lambda function to stream responses directly.

**3. TargetFunctionArn:** This is the ARN of the Lambda function for which the URL is being created. Here, `StreamLambdaResponseLambdaFunction `is used as the target function.
```
Type: AWS::Lambda::Url # Define the Lambda URL
Properties:
  AuthType: NONE # No authentication is required for this Lambda URL
  InvokeMode: RESPONSE_STREAM # Enable streaming of Lambda responses
  TargetFunctionArn: !GetAtt StreamLambdaResponseLambdaFunction.Arn # The target function ARN
```

**2. Granting Invoke Permissions (streamLambdaURLInvokePermission.yml):**
This file exists in `resources/lambda/lambdaURLPermission` and grants the necessary permissions to invoke the Lambda function via the created URL.

**1. FunctionURLAuthType:** Set to NONE, meaning no authentication is required for invoking this Lambda URL.

**2. Action:** The action `lambda:InvokeFunctionUrl` allows the Lambda function to be invoked through its URL.

**3. FunctionName:** Specifies the Lambda function `(StreamLambdaResponseLambdaFunction)` for which we are granting URL invocation permissions.

**4. Principal:** Set to *, allowing anyone to invoke this Lambda URL.

```
Type: AWS::Lambda::Permission # Define the permission for the Lambda URL invocation
Properties:
  FunctionUrlAuthType: NONE # No authentication required for invoking this Lambda URL
  Action: lambda:InvokeFunctionUrl # Allow invoking the function URL
  FunctionName: !Ref StreamLambdaResponseLambdaFunction # The Lambda function to be invoked
  Principal: '*' # Allow invocation from any principal
```

By setting up the Lambda URL and its permissions, we ensure that users can directly access the `streamResponseLambda` without API Gateway, allowing for faster and more secure interactions.

## Explanation of the Stream Lambda Code
I won’t go into detail about the file `bufferLambdaResponse.js` because it performs a simple scan operation on DynamoDB. Instead, let’s focus on `streamLambdaResponse.js`, where the main task is to make the Lambda function stream its response.

**How the Streaming Works**
To enable a Lambda to stream responses, we use the `awslambda.streamifyResponse()` function. This function takes an asynchronous handler as a parameter, and it provides three arguments to that function: `event`, `responseStream`, and `_context`.


```
awslambda.streamifyResponse(async (event, responseStream, _context) => {})
```

  **1.Preparing Metadata:**
  We start by preparing the metadata, which includes the statusCode and headers. This metadata is required for the awslambda.HttpResponseStream object.

  ```
  const metaData = {
    statusCode: 200,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
  }
  ```

  **2. Initializing the Response Stream:**
  We initialize the response stream using `awslambda.HttpResponseStream.from()`, passing both the responseStream and the metadata.

  ```
  responseStream = awslambda.HttpResponseStream.from(responseStream, metaData)
  ```

  **3. Calling the scanWholeTable Function:**
  The next step is to call the scanWholeTable function, passing the responseStream to it.

  ```
  await scanWholeTable(responseStream, null);
  ```

**Breakdown of scanWholeTable**
The scanWholeTable function is responsible for scanning the DynamoDB table and streaming the results in chunks:

**1. Setting Up Parameters:**
We create the parameters for the scan operation, specifying the `TableName` and a `Limit` to control the number of records returned per scan. If a startKey is passed, it is included in the parameters as `ExclusiveStartKey`, allowing for pagination.
```
const params = {
  TableName: 'stream-user-table',
  Limit: 15,
};

if (startKey) {
  params.ExclusiveStartKey = startKey;
}
```

**2. Scanning the Table:**
A `ScanCommand` is created with the parameters, and the scan is executed using the DynamoDB client.

**3. Streaming Data in Chunks:**
Once we receive the scan results, we write the data in chunks to the user or frontend using `responseStream.write().` Before writing, the data is stringified using `JSON.stringify().`
```
responseStream.write(JSON.stringify(scanUser.Items));
```

**4. Handling Pagination:**
If LastEvaluatedKey is present in the response, this indicates that more records remain to be scanned. The function is called recursively with the startKey to continue scanning.
```
if (scanUser.LastEvaluatedKey) {
    return await scanWholeTable(responseStream, scanUser.LastEvaluatedKey);
}
```

**5. Ending the Stream:**
Once all the data is scanned and sent, the response stream is closed with `responseStream.end().`

**6. Error Handling:**
In case of an error during scanning, an error message is written to the responseStream, and the stream is closed.
```
const errorResponse = {
    errorMessage: 'Error while scanning the table'
}
responseStream.write(JSON.stringify(errorResponse))
```

## Testing In Postman
Let's test this using Postman. First, we'll attempt to fetch 6MB of records using both the buffer and stream Lambdas to compare their performance.

**Buffer Lambda Test**
When we called the buffer Lambda to fetch 4.94MB of data, the response took 14.73 seconds to complete.

![bufferLambda4MB](screenshots/Screenshot%202024-09-06%20at%2010.12.34%20PM.png)

**Breakdown of Time and Memory:**
![bbufferLambda4MB](screenshots/Screenshot%202024-09-06%20at%2010.12.52%20PM.png)
1. Socket initialization started at 0.26ms.
2. Transfer began at 5.76 seconds.
3. The download took 8.97 seconds.

In total, the buffer Lambda took 14.73 seconds to complete. During this period, the user would see a loading buffer on the frontend until the entire response is ready.

**Stream Lambda Test**

Now, let's call the stream Lambda via the Lambda URL to fetch the same amount of data (4.94MB). The stream Lambda completed the request in 6.55 seconds.

![streamLambda4MB](screenshots/Screenshot%202024-09-06%20at%2010.20.05%20PM.png)

**Breakdown of Time for Stream Lambda:**

![streamLambda4MBB](screenshots/Screenshot%202024-09-06%20at%2010.13.12%20PM.png)

1. Socket initialization started at 0.24ms.
2. Transfer started at 1020.86ms.
3. The download took 5.52 seconds.

Overall, the stream Lambda took only 6.55 seconds to fetch the same 4.94MB of data—substantially faster than the buffer Lambda.

**Bonus Test: Streaming 14MB of Data**

As mentioned earlier, the stream Lambda is capable of handling up to 20MB of data. Let’s test it by fetching 14MB of records. The stream Lambda completed this in 13.96 seconds.
![streamLambda14MB](screenshots/Screenshot%202024-09-06%20at%2010.07.15%20PM.png)

**Breakdown of Time for Streaming 14MB:**
![streamLamdba14MBB](screenshots/Screenshot%202024-09-06%20at%2010.07.30%20PM.png)

1. Socket initialization took 0.41ms.
2. Transfer began at 1009.68ms.
3. The download took 12.93 seconds.

In total, the stream Lambda fetched 14MB of data in 13.96 seconds—demonstrating its ability to handle larger datasets efficiently.

## Deploy
To deploy your entire setup, simply run the command:
`sls deploy` 
Once the deployment is complete, your API will be live and ready for use.

## Conclusion
By leveraging AWS Lambda's streaming capabilities, we significantly enhance the performance of data retrieval from large datasets stored in DynamoDB. The ability to stream responses reduces wait times for users, improving the Time to First Byte (TTFB) and overall responsiveness of applications. Through this approach, even with large datasets, users can experience faster interactions as data is delivered incrementally.

This solution not only addresses the limitations of traditional buffered responses but also optimizes resource usage, enabling you to handle payloads up to 20 MB while lowering memory consumption. The comparison between buffered and streaming Lambda functions shows a clear advantage in terms of speed and efficiency, making it an ideal choice for applications dealing with large data volumes and latency-sensitive scenarios.

Ultimately, streaming data from DynamoDB using AWS Lambda provides a practical and scalable solution for improving user experiences and optimizing application performance.
