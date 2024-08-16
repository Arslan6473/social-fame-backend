import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { Verification } from "../models/userVerification.model.js";

const token = uuidv4();

function verifyEmail(firstName, lastName, _id) {
  const url = `${process.env.APP_URL}/verify-user/${_id}/${token}`;
  return `
    <!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
  </head>
  <body style="font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 40px 30px;">
      <h1 style="color: #007bff; margin-bottom: 20px; font-size: 28px; text-align: center;">Email Verification</h1>
      <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Hello ${firstName} ${lastName},</h2>
      <p style="font-size: 16px; margin-bottom: 20px;">
        Thank you for registering with Social Fame. To complete your registration and ensure the security of your account, please verify your email address by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; background-color: #007bff; color: white; border-radius: 4px;">Verify Email</a>
      </div>
      <p style="font-size: 16px; margin-bottom: 20px;">
        If you did not create an account with Social Fame, please disregard this email.
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  </body>
</html>
  `;
}

export const verificationEmail = async (user, res) => {
  const { email, firstName, lastName, _id } = user;

  // Create transporter object with SMTP server details
  const transporter = nodemailer.createTransport({
   service: "gmail",
    auth: {
      user: process.env.APP_GMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: '"Social Fame 👻" <socailfame@ethereal.email>',
    to: email,
    subject: "Social Fame | Email Verification Link",
    html: verifyEmail(firstName, lastName, _id),
  };

  try {
    const verification = await Verification.create({
      userId: _id,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour expiration
    });

    if (verification) {
      // Send email using the transporter object

      transporter
        .sendMail(mailOptions)
        .then(() => {
          return res.status(201).json({
            success: "pending",
            message:
              "A verification email has been sent to your email! Check your email to verify your account.",
          });
        })
        .catch(() => {
          return res.status(500).json({
            success: false,
            message: "Something went wrong while verifying user!",
          });
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying user!",
    });
  }
};
