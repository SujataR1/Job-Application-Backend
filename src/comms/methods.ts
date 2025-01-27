const nodemailer = require('nodemailer');
import {
  passwordResetTemplate,
  twoFaTemplate,
  emailVerificationTemplate,
  companyInvitationTemplate,
} from './email-templates';

export enum EmailType {
  PasswordReset = 'PasswordReset',
  TwoFA = 'TwoFA',
  EmailVerification = 'EmailVerification',
  CompanyInvitation = 'CompanyInvitation',
}

export const sendEmail = async (
  to: string,
  userName: string,
  type: EmailType,
  otp: string,
  companyName?: string,
) => {
  let subject: string;
  let html: string;

  // Determine the email type and generate content
  switch (type) {
    case EmailType.PasswordReset:
      subject = 'Password Reset Request';
      html = passwordResetTemplate(userName, otp);
      break;

    case EmailType.TwoFA:
      subject = 'Your Two-Factor Authentication Code';
      html = twoFaTemplate(userName, otp);
      break;

    case EmailType.EmailVerification:
      subject = 'Verify Your Email Address';
      html = emailVerificationTemplate(userName, otp);
      break;

    case EmailType.CompanyInvitation: // New case for Company Invitation
      subject = 'You Are Invited to Join a Company';
      html = companyInvitationTemplate(userName, companyName, otp); // Replace <Company Name> dynamically
      break;

    default:
      throw new Error('Invalid email type');
  }

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === 'true', // Use SSL/TLS if secure is true
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send the email
  try {
    await transporter.sendMail({
      from: `"Your Application" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new Error('Failed to send email');
  }
};
