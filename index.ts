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
import { createNotificationResponse } from '@shopware-ag/app-server-sdk/helper/app-actions';

declare module "hono" {
    interface ContextVariableMap {
        app: AppServer;
        shop: ShopInterface;
        context: Context;
    }
}

const app = new Hono()
const client = new DynamoDBClient();

configureAppServer(app, {
    appName: process.env.APP_NAME as string,
    appSecret: process.env.APP_SECRET as string,
    shopRepository: new DynamoDBRepository(client, 'shop')
});

const name = process.env.NAME

app.get("/", c => c.text(`hello ${name}.`))

app.post('/app/hello', async (ctx) => {
    const shop = ctx.get('shop');
    console.log(shop.getShopUrl());

    const sclient = ctx.get('context');
    console.log(await sclient.httpClient.get('/_info/version'));

    return createNotificationResponse('success', `hello ${name}.`)
})

export const handler = handle(app)
