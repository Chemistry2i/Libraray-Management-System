const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const emailTemplates = {
  borrowRequest: (userName, bookTitle, dueDate) => ({
    subject: `📚 Book Borrow Request Received - ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #0f766e; margin: 0 0 20px 0;">📚 Request Received</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi <strong>${userName}</strong>,
          </p>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Your borrow request for <strong>"${bookTitle}"</strong> has been received and is now awaiting librarian approval.
          </p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <p style="color: #374151; margin: 0; font-size: 14px;">
              ✅ <strong>Status:</strong> Pending Approval<br/>
              📖 <strong>Book:</strong> ${bookTitle}<br/>
              📅 <strong>Expected Due Date:</strong> ${dueDate}
            </p>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            You'll receive another email once the librarian reviews your request. This usually takes 1-2 hours.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">LMS Uganda - Library Management System</p>
        </div>
      </div>
    `
  }),

  borrowApproved: (userName, bookTitle, dueDate, lateFee) => ({
    subject: `✅ Book Approved for Pickup - ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #059669; margin: 0 0 20px 0;">✅ Borrow Approved!</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Great news, <strong>${userName}</strong>!
          </p>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Your borrow request for <strong>"${bookTitle}"</strong> has been <strong style="color: #059669;">APPROVED</strong>! 📚
          </p>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <p style="color: #065f46; margin: 0; font-size: 14px;">
              ✅ <strong>Status:</strong> Ready for Pickup<br/>
              📖 <strong>Book:</strong> ${bookTitle}<br/>
              📅 <strong>Due Date:</strong> ${dueDate}<br/>
              💰 <strong>Late Fee:</strong> Shs ${lateFee}/day if overdue
            </p>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Please pick up your book from the library desk. Remember to return it by <strong>${dueDate}</strong> to avoid late fees.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">LMS Uganda - Library Management System</p>
        </div>
      </div>
    `
  }),

  borrowRejected: (userName, bookTitle, reason) => ({
    subject: `❌ Borrow Request Declined - ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #dc2626; margin: 0 0 20px 0;">❌ Request Not Approved</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi <strong>${userName}</strong>,
          </p>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Unfortunately, your borrow request for <strong>"${bookTitle}"</strong> could not be approved at this time.
          </p>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="color: #7f1d1d; margin: 0; font-size: 14px;">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Please feel free to:
            <br/>• Request a different book
            <br/>• Contact the library for more information
            <br/>• Try requesting again later
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">LMS Uganda - Library Management System</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, emailType, data) => {
  try {
    let emailContent;
    
    switch(emailType) {
      case 'borrow_request':
        emailContent = emailTemplates.borrowRequest(data.userName, data.bookTitle, data.dueDate);
        break;
      case 'borrow_approved':
        emailContent = emailTemplates.borrowApproved(data.userName, data.bookTitle, data.dueDate, data.lateFee);
        break;
      case 'borrow_rejected':
        emailContent = emailTemplates.borrowRejected(data.userName, data.bookTitle, data.reason);
        break;
      default:
        throw new Error('Unknown email type');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      ...emailContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} - Type: ${emailType}`);
    return true;
  } catch (error) {
    console.error(`❌ Email sending failed:`, error);
    return false;
  }
};

module.exports = {
  sendEmail
};
