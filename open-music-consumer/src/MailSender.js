const nodemailer = require('nodemailer')

class MailSender {
  #transporter = null

  constructor () {
    this.#transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD
      }
    })
  }

  /**
   * Perform send mail with export playlist template content
   * @param {*} targetEmail
   * @param {*} content
   * @returns
   */
  sendExportPlaylistMail (targetEmail, content) {
    const message = {
      from: 'Open Music',
      to: targetEmail,
      subject: 'Export Playlist',
      text: 'Here is your requested export playlist',
      attachments: [
        {
          filename: 'playlist.json',
          content
        }
      ]
    }

    return this.#transporter.sendMail(message)
  }
}

module.exports = MailSender
