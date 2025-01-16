export const passwordResetTemplate = (userName: string, otp: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
</head>
<body>
    <h2>Hello ${userName},</h2>
    <p>You requested to reset your password. Use the OTP below to proceed:</p>
    <h3>${otp}</h3>
    <p>This OTP is valid for the next 10 minutes. If you didn’t request this, please ignore this email.</p>
    <p>Thank you,<br>Your Application Team</p>
</body>
</html>
`;

export const twoFaTemplate = (userName: string, otp: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Two-Factor Authentication</title>
</head>
<body>
    <h2>Hello ${userName},</h2>
    <p>Use the following One-Time Password (OTP) to complete your login:</p>
    <h3>${otp}</h3>
    <p>This OTP is valid for the next 10 minutes. If you didn’t attempt to log in, please secure your account immediately.</p>
    <p>Thank you,<br>Your Application Team</p>
</body>
</html>
`;

export const emailVerificationTemplate = (userName: string, otp: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
</head>
<body>
    <h2>Hello ${userName},</h2>
    <p>Thank you for registering with us. Please verify your email address using the following OTP:</p>
    <h3>${otp}</h3>
    <p>If you did not create an account, you can safely ignore this email.</p>
    <p>Thank you,<br>Your Application Team</p>
</body>
</html>
`;

export const companyInvitationTemplate = (
  userName: string,
  companyName: string,
  otp: string,
) => `
<!DOCTYPE html>
<html>
<head>
    <title>Company Invitation</title>
</head>
<body>
    <h2>Hello ${userName},</h2>
    <p>You have been invited to join the company <b>${companyName}</b>. Use the OTP below to accept the invitation:</p>
    <h3>${otp}</h3>
    <p>This OTP is valid for the next 10 minutes. If you didn’t expect this invitation, you can safely ignore this email.</p>
    <p>Thank you,<br>Your Application Team</p>
</body>
</html>
`;
