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

/**
 * Send leave request submitted notification to admin
 */
async function sendAdminLeaveRequestNotification(options) {
  try {
    const {
      adminEmail,
      teacherName,
      teacherEmail,
      leaveType,
      leaveStartDate,
      leaveEndDate,
      leaveReason,
      affectedStudents
    } = options;

    const transporterInstance = transporter || initializeTransporter();

    const startDate = new Date(leaveStartDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const endDate = new Date(leaveEndDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const dayCount = Math.ceil((new Date(leaveEndDate) - new Date(leaveStartDate)) / (1000 * 60 * 60 * 24)) + 1;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: adminEmail,
      subject: `🔔 New Leave Request from ${teacherName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 New Leave Request</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hello Admin,</p>
            
            <p><strong>${teacherName}</strong> has submitted a new leave request that requires your approval.</p>
            
            <div style="background: white; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #d97706;">Request Details</h3>
              <p><strong>Teacher:</strong> ${teacherName}</p>
              <p><strong>Email:</strong> ${teacherEmail}</p>
              <p><strong>Leave Type:</strong> ${leaveType}</p>
              <p><strong>Period:</strong> ${startDate} to ${endDate} (${dayCount} days)</p>
              <p><strong>Reason:</strong> ${leaveReason}</p>
              ${affectedStudents ? `<p><strong>Affected Students:</strong> ${affectedStudents} students may need reassignment</p>` : ''}
            </div>

            <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p><strong>⚠ Action Required:</strong> Please review this leave request in the admin portal and approve or reject it as soon as possible.</p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.CLIENT_URL || 'https://smartious.ac.ke'}/admin?page=leave" style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Review Leave Request</a>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #666;">
              This is an automated message from Smartious E-School. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Leave request notification sent to admin (${adminEmail})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send leave request admin notification:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send leave request approved notification to teacher
 */
async function sendLeaveRequestApprovedEmail(options) {
  try {
    const {
      teacherEmail,
      teacherName,
      leaveType,
      leaveStartDate,
      leaveEndDate,
      affectedStudents,
      approvedBy
    } = options;

    const transporterInstance = transporter || initializeTransporter();

    const startDate = new Date(leaveStartDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const endDate = new Date(leaveEndDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: teacherEmail,
      subject: `✅ Your Leave Request Has Been Approved`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">✅ Leave Approved</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${teacherName}</strong>,</p>
            
            <p>Good news! Your leave request has been approved by the admin team.</p>
            
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #16a34a;">Leave Details</h3>
              <p><strong>Leave Type:</strong> ${leaveType}</p>
              <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
              ${affectedStudents ? `<p><strong>Note:</strong> ${affectedStudents} of your students will be reassigned to other teachers during your absence.</p>` : ''}
              <p><strong>Approved by:</strong> ${approvedBy || 'Admin'}</p>
            </div>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p><strong>🎉 Important:</strong> You are all set for your leave. Your students and parents have been notified about their temporary teacher assignments.</p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #666;">
              If you have any questions, please contact support@smartious.ac.ke<br>
              This is an automated message from Smartious E-School.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Leave approved email sent to ${teacherEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send leave approved email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send leave request rejected notification to teacher
 */
async function sendLeaveRequestRejectedEmail(options) {
  try {
    const {
      teacherEmail,
      teacherName,
      leaveType,
      leaveStartDate,
      leaveEndDate,
      rejectionReason
    } = options;

    const transporterInstance = transporter || initializeTransporter();

    const startDate = new Date(leaveStartDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const endDate = new Date(leaveEndDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: teacherEmail,
      subject: `❌ Your Leave Request Has Been Rejected`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">❌ Leave Request Rejected</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${teacherName}</strong>,</p>
            
            <p>Unfortunately, your leave request could not be approved at this time.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #dc2626;">Request Details</h3>
              <p><strong>Leave Type:</strong> ${leaveType}</p>
              <p><strong>Requested Period:</strong> ${startDate} to ${endDate}</p>
            </div>

            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #dc2626;">Reason for Rejection</h3>
              <p>${rejectionReason || 'No specific reason provided'}</p>
            </div>

            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p><strong>💡 Next Steps:</strong> You may submit a new leave request for different dates or contact the admin team to discuss alternative options.</p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #666;">
              If you have questions about this decision, please contact support@smartious.ac.ke<br>
              This is an automated message from Smartious E-School.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Leave rejected email sent to ${teacherEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send leave rejected email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send leave request submitted confirmation to teacher
 */
async function sendLeaveRequestSubmittedEmail(options) {
  try {
    const {
      teacherEmail,
      teacherName,
      leaveType,
      leaveStartDate,
      leaveEndDate,
      leaveReason
    } = options;

    const transporterInstance = transporter || initializeTransporter();

    const startDate = new Date(leaveStartDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const endDate = new Date(leaveEndDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const dayCount = Math.ceil((new Date(leaveEndDate) - new Date(leaveStartDate)) / (1000 * 60 * 60 * 24)) + 1;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to: teacherEmail,
      subject: `📋 Your Leave Request Has Been Submitted for Review`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Leave Request Submitted</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${teacherName}</strong>,</p>
            
            <p>Your leave request has been successfully submitted and is pending admin review.</p>
            
            <div style="background: white; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #2563eb;">Request Summary</h3>
              <p><strong>Leave Type:</strong> ${leaveType}</p>
              <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
              <p><strong>Duration:</strong> ${dayCount} days</p>
              <p><strong>Reason:</strong> ${leaveReason}</p>
              <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">⏳ Pending Review</span></p>
            </div>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p><strong>ℹ️ What Happens Next:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>The admin team will review your request</li>
                <li>You'll receive an email notification when it's approved or rejected</li>
                <li>If approved, your students will be temporarily reassigned</li>
                <li>You can track the status in your teacher dashboard</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #666;">
              This is a confirmation email. Your request reference number is available in your dashboard.<br>
              This is an automated message from Smartious E-School.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Leave submitted confirmation email sent to ${teacherEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send leave submitted email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send a branded admin → teacher email.
 * Generic sender used by the Teacher Management "Email" tab.
 * The admin composes plain-text paragraphs; we wrap them in the
 * Smartious crimson/gold HTML shell. Plain-text line breaks become
 * paragraph breaks.
 *
 * @param {object} options
 * @param {string} options.to            recipient email
 * @param {string} options.teacherName   recipient display name
 * @param {string} options.subject       email subject
 * @param {string} options.bodyText      plain-text body (admin-written)
 * @param {string} [options.kind]        template kind label (memo / notice / etc.)
 * @param {string} [options.senderName]  admin/sender display name
 */
async function sendTeacherMemoEmail(options) {
  try {
    const {
      to, teacherName, subject, bodyText,
      kind = 'memo', senderName = 'Smartious Administration',
    } = options;

    if (!to || !subject || !bodyText) {
      return { success: false, error: 'Missing required email fields.' };
    }

    const transporterInstance = transporter || initializeTransporter();
    if (!transporterInstance) {
      return { success: false, error: 'Email service is not configured.' };
    }

    // Convert plain-text body to HTML paragraphs. Blank lines split
    // paragraphs; single newlines become <br>. Escape HTML first.
    const esc = (s) => String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const paragraphs = String(bodyText)
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p style="margin:0 0 14px;line-height:1.6;color:#2A2A2A;font-size:14px;">${esc(p).replace(/\n/g, '<br>')}</p>`)
      .join('');

    // Kind → small label shown in the email header strip
    const KIND_LABELS = {
      memo:         'Internal Memo',
      meeting:      'Meeting Request',
      commendation: 'Letter of Commendation',
      notice:       'Formal Notice',
      custom:       'Message',
    };
    const kindLabel = KIND_LABELS[kind] || 'Message';

    const html = `
      <div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;background:#FBFAF5;">
        <div style="background:linear-gradient(135deg,#7D1025 0%,#5A0B1B 100%);padding:28px 32px;">
          <div style="color:#F0CC5A;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">
            Smartious Homeschool &amp; eSchool
          </div>
          <div style="color:#FBFAF5;font-size:24px;margin-top:6px;">${esc(kindLabel)}</div>
        </div>
        <div style="padding:28px 32px;background:#FFFFFF;">
          <p style="margin:0 0 18px;font-size:14px;color:#2A2A2A;">Dear ${esc(teacherName || 'Colleague')},</p>
          ${paragraphs}
          <div style="margin-top:24px;padding-top:18px;border-top:1px solid #E8E2D6;">
            <p style="margin:0;font-size:14px;color:#2A2A2A;">Kind regards,</p>
            <p style="margin:2px 0 0;font-size:14px;font-weight:bold;color:#7D1025;">${esc(senderName)}</p>
            <p style="margin:2px 0 0;font-size:12px;color:#6B6B6B;font-family:Arial,sans-serif;">Smartious Homeschool &amp; eSchool</p>
          </div>
        </div>
        <div style="padding:16px 32px;background:#FBF6E3;text-align:center;">
          <p style="margin:0;font-size:11px;color:#8A6D1F;font-family:Arial,sans-serif;">
            This message was sent to ${esc(to)} by Smartious Administration.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartious.ac.ke',
      to,
      subject,
      html,
    };

    const info = await transporterInstance.sendMail(mailOptions);
    console.log(`✓ Teacher ${kind} email sent to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Failed to send teacher email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  initializeTransporter,
  sendTeacherAllocationNotification,
  sendStudentAllocationNotification,
  sendAdminNotification,
  sendVerificationEmail,
  sendTeacherCredentialsEmail,
  sendLeaveRequestSubmittedEmail,
  sendLeaveRequestApprovedEmail,
  sendLeaveRequestRejectedEmail,
  sendAdminLeaveRequestNotification,
  sendTeacherMemoEmail
};
