import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { configureAppServer } from '@shopware-ag/app-server-sdk-hono';
import { DynamoDBRepository } from '@shopware-ag/app-server-sdk-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import type {
    AppServer,
    Context,
    ShopInterface,
} from '@shopware-ag/app-server-sdk';

const app = new Hono()

const client = new DynamoDBClient();

configureAppServer(app, {
    appName: process.env.APP_NAME as string,
    appSecret: process.env.APP_SECRET as string,
    shopRepository: new DynamoDBRepository(client, 'shop')
});

const name = process.env.NAME

declare module "hono" {
    interface ContextVariableMap {
        app: AppServer;
        shop: ShopInterface;
        context: Context;
    }
}

app.get("/", c => c.text(`hello ${name}.`))

export const handler = handle(app)
