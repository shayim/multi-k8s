const express = require('express')
const cors = require('cors')
const { Client } = require('pg')
const { createClient } = require('redis')

const {
  PG_USER = 'postgres',
  PG_PASSWORD = 'postgres',
  PG_HOST = 'localhost',
  PG_PORT = '5432',
  PG_DB = 'postgres',
  REDIS_HOST = 'localhost',
  REDIS_PORT = '6379'
} = process.env

const pgClient = new Client({
  connectionString: `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}`
})
;(async () => {
  try {
    await pgClient.connect().then(() => console.log('pg connected.'))
    await pgClient.query('CREATE TABLE IF NOT EXISTS values (n INT)')
  } catch (error) {
    console.log(error)
  }
})()

const redisClient = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`
})

const pub = redisClient.duplicate()
const sub = redisClient.duplicate()
;(async () => {
  try {
    await redisClient.connect().then(() => console.log('redis connected'))
    await pub.connect()
    await sub.connect()
  } catch (error) {
    console.log(error)
  }
})()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('Hi There!'))
app.get('/values/pg', async (req, res) => {
  const values = (await pgClient.query('SELECT * from values')).rows

  res.send(values)
})
app.get('/values/redis', async (req, res) => {
  const values = await redisClient.hGetAll('values')

  res.send(values)
})

app.post('/values/new-value', async (req, res) => {
  const { value } = req.body

  if (isNaN(parseInt(value)))
    return res.status(422).send({ errMsg: 'value is not a number' })
  if (+value > 40) return res.status(422).send('value too high.')

  await pub.publish('new-value', value)
  await pgClient.query('INSERT INTO values(n) VALUES($1)', [value])

  res.json({ workerInProgress: true })
})

app.listen(5000, () => console.log('server is listening at port 5000'))
