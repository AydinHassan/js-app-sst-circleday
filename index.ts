import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { configureAppServer } from '@shopware-ag/app-server-sdk/integration/hono';
import { DynamoDBRepository } from '@shopware-ag/app-server-sdk/integration/dynamodb';
import { EntityRepository } from '@shopware-ag/app-server-sdk/helper/admin-api';
import { Criteria } from '@shopware-ag/app-server-sdk/helper/criteria';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { createMediaFolder, uploadMediaFile, getMediaFolderByName } from '@shopware-ag/app-server-sdk/helper/media';
import type {
    AppServer,
    Context,
    ShopInterface,
} from '@shopware-ag/app-server-sdk';
import { createNotificationResponse } from '@shopware-ag/app-server-sdk/helper/app-actions';
import { Resource } from "sst";

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
    shopRepository: new DynamoDBRepository(client, Resource.shop.name)
});

const name = process.env.NAME

const exportOrder = async (httpClient, orderId) => {
    const repository = new EntityRepository<Order>(httpClient, "order");

    const criteria = new Criteria([orderId]);
    criteria.addAssociation('billingAddress');
    const entitySearchResult = await repository.search(criteria);

    const order = entitySearchResult.first();

    if (order == null) {
        return new Response();
    }

    let folderId = await getMediaFolderByName(httpClient, 'Order Exports');
    if (folderId === null) {
        folderId = await createMediaFolder(httpClient, 'Order Exports', {});
    }

    const address = [
        order.billingAddress.firstName + '' + order.billingAddress.lastName,
        order.billingAddress.street,
        order.billingAddress.city,
        order.billingAddress.zipcode
    ];

    const rows = [['Order Number', 'Address', 'Order Amount']];
    rows.push([order.orderNumber, address.join(", "),  order.amountTotal]);

    const content = rows.map((row) => row.join("|")).join("\n");

    const fileName = order.id + '.csv';
    const mediaRepository = new EntityRepository<Media>(httpClient, "media");
    const mediaCriteria = new Criteria([]);
    mediaCriteria.addFilter(Criteria.equals("fileName", order.id))
    mediaCriteria.addFilter(Criteria.equals("mediaFolderId", folderId))

    const mediaSearchResult = await mediaRepository.search(mediaCriteria);

    const media = mediaSearchResult.first();

    if (media) {
        //lets delete it first
        await mediaRepository.delete([{id: media.id}])
    }

    await uploadMediaFile(httpClient, {
        file: new Blob([content], { type: 'text/csv' }),
        fileName: fileName,
        mediaFolderId: folderId
    });
}

app.post('/app/re-export', async (c) => {
    const ctx = c.get("context");

    const orderIds = ctx.payload.data.ids;

    await exportOrder(ctx.httpClient, orderIds[0]);

    return createNotificationResponse("success", "Order exported");
})


app.post('/app/event/order-created', async (c) => {
    const shop = c.get('shop');
    const ctx = c.get("context");

    const orderIds = ctx.payload.data.payload.map((entity) => entity.primaryKey);

    await exportOrder(ctx.httpClient, orderIds[0]);

    return new Response();
})

export const handler = handle(app)
