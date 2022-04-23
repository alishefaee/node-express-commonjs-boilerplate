import nodemailer from 'nodemailer'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { setCodeResponse } from './functions.mjs'
import { Code } from './consts.utils.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class Email {
    createTransport() {
        const port = parseInt(process.env.SMTP_PORT) || 587
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: port,
            secure: false,
            requireTLS: false,
            auth: {
                user: 'youmecalendar@gmail.com',
                pass: 'qpalzm@.!5',
            },
        })
    }

    getAndRenderTemplate(templateFile, data) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(
                __dirname + `/../views/${templateFile}.ejs`,
                data,
                (err, str) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(str)
                    }
                },
            )
        })
    }

    send(items) {
        return new Promise(async (resolve, reject) => {
            try {
                let options = {
                    from: 'youmecalendar@gmail.com',
                    to: items.to,
                    subject: items.subject,
                    text: items.text,
                    html: await this.getAndRenderTemplate(
                        items.templateFile,
                        items.data,
                    ),
                }
                const x = await this.createTransport().sendMail(options)
                resolve(x)
            } catch (e) {
                setCodeResponse(Code.EMAIL_DID_NOT_SENT)
                myConsole(e)()
                reject(e)
            }
        })
    }
}

export default new Email()







