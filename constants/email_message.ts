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
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Arial', 'Helvetica', sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 650px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
          <tr>
            <td style="padding: 0;">
              <!-- Document Header -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #2c3e50; padding: 30px 40px;">
                    <h1 style="color: #ffffff; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: 0.3px;">TDHaemoi Partnership Program</h1>
                  </td>
                </tr>
              </table>
  
              <!-- Document Title -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 40px 20px;">
                    <h2 style="color: #2c3e50; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 20px; font-weight: 600; margin: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 15px;">PARTNERSHIP ACCOUNT CONFIRMATION</h2>
                  </td>
                </tr>
              </table>
  
              <!-- Document Date -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #5d6975; font-size: 14px; margin: 0;">
                      Date: ${new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
                    </p>
                  </td>
                </tr>
              </table>
  
              <!-- Introduction -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                      Dear Partner,
                    </p>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                      Thank you for joining the TDHaemoi Partnership Program. We are pleased to confirm that your partnership account has been successfully established.
                    </p>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0;">
                      Please find your account credentials below:
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Credentials Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e0e0e0; border-collapse: collapse;">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 12px 20px; border-bottom: 1px solid #e0e0e0; width: 30%;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #2c3e50;">
                            Email Address:
                          </p>
                        </td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e0e0e0;">
                          <p style="margin: 0; font-size: 14px; color: #2c3e50; font-family: monospace;">
                            ${email}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 12px 20px; width: 30%;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #2c3e50;">
                            Password:
                          </p>
                        </td>
                        <td style="padding: 12px 20px;">
                          <p style="margin: 0; font-size: 14px; color: #2c3e50; font-family: monospace;">
                            ${password}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
  
              <!-- Security Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff9e6; border-left: 4px solid #f1c40f; padding: 15px;">
                      <tr>
                        <td style="padding: 10px 15px;">
                          <p style="color: #7d6608; font-size: 14px; line-height: 21px; margin: 0; font-weight: 500;">
                            <strong>IMPORTANT:</strong> For security purposes, we strongly recommend changing your password after your first login.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
  
              <!-- Access Instructions -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <h3 style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase;">Access Instructions</h3>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                      To access your partnership account, please follow these steps:
                    </p>
                    <ol style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px; padding-left: 20px;">
                      <li style="margin-bottom: 10px;">Navigate to our secure partner portal at <a href="${process.env.FRONTEND_URL}/login" style="color: #2980b9; text-decoration: none; font-weight: 500;">${process.env.FRONTEND_URL}/login</a></li>
                      <li style="margin-bottom: 10px;">Enter your email address and temporary password as provided above</li>
                      <li>Upon first login, you will be prompted to change your password</li>
                    </ol>
                  </td>
                </tr>
              </table>
  
              <!-- Next Steps -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <h3 style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase;">Next Steps</h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0;">
                            <strong>1.</strong> Complete your partnership profile
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0;">
                            <strong>2.</strong> Review our partnership guidelines and terms
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0;">
                            <strong>3.</strong> Explore available partnership opportunities
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0;">
                            <strong>4.</strong> Schedule an onboarding call with your partnership manager
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
  
              <!-- Contact Information -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h3 style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase;">Contact Information</h3>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
                      If you have any questions or require assistance, please contact our Partnership Support Team:
                    </p>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
                      <strong>Email:</strong> <a href="mailto:partnerships@tdhaemoi.com" style="color: #2980b9; text-decoration: none;">partnerships@tdhaemoi.com</a>
                    </p>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0;">
                      <strong>Phone:</strong> +1 (555) 123-4567
                    </p>
                  </td>
                </tr>
              </table>
  
              <!-- Closing -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                      We look forward to a successful and mutually beneficial partnership.
                    </p>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
                      Sincerely,
                    </p>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
                      <strong>TDHaemoi Partnership Team</strong>
                    </p>
                    <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0;">
                      TDHaemoi Corporation
                    </p>
                  </td>
                </tr>
              </table>
  
              <!-- Footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #7f8c8d; font-size: 13px; line-height: 20px; margin: 0;">
                      This is a system-generated email. Please do not reply directly to this message.<br>
                      © 2024 TDHaemoi Corporation. All rights reserved.
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