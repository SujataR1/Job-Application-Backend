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
    <p>Thank you for registering with us. Please verify your email address by clicking the link below:</p>
    <a href="${otp}" style="color: #1d70b8; text-decoration: none;">Verify Email</a>
    <p>If you did not create an account, you can safely ignore this email.</p>
    <p>Thank you,<br>Your Application Team</p>
</body>
</html>
`;
