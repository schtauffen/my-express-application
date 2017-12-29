const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const AWS = require('aws-sdk')

const {
  USERS_TABLE,
  IS_OFFLINE
} = process.env

let dynamoDb
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
  console.log(dynamoDb)
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient()
}

app.use(bodyParser.json({ strict: false }))

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/users/:userId', (req, res) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId
    }
  }

  dynamoDb.get(params, (err, result) => {
    if (err) {
      console.error(err)
      res.status(400).json({ error: 'Could not get user' })
    }
    if (result.Item) {
      const { userId, name } = result.Item
      res.json({ userId, name })
    } else {
      res.status(400).json({ error: 'User not found' })
    }
  })
})

app.post('/users', (req, res) => {
  const { userId, name } = req.body
  if (typeof userId !== 'string') {
    res.status(400).json({ error: '"userId" must be a string' })
  } else if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' })
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      name
    }
  }

  dynamoDb.put(params, err => {
    if (err) {
      console.error(err)
      res.status(400).json({ error: 'Could not create user' })
    }
    res.json({ userId, name })
  })
})

module.exports.handler = serverless(app)
