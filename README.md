# Serverless Hello World Example 

This is a simple example of a Shopware app-backend utilizing the [app-sdk-js](https://github.com/shopware/app-sdk-js/) and [sst](https://ion.sst.dev/docs/) 
to create a serverless function with AWS Lambda and DynamoDB showcasing how to build javascript app-backends for Shopware including cost efficient infrastructure.

## Why sst?

By using [sst](https://ion.sst.dev/docs/) you can easily create serverless functions based on node.js, javascript / typescript and AWS Lambda.
The infrastructure is defined in typescript as well and can be deployed with a single command.

## Getting started

This repository is just a starting point for your Shopware app-backend based on node.js and typescript to help you understand the concept 
of using `sst` to create a serverless function with AWS Lambda. It also provides github-actions to automatically deploy your app to AWS.

### How to use

- `index.ts` - This is where the app code lives.
- `sst.config.ts` - This is where the app infrastructure is defined.

### Development

A big advantage of using `sst` is that it provides a dev mode which deploys your app to AWS and watches for changes in your code which are deployed automatically in miliseconds.

To use `sst` dev mode you need to have an AWS account and the AWS CLI installed and configured properly.

First you need to install the dependencies:

```bash
npm install
```

Then you can start the dev mode:

```bash
npx sst dev
```

This will deploy your app to AWS. Please keep in mind that this will create resources in your AWS account which will cost money.
To remove the resources you can run:

```bash
npx sst remove
```

### Deployment

You do not need to use the dev mode to deploy your app for testing. This repository also includes github-actions which will automatically deploy a staging preview
when creating a pull request. After merging the pull request the app will be deployed to production. This way you do not need to configure AWS credentials on your local machine.
The preview environment is also automatically destroyed by a cleanup job after the corresponding pull request is closed or merged.

If you are using this repository as a template make sure to include the required github actions secrets containing information about your AWS account.
- `AWS_ROLE_ARN`: The arn of the role to use to deploy your infrastructure (needs sufficient permissions)
- `AWS_ROLE_SESSION_NAME`: An identifier used with the defined role to better distinguish automated actions coming from github in your AWS account
- `AWS_REGION`: The AWS region to deploy to (e.g. eu-central-1)

## What's next?

Right now this example app is just a simple hello world Lambda function providing an action button. It is using DynamoDB as data store for the app registration process.
Using sst and pulumi in the background allows to add even more infrastructure components like S3 buckets and cloudfront distributions for static site hosting which should 
cover other app-backend use-cases that we would like to explore in the future.

If you want to add more capabilities yourself using `sst` checkout their documentation and how to use it here: https://sst.dev/docs
