const cron = require('node-cron')
const { runStatusTransitions } = require('../services/hackathon.service')

const startScheduler = async () => {
  // Run immediately on startup to catch any missed transitions
  try {
    await runStatusTransitions()
    console.log('[Scheduler] Initial status sweep complete')
  } catch (err) {
    console.error('[Scheduler] Initial sweep failed:', err.message)
  }

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      await runStatusTransitions()
    } catch (err) {
      console.error('[Scheduler] Status transition error:', err.message)
    }
  })

  console.log('[Scheduler] Started — checking hackathon statuses every minute')
}

module.exports = { startScheduler }
