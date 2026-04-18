/**
 * Email Service using Nodemailer
 * Sends notifications for allocations and other system events
 */

const nodemailer = require('nodemailer');

// Initialize transporter
let transporter = null;

/**
 * Initialize email transporter
 */
function initializeTransporter() {
  if (transporter) return transporter;

  // Get SMTP configuration from environment
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Validate required fields
  if (!smtpHost) {
    console.error('❌ SMTP_HOST not configured in .env');
    return null;
  }

  if (!smtpUser) {
    console.error('❌ SMTP_USER (or EMAIL_USER) not configured in .env');
    return null;
  }

  if (!smtpPass) {
    console.error('❌ SMTP_PASS not configured in .env');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    console.log(`✓ Email service configured: ${smtpHost}:${smtpPort}`);
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    return null;
  }
}

/**
 * Send allocation notification to teacher
 * @param {object} options - Email options
 */
async function sendTeacherAllocationNotification(options) {
  try {
    const {
      teacherEmail,
      teacherName,
      studentName,
      studentEmail,
      subjects,
      curriculum,
      matchScore,
      allocationId
    } = options;

    const transporterInstance = transporter || initializeTransporter();

    const subjectList = Array.isArray(subjects)
      ? subjects.map(s => s.subjectName || s).join(', ')
      : 'General Tutoring';

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: teacherEmail,
      subject: `New Student Allocation: ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Student Allocation</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${teacherName}</strong>,</p>
            
            <p>You have been allocated a new student on the Smartious platform!</p>
            
            <div style="background: white; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #667eea;">Allocation Details</h3>
              <p><strong>Student Name:</strong> ${studentName}</p>
              <p><strong>Student Email:</strong> ${studentEmail}</p>
              <p><strong>Curriculum:</strong> ${curriculum}</p>
              <p><strong>Subjects:</strong> ${subjectList}</p>
              <p><strong>Match Score:</strong> <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${matchScore}%</span></p>
            </div>
            
            <p>This is a high-quality match based on your teaching expertise and the student's curriculum requirements.</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.CLIENT_URL || 'https://smartious.ac.ke'}/dashboard/allocations/${allocationId}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Allocation</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #666;">
              This is an automated message from Smartious E-School. Please do not reply to this email.<br>
              For support, contact: support@smartious.ac.ke
            </p>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Teacher notification sent to ${teacherEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send teacher notification:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send allocation notification to student
 * @param {object} options - Email options
 */
async function sendStudentAllocationNotification(options) {
  try {
    const {
      studentEmail,
      studentName,
      teacherName,
      subjects,
      curriculum,
      matchScore,
      allocationId
    } = options;

    const transporterInstance = transporter || initializeTransporter();

    const subjectList = Array.isArray(subjects)
      ? subjects.map(s => s.subjectName || s).join(', ')
      : 'General Tutoring';

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: studentEmail,
      subject: `Exciting News! You Have Been Assigned a Tutor`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Your Tutor is Ready!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${studentName}</strong>,</p>
            
            <p>Great news! We've found an excellent tutor for you on the Smartious platform.</p>
            
            <div style="background: white; border-left: 4px solid #f5576c; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #f5576c;">Your Tutor</h3>
              <p><strong>Tutor Name:</strong> ${teacherName}</p>
              <p><strong>Curriculum:</strong> ${curriculum}</p>
              <p><strong>Teaching Subjects:</strong> ${subjectList}</p>
              <p><strong>Compatibility Score:</strong> <span style="background: #f5576c; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${matchScore}%</span></p>
            </div>
            
            <p>Your tutor has been carefully matched based on your curriculum and subject requirements. You're all set to start your learning journey!</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.CLIENT_URL || 'https://smartious.ac.ke'}/dashboard/sessions" style="background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Your Sessions</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #666;">
              This is an automated message from Smartious E-School. Please do not reply to this email.<br>
              For support, contact: support@smartious.ac.ke
            </p>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Student notification sent to ${studentEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send student notification:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send admin verification email
 * @param {object} options - Email options
 */
async function sendAdminNotification(options) {
  try {
    const {
      adminEmail,
      studentName,
      teacherName,
      curriculum,
      matchScore,
      allocationId
    } = options;

    const transporterInstance = transporter || await initializeTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: adminEmail,
      subject: `[ADMIN] New Allocation: ${studentName} → ${teacherName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: #2c3e50; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Allocation Created</h1>
          </div>
          
          <div style="background: #ecf0f1; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>A new allocation has been created:</p>
            
            <div style="background: white; border-left: 4px solid #2c3e50; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p><strong>Student:</strong> ${studentName}</p>
              <p><strong>Teacher:</strong> ${teacherName}</p>
              <p><strong>Curriculum:</strong> ${curriculum}</p>
              <p><strong>Match Score:</strong> ${matchScore}%</p>
              <p><strong>Allocation ID:</strong> ${allocationId}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'https://smartious.ac.ke'}/admin/allocations/${allocationId}" style="background: #2c3e50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Review Allocation</a>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Admin notification sent to ${adminEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send admin notification:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send email verification link
 * @param {object} options - Email options
 */
async function sendVerificationEmail(options) {
  try {
    const { email, name, verificationLink, expiresIn } = options;

    const transporterInstance = transporter || await initializeTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: email,
      subject: 'Verify Your Email - Smartious Portal',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Smartious!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for signing up for the Smartious E-School platform. Please verify your email to get started.</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationLink}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666;">
              This link expires in ${expiresIn}. If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Verification email sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send verification email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * PHASE 5: Send login credentials to teacher
 * @param {object} options - Email options
 */
async function sendTeacherCredentialsEmail(options) {
  try {
    const {
      teacherEmail,
      teacherName,
      tempPassword,
      loginUrl,
      expiresIn
    } = options;

    const transporterInstance = initializeTransporter();
    
    if (!transporterInstance) {
      console.warn(`⚠️  Email not sent to ${teacherEmail} (SMTP not configured). Temp password: ${tempPassword}`);
      return { success: false, error: 'Email service not configured', tempPassword };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: teacherEmail,
      subject: 'Your Smartious Teacher Account - Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎓 Welcome to Smartious Teacher Portal!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${teacherName}</strong>,</p>
            
            <p>Your teacher account on the Smartious E-School platform has been created and is now active. Your login credentials are provided below.</p>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #856404;">⚠️ Important Security Notice</h3>
              <p><strong>Your account is active but requires an immediate password update for security purposes.</strong></p>
              <p>The temporary password below is valid for <strong>${expiresIn}</strong>. After logging in, you MUST change your password immediately.</p>
            </div>
            
            <div style="background: white; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #667eea;">Login Credentials</h3>
              <p><strong>Email:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 3px;">${teacherEmail}</code></p>
              <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 3px; font-size: 16px; font-weight: bold;">${tempPassword}</code></p>
              <p><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #667eea;">${loginUrl}</a></p>
            </div>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${loginUrl}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px;">
                Login Now
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            
            <h3 style="color: #667eea;">Next Steps:</h3>
            <ol style="line-height: 1.8;">
              <li>Click the "Login Now" button above or visit the login page</li>
              <li>Enter your email and temporary password</li>
              <li>You will be directed to a <strong>Secure Password Reset</strong> page</li>
              <li>Create a new, secure password and confirm it</li>
              <li>Once confirmed, you will have access to your teacher dashboard</li>
            </ol>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #666;">
              <strong>Security Reminder:</strong> Never share your login credentials. If you did not create this account or have concerns, please contact: support@smartious.ac.ke<br>
              This is an automated message from Smartious E-School. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Teacher credentials email sent to ${teacherEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send teacher credentials email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  initializeTransporter,
  sendTeacherAllocationNotification,
  sendStudentAllocationNotification,
  sendAdminNotification,
  sendVerificationEmail,
  sendTeacherCredentialsEmail
};

