import * as nodeMailer from 'nodemailer';
import * as log4js from 'log4js';
const logger = log4js.getLogger('MAIL');

let isInitialized: boolean = false;
const CHECK_INTERVAL = 10 * 1000;
let mailTransport: nodeMailer.Transporter = null;

export function initialize(nodeMailerTransportOptions: any) {
    if (isInitialized)
        return logger.warn('Already initialized. Omitting.');

    logger.trace('Initializing....');
    mailTransport = nodeMailer.createTransport(nodeMailerTransportOptions);

    start();
}

function start() {
    setInterval(() => {
        // Check if we have mail to send cyclicly
        
    }, CHECK_INTERVAL);
}