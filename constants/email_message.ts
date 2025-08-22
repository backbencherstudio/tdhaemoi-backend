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
                      Date: ${new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
                      <li style="margin-bottom: 10px;">Navigate to our secure partner portal at <a href="${
                        process.env.FRONTEND_URL
                      }/login" style="color: #2980b9; text-decoration: none; font-weight: 500;">${
    process.env.FRONTEND_URL
  }/login</a></li>
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
  suggestion: string
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
                      Date: ${new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
    `;
};

export const newImprovementEmail = (
  company: string,
  phone: string,
  reason: string,
  message: string
): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>ASPAPIC - New Improvement Suggestion</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Arial', 'Helvetica', sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
      <tr>
        <td style="padding: 0;">
          <!-- Header -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background-color: #0f172a; padding: 30px 40px;">
                <h1 style="color: #ffffff; font-size: 24px; margin: 0;">ASPAPIC System Notification</h1>
              </td>
            </tr>
          </table>

          <!-- Title -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 40px 40px 20px;">
                <h2 style="color: #1e293b; font-size: 20px; margin: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 15px;">New Improvement Suggestion</h2>
              </td>
            </tr>
          </table>

          <!-- Date -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 0 40px 30px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">Submitted on: ${new Date().toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</p>
              </td>
            </tr>
          </table>

          <!-- Details -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 0 40px 30px;">
                <table width="100%" style="border: 1px solid #e2e8f0; border-collapse: collapse;">
                  <tr>
                    <td style="background-color: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e2e8f0; width: 30%;">
                      <strong style="font-size: 14px; color: #334155;">Company:</strong>
                    </td>
                    <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">${company}</td>
                  </tr>
                  <tr>
                    <td style="background-color: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
                      <strong style="font-size: 14px; color: #334155;">Phone:</strong>
                    </td>
                    <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">${phone}</td>
                  </tr>
                  <tr>
                    <td style="background-color: #f1f5f9; padding: 12px 20px;">
                      <strong style="font-size: 14px; color: #334155;">Reason:</strong>
                    </td>
                    <td style="padding: 12px 20px;">${reason}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Message Content -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 0 40px 30px;">
                <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase;">Suggestion Message</h3>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px;">
                  <p style="margin: 0; font-size: 15px; line-height: 24px; color: #334155; white-space: pre-line;">
                    ${message}
                  </p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Info Notice -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 0 40px 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px;">
                  <tr>
                    <td style="padding: 10px 15px;">
                      <p style="color: #1d4ed8; font-size: 14px; margin: 0; font-weight: 500;">
                        <strong>NOTE:</strong> This suggestion has been recorded and forwarded to the internal review team. Thank you for contributing to our platform’s improvement.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background-color: #f1f5f9; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0;">
                  This is an automated notification from the ASPAPIC system. Please do not reply.<br>
                  &copy; ${new Date().getFullYear()} ASPAPIC. All rights reserved.
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

export const adminLoginNotificationEmail = (
  adminEmail: string,
  adminName: string,
  loginDate: string,
  loginTime: string,
  ipAddress: string
): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Admin Panel Access Alert - TDHaemoi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Arial', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      
      <!-- Header -->
      <tr>
        <td style="background-color: #1a237e; padding: 24px 32px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 22px; margin: 0;">Admin Panel Access Alert</h2>
        </td>
      </tr>

      <!-- Intro -->
      <tr>
        <td style="padding: 24px 32px; color: #2c3e50;">
          <p style="font-size: 16px; margin: 0 0 12px;">Hi <strong>${
            adminName || "Admin"
          }</strong>,</p>
          <p style="font-size: 15px; margin: 0 0 16px;">
            This is to confirm that your TDHaemoi admin account was accessed. Please find the login details below for your records.
          </p>
        </td>
      </tr>

      <!-- Login Info -->
      <tr>
        <td style="padding: 0 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 6px; background-color: #f9fafb;">
            <tr>
              <td style="padding: 12px 20px; border-bottom: 1px solid #eee;">
                <strong style="color: #2c3e50;">Email:</strong> ${adminEmail}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 20px; border-bottom: 1px solid #eee;">
                <strong style="color: #2c3e50;">Name:</strong> ${adminName}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 20px; border-bottom: 1px solid #eee;">
                <strong style="color: #2c3e50;">Login Date:</strong> ${loginDate}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 20px; border-bottom: 1px solid #eee;">
                <strong style="color: #2c3e50;">Login Time:</strong> ${loginTime}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 20px;">
                <strong style="color: #2c3e50;">IP Address:</strong> ${ipAddress}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Professional Note -->
      <tr>
        <td style="padding: 0 32px 24px;">
          <div style="background-color: #edf2ff; border-left: 4px solid #1e40af; padding: 16px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
              You're receiving this message because your credentials were used to access the admin panel.  
              If this was expected, no further action is required.  
              For internal auditing or multi-device reviews, you may check your admin activity log at your convenience.
            </p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #f5f6f8; padding: 20px 32px; text-align: center;">
          <p style="font-size: 13px; color: #7f8c8d; margin: 0;">
            TDHaemoi Admin Notification System<br>
            &copy; ${new Date().getFullYear()} TDHaemoi Corporation. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const sendPdfToEmailTamplate = (pdf: any): any => `
  <!DOCTYPE html>
  <html>
  <body>
    <h2>Your Exercise Program</h2>
    <p>Please download the attached PDF document to view your exercise program.</p>
    <p>If you can't see the attachment, <a href="#">download it here</a>.</p>
  </body>
  </html>
`;

export const excerciseEmail = (base64String: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Exercise Program</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Make the PDF viewer take full screen */
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
        }

        iframe {
          width: 100%;
          height: 100%;
          border: none; /* Remove the default border around the iframe */
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Arial', sans-serif;">
      <iframe src="data:application/pdf;base64,${base64String}"></iframe>
    </body>
    </html>
  `;
};