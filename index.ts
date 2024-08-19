import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'

const app = new Hono()

const name = process.env.NAME
app.get("/", c => c.text(`hello ${name}.`))

export const handler = handle(app)
