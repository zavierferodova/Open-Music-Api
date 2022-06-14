require('dotenv').config()
const ampq = require('amqplib')
const PlaylistsService = require('./PlaylistsService')
const MailSender = require('./MailSender')
const Listener = require('./listener')

const init = async () => {
  const playlistsService = new PlaylistsService()
  const mailSender = new MailSender()
  const listener = new Listener(playlistsService, mailSender)

  const connection = await ampq.connect(process.env.RABBITMQ_SERVER)
  const channel = await connection.createChannel()

  await channel.assertQueue('export:playlist', {
    durable: true
  })

  channel.consume('export:playlist', listener.listenExportPlaylist, { noAck: true })
  console.log('Consumer is listening...')
}

init()
