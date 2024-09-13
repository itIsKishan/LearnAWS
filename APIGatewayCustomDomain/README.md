# Introduction
Let me ask you a quick question: If you've created an API Gateway and want to share the endpoint with your frontend team, would you prefer sharing a meaningful URL like `https://backend-application.com/`, or the default AWS-generated URL that looks like `https://{apiId}.execute-api.{region}.amazonaws.com/?`

Of course, you'd go for the cleaner, more meaningful URL, right? But AWS doesn't provide that directly. In this repository, I'll show you exactly how to set up a custom domain for your API Gateway, making your endpoint much more user-friendly! Let's dive in.

## How To Build Custom Domain
To set up a custom domain for your API Gateway, follow these steps:

  **1. Register a Custom Domain in Route 53:** After registering, ensure that a hosted zone is created—AWS will handle this for you. 

  **2. Prepare and Deploy Your API Gateway:** Make sure your API Gateway is deployed to a specific stage.

  **3. Create an ACM Certificate:** Request an ACM certificate for your domain and validate it via Route 53 for secure connections.

  **4. Create a Custom Domain in API Gateway:** In the API Gateway console, create a custom domain using the same domain name registered in Route 53, and attach the ACM certificate.

  **5. Set Up API Mapping:** Map your deployed API to the custom domain, enabling it to be accessible via the new domain.

This guide ensures your API is properly secured and accessible with a user-friendly custom domain.

## Folder Structure
To maintain clarity and avoid overloading the `serverless.yml` file, I’ve organized the resources into separate folders. Below is the folder structure of the project:
```
├── resources/
│   ├── acm/
│   │   └── todoRestApiCertificate.yml
│   ├── apiGateway/
│   │   ├── api/
│   │   │   └── todoRestApi.yml
│   │   ├── customDomain/
│   │   │   ├── customDomain.yml
│   │   │   ├── customDomainAPIMapping.yml
│   │   │   └── customDomainRecordSet.yml
│   │   ├── deploy/
│   │   │   └── todoRestApiDeploy.yml
│   │   ├── methods/
│   │   │   └── createTodoRestApiMethod.yml
│   │   ├── permission/
│   │   │   └── createTodoApiInvokePermission.yml
│   │   ├── resource/
│   │   │   └── todoRestApiResource.yml
│   ├── dynamoDB/
│   │   ├── todoTable.yml
│   ├── lambda/
│   │   ├── createTodoLambda.yml
│   └── role/
│       └── role.yml
├── todoLambdas/
│   ├── createTodo.js
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── serverless.yml
```
Breakdown of Folder Structure
**resources/**
This folder contains YAML configurations for setting up and managing essential AWS resources like API Gateway, Lambda functions, DynamoDB tables, and IAM roles.

**1. resources/acm/todoRestApiCertificate.yml:** Defines the configuration for creating an ACM certificate used to secure the API Gateway with HTTPS and integrate with Route 53.

**2. resources/apiGateway/:** Contains various configurations for managing API Gateway resources, custom domains, and deployment stages.

  **2.1 api/todoRestApi.yml:** Defines the configuration for creating the API Gateway with a custom name.

  **2.2 customDomain/:**

    **customDomain.yml:** Configures a custom domain name for the API Gateway.

    **customDomainAPIMapping.yml:** Maps the custom domain name to the API Gateway.
    
    **customDomainRecordSet.yml:** Creates the corresponding Route 53 DNS records for the custom domain.

  **2.3 deploy/todoRestApiDeploy.yml:** Handles the deployment of the API Gateway to a specific stage.

  **2.4 methods/createTodoRestApiMethod.yml:** Defines the method configuration (e.g., POST) for the /todo resource in the API Gateway.

  **2.5 permission/createTodoApiInvokePermission.yml:** Grants permission for the API Gateway to invoke the Lambda function responsible for creating a todo.

  **2.6 resource/todoRestApiResource.yml:** Defines the API Gateway resource path (/todo) that will be used for the todo service.

**3. resources/dynamoDB/todoTable.yml:** Specifies the configuration for creating a DynamoDB table (todoTable) to store the todo items, including table attributes and provisioned throughput.

**4. resources/lambda/createTodoLambda.yml:** Configures the Lambda function responsible for creating new todo items. This file defines the function's handler, memory size, timeout, and associated resources like the DynamoDB table.

**5. resources/role/role.yml:** Defines the IAM role and policies necessary for the Lambda function to interact with other AWS services, like DynamoDB and API Gateway, securely.

**6. todoLambdas/**
This folder contains the actual code for the Lambda function responsible for handling todo-related operations.

  **todoLambdas/createTodo.js:** JavaScript code for the Lambda function that processes requests to create new todo items and inserts them into the DynamoDB table.

## PreRequities
Before proceeding, ensure you have a registered domain name. If you don't already have one, follow these steps:

  **1. Navigate to Route 53:** Use the Route 53 console to check the availability of your desired domain name.  

  **2. Register the Domain:** Once you find an available domain name, complete the registration process within Route 53.

  **3. Confirm Hosted Zone Creation:** After successful domain registration, verify that a hosted zone has been created with the same name as your registered domain. This hosted zone is required to manage the DNS records for your domain.


## Explanation Of YAML

**Steps 1, 2, 3: Create a Lambda Function, DynamoDB Table, and Role**
In this guide, we’ll first set up a simple Lambda function that creates a todo item in a DynamoDB table. This Lambda will be invoked through the API Gateway in subsequent steps.

  **Step 1:** Create a Lambda Function We'll build a Lambda function responsible for creating todo entries in the todoTable. The configuration for this Lambda function can be found in `resources/lambda/createTodoLambda.yml`. This function will later be integrated with the API Gateway.
  ![step1Lambda](screenshots/Screenshot%202024-09-13%20at%206.56.59%20PM.png)

  **Step 2:** Set Up DynamoDB Table To store the data, we need to create a DynamoDB table named todoTable. The configuration for this table is located in `resources/dynamoDB/todoTable.yml`
  ![step2DDB](screenshots/Screenshot%202024-09-13%20at%206.57.07%20PM.png)

  **Step 3:** Define IAM Role for Lambda Since our Lambda function will be performing a put operation on the DynamoDB table, it needs the appropriate permissions. These permissions are defined in `resources/role/role.yml`, granting the Lambda function access to interact with the todoTable.
  ![step3Role](screenshots/Screenshot%202024-09-13%20at%206.57.15%20PM.png)

  By following these steps, you’ll have the necessary setup to allow the Lambda function to interact with the DynamoDB table securely.

**Steps 4, 5, 6: Create an API Gateway, Resource, Method & Deployment**
Now that we have the Lambda function and DynamoDB table set up, the next step is to configure the API Gateway with the necessary resources and methods.
  **Step 4: Create a REST API Gateway**
  We will define a REST API Gateway for the `todo` application. The configuration for this can be found in `resources/apiGateway/api/todoRestApi.yml`.
  ![step4API](screenshots/Screenshot%202024-09-13%20at%206.57.22%20PM.png)
  This file creates the API Gateway and sets its name to todoAPI.
  ```
  Type: AWS::ApiGateway::RestApi # Define a REST API for the todo application
  Properties:
    Name: 'todoAPI' # Specify the name of the REST API
    Description: 'CRUD API for todo'
  ```
  **Step 5: Create API Gateway Resource**
  Next, we will add a resource to the API Gateway for our `todo` path, which is defined in `resources/apiGateway/resource/todoRestApiResource.yml`.
  ![step51Resource](screenshots/Screenshot%202024-09-13%20at%206.57.30%20PM.png)
  ```
  Type: AWS::ApiGateway::Resource # Define a new resource in the API Gateway for the "todo" endpoint
  Properties:
    ParentId: # Attach the resource under the root resource of the specified API Gateway
      Fn::GetAtt:
        - todoRestApi
        - RootResourceId
    PathPart: todo # Specify the path segment for the resource, i.e., "/todo"
    RestApiId: # Link this resource to the specific API Gateway
      Ref: todoRestApi
  ```
  This step creates a new resource path `/todo` and links it to the API Gateway created in previous step.

  **Step 5.1: Create API Gateway Method**
  The next step is to define a method (e.g., POST) for the `/todo` resource. This will be used to invoke the Lambda function and create a new todo item. The configuration for this can be found in `resources/apiGateway/methods/createTodoRestApiMethod.yml`.
  ![step52Method](screenshots/Screenshot%202024-09-13%20at%206.57.30%20PM.png)
  ```
  Type: AWS::ApiGateway::Method # Define a method in the API Gateway for the "createTodo" endpoint
  Properties: # Specify the properties for the method
    AuthorizationType: NONE # Set the authorization type for the method to "NONE"
    HttpMethod: POST # Set the HTTP method for the method to "POST"
    ResourceId: # Attach the method to the "todo" resource
      Ref: todoRestApiRootResource
    RestApiId: # Link this method to the specific API Gateway
      Ref: todoRestApi
    Integration: # Define the integration for the method: this will set the method to invoke the "createTodo" Lambda function
      IntegrationHttpMethod: POST # Set the HTTP method for the integration to "POST"
      Type: AWS_PROXY # Set the type of the integration to "AWS_PROXY"
      Uri: # Set the URI for the integration to the ARN of the "createTodo" Lambda function
        Fn::Sub: arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${CreateTodoLambdaFunction.Arn}/invocations
    MethodResponses:
      - StatusCode: 200
  ```
  Here, we create a POST method for the `/todo` resource, link it to the Lambda function, and set it to use the `AWS_PROXY` integration.

  **Step5.3: Provide Invoke Permission For the API Gateway**
  It is required to give necessary permission to the api gateway so that it will be able to invoke the lambda or any other target, the configuration is located in `resources/apiGateway/permission/createTodoApiInvokePermission.yml`
  ```
  Type: AWS::Lambda::Permission #allow api gateway to invoke the lambda function
  DependsOn: #Depends on the api gateway creation so it attach permission to that api
    - todoRestApi
  Properties: #Properties of the permission
    Action: lambda:InvokeFunction #Action: lambda:InvokeFunction which allows the api gateway to invoke the lambda function
    FunctionName: !Ref CreateTodoLambdaFunction #Referring lambda function which is to be invoked
    Principal: apigateway.amazonaws.com #Principal who can invoke the function
  ```

  **Step 6: Deploy the API Gateway**
  Once the API Gateway, resource, and method are configured, we need to deploy the API so that it becomes publicly available. The deployment configuration is located in `resources/apiGateway/deploy/todoRestApiDeploy.yml`.
  ![step6Deploy](screenshots/Screenshot%202024-09-13%20at%206.57.37%20PM.png)
  ```
  Type: AWS::ApiGateway::Deployment # Define a deployment for the API Gateway
  DependsOn:  # Specify the resources that the deployment depends on
    - createTodoRestApiMethod
  Properties:
    RestApiId: # Link the deployment to the specific API Gateway
      Ref: todoRestApi
    StageName: ${opt:stage, 'dev'} # Set the stage name for the deployment to "dev"
  ```
  This step deploys the API Gateway to the specified stage (default: dev).

For more understanding on the API gateway reffer this repo: [REST API Gateway](https://github.com/itIsKishan/LearnAWS/tree/main/RestAPIGateway)

**Step7: Creating An ACM Certificate**
Since we're using a custom domain for our API Gateway, it's important to enable SSL/TLS validation for secure communication. We'll achieve this by creating an ACM certificate, which will be attached to the custom domain in Route 53. The configuration for this ACM certificate is found in `resources/acm/todoRestApiCertificate.yml.`
![step7ACM](screenshots/Screenshot%202024-09-13%20at%206.57.45%20PM.png)
```
Type: 'AWS::CertificateManager::Certificate' # Define a certificate for the API Gateway & Route53
Properties: 
  DomainName: hosted-custom-domain-for-api-gateway.com # Specify the domain name for the custom domain, this should be same as your ROute53 domain name
  ValidationMethod: DNS # Specify the validation method for the certificate
  DomainValidationOptions: 
    - DomainName: hosted-custom-domain-for-api-gateway.com
      HostedZoneId: hostedZoneId #specify the hosted zone id of the route53 domain
```
**Key Details:**

  **1. DomainName:** This should be the custom domain you registered in Route 53.

  **2. ValidationMethod:** We are using DNS validation, which requires the certificate to be validated using DNS records.

  **3. HostedZoneId:** The hosted zone ID from Route 53 for your domain, which allows DNS validation to automatically create the required DNS records.

By following this setup, the ACM certificate will be validated and linked with the custom domain, ensuring secure access to your API Gateway.

**Step8: Creating Custom Domain For API Gateway**
After setting up the API Gateway and obtaining the ACM certificate, the next step is to configure a custom domain for the API Gateway. This allows your API to be accessed via a user-friendly, custom URL. The configuration for the custom domain is located in `resources/apiGateway/customDomain/customDomain.yml`

![step8CDAPI](screenshots/Screenshot%202024-09-13%20at%206.57.52%20PM.png)
```
Type: 'AWS::ApiGateway::DomainName' # Define a custom domain for the API Gateway
Properties:
  DomainName: hosted-custom-domain-for-api-gateway.com # Specify the domain name for the custom domain, this should be same as your ROute53 domain name
  RegionalCertificateArn:  # link the acm certificate to the custom domain
    Ref: todoRestAPICertificate
  EndpointConfiguration: # Specify the endpoint configuration for the custom domain
    Types:
      - REGIONAL
```
**Key Details:**

  **1. DomainName:** This is the custom domain you registered in Route 53, which will be used as the URL for accessing your API Gateway.

  **2. RegionalCertificateArn:** This links the previously created ACM certificate (todoRestAPICertificate) to the custom domain, ensuring that the domain is SSL/TLS secured.

  **3. EndpointConfiguration:** The Types field is set to REGIONAL, meaning the custom domain will use a regional API Gateway, which is hosted in a specific AWS region. You can also use EDGE for a global distribution setup.

  This setup allows your API Gateway to have a secure, custom domain name, making it easier to use and more professional for public-facing applications.

**Step9: Create A Record Set In Hosted Zone of the custom domain**
After configuring the custom domain for the API Gateway, the next step is to add a record set in the Route 53 hosted zone. This will map the custom domain to the API Gateway. The configuration can be found in `resources/apiGateway/customDomain/customDomainRecordSet.yml`
![step9RecordSet](screenshots/Screenshot%202024-09-13%20at%206.57.59%20PM.png)
```
Type: AWS::Route53::RecordSet # Define a Route 53 record set for the custom domain
Properties:
  HostedZoneId: hostedZoneId #specify the hosted zone id of the route53 domain
  Name: hosted-custom-domain-for-api-gateway.com # Specify the domain name for the record set: this should be same is route53 domain name
  Type: A # Specify the record type for the record set, for attaching custom domain to hosted zone we use Type Alias(A)
  AliasTarget: # Specify the alias target for the record set
    DNSName: !GetAtt todoRestApiCustomDomain.RegionalDomainName #fetch the api gateway custom domain name
    HostedZoneId: !GetAtt todoRestApiCustomDomain.RegionalHostedZoneId #fetch the hosted zone id of the route53 domain
```
**Key Details:**

  **1. HostedZoneId:** This specifies the ID of the hosted zone in Route 53 where your domain is managed. It ensures that the custom domain points to the correct hosted zone.

  **2. Name:** The domain name (custom domain) must match the one registered in Route 53.

  **3. Type (A):** An alias record (Type A) is used to map the custom domain to the API Gateway endpoint. The alias allows traffic to be routed to the API Gateway using the custom domain.

  **4. AliasTarget:** This is where the custom domain from the API Gateway is attached, utilizing GetAtt to fetch the domain name and hosted zone ID from the API Gateway.

**Step10: API Mapping For Custom Domain**
The final step is to map the API Gateway to the custom domain we created in the previous step. This ensures that when the custom domain is accessed, it routes to the appropriate API Gateway stage. The configuration is located in `resources/apiGateway/customDomain/customDomainAPIMapping.yml`
![step10APIMapping](screenshots/Screenshot%202024-09-13%20at%206.58.09%20PM.png)
```
Type: 'AWS::ApiGateway::BasePathMapping' # Define a base path mapping for the API Gateway
Properties:
  DomainName: # Link the base path mapping to the custom domain
    Ref: todoRestApiCustomDomain
  RestApiId: # Link the REST API Created to this custom domain
    Ref: todoRestApi
  Stage: dev  # Set the stage name for the base path mapping to "dev"
```
**Key Details:**

  **1. DomainName:** This links the custom domain created in the previous steps to the base path mapping, using the todoRestApiCustomDomain.

  **2. RestApiId:** This connects the custom domain to the REST API (todoRestApi), ensuring requests to the custom domain are routed to the correct API Gateway.

  **3. Stage:** The Stage property indicates which stage (e.g., dev, prod) of the API Gateway will be accessible via the custom domain.

By setting up the record set and API mapping, your custom domain is fully configured to route traffic to your API Gateway, ensuring a seamless user experience with a professional, branded URL.

## Deploy
To deploy your entire setup, simply run the command:
`sls deploy` 
Once the deployment is complete, your API will be live and ready for use.

## Conclusion
By following this guide, you will be able to configure a custom domain for your API Gateway, making it more user-friendly and secure through SSL/TLS validation. You’ll also learn how to set up a fully functional REST API backed by AWS Lambda and DynamoDB. This includes creating necessary resources such as API Gateway methods, custom domains, and DNS records using Route 53. With this setup, you can share a professional, easy-to-remember URL with your frontend team, improving both functionality and user experience.
