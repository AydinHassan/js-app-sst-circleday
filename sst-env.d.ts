/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "hello-world": {
      "type": "sst.aws.Router"
      "url": string
    }
    "hono": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "shop": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
  }
}
export {}
