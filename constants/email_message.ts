export const emailForgotPasswordOTP = (
    userName: string,
    email: string,
    OTP: string
  ): string => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://via.placeholder.com/150x50?text=Vigitade+Side+Hotel" alt="Vigitade Side Hotel Logo" style="max-width: 100%; height: auto;">
        </div>
        <h2 style="color: #007bff;">Password Reset Request</h2>
        <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
        <p style="color: #333; font-size: 16px;">We received a request to reset your password for your account with Vigitade Side Hotel. Please use the OTP code below to proceed:</p>
        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: #fff; font-size: 24px; font-weight: bold; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            ${OTP}
          </div>
        </div>
        <p style="color: #333; font-size: 16px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <p style="color: #333; font-size: 16px;">Warm regards,</p>
        <p style="color: #333; font-size: 16px;">The Vigitade Side Hotel Team</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you did not request a password reset, please disregard this message.</p>
      </div>
    `;
  };

  export const partnershipWelcomeEmail = (
    email: string,
    password: string
  ): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TDHaemoi Partnership</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
          <tr>
            <td style="padding: 0;">
              <!-- Header -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #1a73e8; padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 28px; font-weight: 600; margin: 0;">Welcome to TDHaemoi Partnership!</h1>
                  </td>
                </tr>
              </table>
  
              <!-- Content -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="color: #1a73e8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: 600; margin-top: 0;">Your Partnership Account Details</h2>
                    <p style="color: #3c4043; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 24px;">
                      Thank you for joining the TDHaemoi partnership program! We're excited to have you on board. Your account has been successfully created with the following credentials:
                    </p>
                    
                    <!-- Credentials Box -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #1a73e8; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0 0 10px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px;">
                        <strong style="color: #1a73e8;">Email:</strong>
                        <span style="color: #3c4043;">${email}</span>
                      </p>
                      <p style="margin: 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px;">
                        <strong style="color: #1a73e8;">Password:</strong>
                        <span style="color: #3c4043;">${password}</span>
                      </p>
                    </div>
  
                    <p style="color: #3c4043; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 24px;">
                      <strong style="color: #ea4335;">⚠️ Important:</strong> For security purposes, we strongly recommend changing your password after your first login.
                    </p>
  
                    <!-- Login Button -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${process.env.FRONTEND_URL}/login" style="background-color: #1a73e8; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 4px; display: inline-block;">Access Your Account</a>
                    </div>
  
                    <!-- Next Steps -->
                    <h3 style="color: #1a73e8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 600;">Next Steps</h3>
                    <ul style="color: #3c4043; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 24px; padding-left: 20px;">
                      <li>Log in to your account using the credentials above</li>
                      <li>Complete your partnership profile</li>
                      <li>Review our partnership guidelines</li>
                      <li>Explore available opportunities</li>
                    </ul>
  
                    <p style="color: #3c4043; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 24px; margin-top: 30px;">
                      If you have any questions or need assistance, our support team is here to help. Feel free to reach out to us anytime.
                    </p>
  
                    <p style="color: #3c4043; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 24px;">
                      Best regards,<br>
                      <strong>The TDHaemoi Team</strong>
                    </p>
                  </td>
                </tr>
              </table>
  
              <!-- Footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e8eaed;">
                    <p style="color: #5f6368; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; line-height: 18px; margin: 0;">
                      This is an automated message. Please do not reply directly to this email.<br>
                      © 2024 TDHaemoi. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };
  