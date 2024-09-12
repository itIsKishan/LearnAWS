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
Each folder is dedicated to a specific component of the architecture:

