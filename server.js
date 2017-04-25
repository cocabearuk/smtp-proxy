
var SMTPServer = require('smtp-server').SMTPServer;
var mailer = require('nodemailer');
var parser = require('mailparser').MailParser;
var env = require('node-env-file');
env(__dirname + '/.env');

// Load up variables
var ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',');
var PROXY_FORWARD = process.env.PROXY_FORWARD;
var AUTH_USER = process.env.AUTH_USER;
var AUTH_PASS = process.env.AUTH_PASS;
var BLOCKED_SUBJECTS = (process.env.BLOCKED_SUBJECTS || '').split(',');

var server = new SMTPServer({
    secure: false,
    name: "localhost",
    allowInsecureAuth: true,
    authMethods: ['PLAIN', 'LOGIN'],
    logger: true,
    onConnect: function (session, callback) {
        return callback();
    },
    onMailFrom: function (address, session, callback) {
        if (ALLOWED_EMAILS.indexOf(address.address) > -1) {
            return callback();
        } else {
            return callback(new Error('Invalid email from address'));
        }
    },
    onAuth: function (auth, session, callback) {
        if (auth.username === AUTH_USER && auth.password === AUTH_PASS) {
            return callback(null, { user: 123 });
        } else {
            return callback(new Error('Invalid username or password'));
        }
    },
    onData: function (stream, session, callback) {
        
        var mailParser = new parser({ streamAttachments: true });
        stream.pipe(mailParser);
        
        mailParser.on('end', (mail) => {
            
            if (BLOCKED_SUBJECTS.indexOf(mail.subject) > -1) {
                return new callback(new Error("Can't forward messages with that subject."));
            } else {
                
                //Allow it through
                var transporter = mailer.createTransport(PROXY_FORWARD);
                transporter.sendMail(
                    {
                        from: mail.from,
                        to: mail.to,
                        subject: mail.subject,
                        text: mail.text,
                        html: mail.html,
                        attachments: mail.attachments
                    },
                    function (err, info) {
                        console.log(err);
                        console.log(info);
                    }
                );
                
                callback();

            }
        });
    }
});

server.on('error', function (err) {
    console.log('Error %s', err.message);
});

server.listen(28);
