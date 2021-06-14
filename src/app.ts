import { Request, Response } from 'express'
import { createRequest } from './index'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 8080

app.use(bodyParser.json())

app.post('/', async (req: Request, res: Response) => {
  const result = await createRequest(req.body);
  return res.status(result.status).json(result.data)
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
