/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "serverless-hello-world",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
            providers: { datadog: true },
        };
    },

    async run() {
        const hostedZone = await aws.route53.getZone({
            name: "apps.shopware.io",
            privateZone: false,
        });

        // const ddApiKeySecret = await aws.secretsmanager
        //     .getSecret({
        //         name: "production-datadog-api-key",
        //     });

        const table = new sst.aws.Dynamo("shop", {
            fields: {
                id: "string",
            },
            primaryIndex: { hashKey: "id" },
        });

        const hono = new sst.aws.Function("hono", {
            url: true,
            link: [table],
            // layers: [
            //     "arn:aws:lambda:eu-central-1:464622532012:layer:Datadog-Node20-x:115",
            //     "arn:aws:lambda:eu-central-1:464622532012:layer:Datadog-Extension:64"
            // ],
            handler: "index.handler",
            environment: {
                // DD_LAMBDA_HANDLER: "index.handler",
                // DD_SITE: "datadoghq.eu",
                // DD_API_KEY_SECRET_ARN: ddApiKeySecret.arn,
                NAME: "friend",
                APP_NAME: "ServerlessHelloWorldExample",
                APP_SECRET: "ServerlessHelloWorldExampleSecret",
            },
        });

        const router = new sst.aws.Router("hello-world", {
            routes: {
                "/*": hono.url,
            },
            domain: {
                name:
                    $app.stage === "production"
                        ? `${$app.name}.${hostedZone.name}`
                        : `${$app.name}-${$app.stage}.${hostedZone.name}`,
                dns: sst.aws.dns({
                    zone: hostedZone.zoneId,
                }),
            },
        });

        return {
            api: hono.url,
            router: router.url,
        };

    },
});
