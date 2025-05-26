export const emailForgotPasswordOTP = (email: string, OTP: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Verification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Arial', 'Helvetica', sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
        <tr>
          <td style="padding: 0;">
            <!-- Header -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="background-color: #2c3e50; padding: 30px 40px;">
                  <h1 style="color: #ffffff; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: 0.3px;">TDHaemoi Security</h1>
                </td>
              </tr>
            </table>

            <!-- Document Title -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 40px 40px 20px;">
                  <h2 style="color: #2c3e50; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 20px; font-weight: 600; margin: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 15px;">PASSWORD RESET VERIFICATION</h2>
                </td>
              </tr>
            </table>

            <!-- Introduction -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 0 40px 30px;">
                  <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                    Dear User,
                  </p>
                  <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                    We have received a request to reset the password for your TDHaemoi account. To verify your identity and proceed with this request, please use the following One-Time Password (OTP):
                  </p>
                </td>
              </tr>
            </table>
            
            <!-- OTP Box -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 0 40px 30px; text-align: center;">
                  <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; display: inline-block; min-width: 200px;">
                    <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 1px;">
                      Verification Code
                    </p>
                    <p style="margin: 0; font-family: monospace; font-size: 28px; font-weight: 700; color: #2c3e50; letter-spacing: 4px;">
                      ${OTP}
                    </p>
                  </div>
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
                          <strong>IMPORTANT:</strong> This verification code will expire in 10 minutes. If you did not request a password reset, please disregard this message and consider reviewing your account security.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Instructions -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 0 40px 30px;">
                  <h3 style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase;">Next Steps</h3>
                  <ol style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Enter the verification code on the password reset page</li>
                    <li style="margin-bottom: 10px;">Create a new, secure password</li>
                    <li>Log in with your new password</li>
                  </ol>
                </td>
              </tr>
            </table>

            <!-- Closing -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 0 40px 40px;">
                  <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                    If you need any assistance, please contact our support team.
                  </p>
                  <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
                    Regards,
                  </p>
                  <p style="color: #2c3e50; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
                    <strong>TDHaemoi Security Team</strong>
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
                  <p style="color: #7f8c8d; font-size: 13px; line-height: 20px; margin: 0 0 10px;">
                    This email was sent to ${email}
                  </p>
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

  export const newSuggestionEmail = (
    name: string,
    email: string,
    phone: string,
    firma: string,
    suggestion: string,
  ): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ASPAPIC - New Suggestion Notification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Arial', 'Helvetica', sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
          <tr>
            <td style="padding: 0;">
              <!-- Header -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #1e3a8a; padding: 30px 40px;">
                    <h1 style="color: #ffffff; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: 0.3px;">ASPAPIC</h1>
                  </td>
                </tr>
              </table>
  
              <!-- Document Title -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 40px 20px;">
                    <h2 style="color: #1e3a8a; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 20px; font-weight: 600; margin: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 15px;">NEW SUGGESTION RECEIVED</h2>
                  </td>
                </tr>
              </table>
  
              <!-- Document Date -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #5d6975; font-size: 14px; margin: 0;">
                      Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </td>
                </tr>
              </table>
  
              <!-- Introduction -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                      A new suggestion has been submitted through the ASPAPIC feedback system. Please find the details below:
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Submitter Information -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e0e0e0; border-collapse: collapse;">
                      <tr>
                        <td style="background-color: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e0e0e0; width: 30%;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #334155;">
                            Name:
                          </p>
                        </td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e0e0e0;">
                          <p style="margin: 0; font-size: 14px; color: #334155;">
                            ${name}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e0e0e0; width: 30%;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #334155;">
                            Email:
                          </p>
                        </td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e0e0e0;">
                          <p style="margin: 0; font-size: 14px; color: #334155;">
                            ${email}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e0e0e0; width: 30%;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #334155;">
                            Phone:
                          </p>
                        </td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e0e0e0;">
                          <p style="margin: 0; font-size: 14px; color: #334155;">
                            ${phone}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f1f5f9; padding: 12px 20px; width: 30%;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #334155;">
                            Organization:
                          </p>
                        </td>
                        <td style="padding: 12px 20px;">
                          <p style="margin: 0; font-size: 14px; color: #334155;">
                            ${firma}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
  
              <!-- Suggestion Content -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase;">Suggestion Details</h3>
                    <div style="background-color: #f1f5f9; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px;">
                      <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0; white-space: pre-line;">
                        ${suggestion}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
  
              <!-- Notification -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px;">
                      <tr>
                        <td style="padding: 10px 15px;">
                          <p style="color: #1e40af; font-size: 14px; line-height: 21px; margin: 0; font-weight: 500;">
                            <strong>NOTE:</strong> This suggestion has been recorded in our system. Thank you for your attention to this feedback.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
  
              <!-- Closing -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
                      If you have any questions about this suggestion, please contact our support team.
                    </p>
                    <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
                      Regards,
                    </p>
                    <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0;">
                      <strong>ASPAPIC Team</strong>
                    </p>
                  </td>
                </tr>
              </table>
  
              <!-- Footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #64748b; font-size: 13px; line-height: 20px; margin: 0;">
                      This is an automated notification from the ASPAPIC system. Please do not reply to this email.<br>
                      © 2024 ASPAPIC. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

 export const adminLoginNotificationEmail = (
    adminEmail: string,
    loginDate: string,
    loginTime: string,
    timezone: string,
    ipAddress: string
  ): string => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Admin Login Alert - TDHaemoi</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f2f4f8; font-family: 'Arial', sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: auto; max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <tr>
          <td style="background-color: #1a237e; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">⚠️ Admin Login Alert</h1>
          </td>
        </tr>
  
        <!-- Intro -->
        <tr>
          <td style="padding: 30px 40px; color: #2c3e50;">
            <p style="margin: 0 0 10px; font-size: 16px;">
              Hello Admin,
            </p>
            <p style="margin: 0 0 15px; font-size: 15px; line-height: 24px;">
              A new login was detected in your TDHaemoi Admin Panel. Below are the details of this login attempt. If this was not you, please take action immediately.
            </p>
          </td>
        </tr>
  
        <!-- Login Info -->
        <tr>
          <td style="padding: 0 40px 30px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #f9f9f9; border: 1px solid #dcdcdc; border-radius: 6px;">
              <tr>
                <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                  <strong style="color: #34495e;">👤 Admin Account:</strong> ${adminEmail}
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                  <strong style="color: #34495e;">📆 Date:</strong> ${loginDate}
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                  <strong style="color: #34495e;">⏰ Time:</strong> ${loginTime}
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                  <strong style="color: #34495e;">🌐 Timezone:</strong> ${timezone}
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 20px;">
                  <strong style="color: #34495e;">📍 IP Address:</strong> ${ipAddress}
                </td>
              </tr>
            </table>
          </td>
        </tr>
  
        <!-- Security Warning -->
        <tr>
          <td style="padding: 0 40px 30px;">
            <table width="100%" style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
              <tr>
                <td>
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>NOTE:</strong> If this login was not performed by you, please reset your password immediately and contact support for further investigation.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
  
        <!-- Footer -->
        <tr>
          <td style="background-color: #f1f3f5; padding: 20px 40px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 13px; margin: 0;">
              This is an automated security message from TDHaemoi Admin System.<br>
              &copy; ${new Date().getFullYear()} TDHaemoi Corporation. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  };
  
  