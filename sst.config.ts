/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "baked-beans",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },

    async run() {
        const table = new sst.aws.Dynamo("shop", {
            fields: {
                id: "string",
            },
            primaryIndex: { hashKey: "id" },
        });

        const hono = new sst.aws.Function("hono", {
            url: true,
            link: [table],
            handler: "index.handler",
            environment: {
                NAME: "friend",
                APP_NAME: "BakedBeans",
                APP_SECRET: "BakedBeansSecret",
            },
        });

        const router = new sst.aws.Router("hello-world", {
            routes: {
                "/*": hono.url,
            },
        });

        return {
            api: hono.url,
            router: router.url,
        };
    },
});
