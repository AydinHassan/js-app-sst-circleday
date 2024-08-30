/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "serverless-hello-world",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {
        const hostedZone = await aws.route53.getZone({
            name: "apps.shopware.io",
            privateZone: false,
        })

        const table = new sst.aws.Dynamo("shop", {
            fields: {
                id: "string"
            },
            primaryIndex: { hashKey: "id" }
        });

        const hono = new sst.aws.Function("hono", {
            url: true,
            link: [table],
            handler: "index.handler",
            environment: {
                NAME: 'friend'
            }
        });

        const router = new sst.aws.Router("hello-world", {
            routes: {
                "/*": hono.url
            },
            domain: {
                name: $app.stage === "production" ? `${$app.name}.${hostedZone.name}` : `${$app.name}-${$app.stage}.${hostedZone.name}`,
                dns: sst.aws.dns({
                    zone: hostedZone.zoneId
                })
            }
        })

        return {
            api: hono.url,
            router: router.url,
        }
    },
});
