const nodemailer = require('nodemailer');
require('dotenv').config({silent: true});
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    type: 'OAuth2',
    clientId: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    refreshToken: process.env.REFRESH,
    user: process.env.mainEmail
  }
});
const mailOptions = {
  to: process.env.mainEmail,
  subject: 'Email send machanism trigered!',
  from: `${process.env.mainUser} <${process.env.mainEmail}>`,
  text: `Seems like the email mechanism was trigered by someone.\n
  There is nothing here, check the code, this is the demail template.`
};
const sendEmail = exports.sendEmail = (mailOptions, callback) => {
  if (!mailOptions.to || !mailOptions.text)
    return callback('Error on options.', new Error('Error: No text or sender email has been added to options sent.'));
  if (!mailOptions.from)
    mailOptions.from = `${process.env.mainUser} <${process.env.mainEmail}>`; // change this to default email
  if (!mailOptions.subject)
    mailOptions.subject = 'Do not reply - MangaDB'; // change this to default subject
  const verifyMail = (err, success) => {
    if (err)
      return callback('Error verifying connection to SMTP server', err);

    const send = (err, res) => {
      if (err)
        return callback('Error', err);

      return callback(null, res); // if it gets here, it means it sent the email successfully
    };

    transporter.sendMail(mailOptions, send);
  };
  transporter.verify(verifyMail);
};

const customEmail = exports.customEmail = (type, user, email, callback) => {
  mailOptions.to = email;
  switch (type) {
    case 0:
      // Welcome Email
      mailOptions.subject = `Welcome to MangaDB!`;
      mailOptions.text = `Welcome to MangaDB, ${user}.\nYour user is already, successfully registered!`;
      break;
    case 1:
      // User Updated Email
      mailOptions.subject = `Your user information was succesfully updated!`;
      mailOptions.text = `Your information for MangaDB account ${user} was updated.\n
      If you did not request this change, then please change your password and check account integrity.`;
      break
    case 2:
      // User Deleted
      mailOptions.subject = `Your account was succesfully deleted!`;
      mailOptions.text = `Your MangaDB account ${user} was deleted.\n
      If you did not request this change, then please change your password and check account integrity.`;
      break
    case 3:
      // All users but admin deleted
      mailOptions.subject = `All non admin users were deleted`;
      mailOptions.text = `The admin ${user} has requested this action.\n
      If you did not request this change, then please change your password and check account integrity.`;
      break
    case 4:
      // All user's mangas deleted
      mailOptions.subject = `All your mangas were succesfully deleted!`;
      mailOptions.text = `All your manga records for MangaDB account ${user} were deleted.\n
      If you did not request this change, then please change your password and check account integrity.`;
      break
    case 5:
      // All mangas for all users but admin deleted
      mailOptions.subject = `All non admin mangas were deleted!`;
      mailOptions.text = `The admin ${user} has requested this action.\n
      If you did not request this change, then please change your password and check account integrity.`;
      break
  }
  sendEmail(mailOptions, callback);
}
