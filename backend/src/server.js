const app = require('./app')
const env = require('./config/env')
const { startScheduler } = require('./utils/scheduler')

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
  startScheduler()
})
