const amqp = require('amqplib')

const ProducerService = {
  /**
   * Send a message to a queue rabbitmq message broker
   * @param {*} queue
   * @param {*} message
   */
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER)
    const channel = await connection.createChannel()
    await channel.assertQueue(queue, {
      durable: true
    })

    await channel.sendToQueue(queue, Buffer.from(message))

    setTimeout(() => {
      connection.close()
    }, 1000)
  }
}

module.exports = ProducerService
