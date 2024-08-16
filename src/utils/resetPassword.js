import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { PasswordReset } from "../models/resetPassword.model.js";

const token = uuidv4();

function resetEmail(firstName, lastName, _id) {
  const resetUrl = `${process.env.APP_URL}/change-password/${_id}/${token}`;

  return `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
  </head>
  <body style="font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 40px 30px;">
      <h1 style="color: #007bff; margin-bottom: 20px; font-size: 28px; text-align: center;">Password Reset Request</h1>
      <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Hello ${firstName} ${lastName},</h2>
      <p style="font-size: 16px; margin-bottom: 20px;">
        We received a request to reset your password for your Social Fame account. If you didn't make this request, you can safely ignore this email.
      </p>
      <p style="font-size: 16px; margin-bottom: 20px;">
        To reset your password, click the button below. This link will expire in 10 minutes for security reasons.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; background-color: #007bff; color: white; border-radius: 4px;">Reset Password</a>
      </div>
      <p style="font-size: 16px; margin-top: 20px;">
        If you didn't request a password reset, please ignore this email or contact our support team if you have any concerns.
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  </body>
  </html>`;
}

export const resetPasswordEmail = async (user, res) => {
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
    html: resetEmail(firstName, lastName, _id),
  };

  try {
    // Check if link already sent
    const passwordReset = await PasswordReset.findOne({ userId: _id });
    if (passwordReset) {
      return res.status(201).json({
        success: false,
        message:
          "A verification email has already been sent to your email! Check your email to reset your password",
      });
    } else {
      const resetPassword = await PasswordReset.create({
        userId: _id,
        token,
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000, // 10 minutes expiration
      });

      if (resetPassword) {
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
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting password!",
    });
  }
};
