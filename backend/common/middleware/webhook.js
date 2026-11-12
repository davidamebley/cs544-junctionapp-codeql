
const { NotFoundError } = require('../errors/errors')

const WebhookMiddleware = {
    hasWebhookToken: (req, res, next) => {
        if (req.query.webhook_api_key === global.gConfig.WEBHOOK_API_KEY) {
            next()
        } else {
            next(new NotFoundError())
        }
    },
}

module.exports = WebhookMiddleware
