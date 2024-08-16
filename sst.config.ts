/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "serverless-hello-world-app",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() { },
});
