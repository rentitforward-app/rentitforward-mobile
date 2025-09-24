interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface BookingData {
  id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  pickup_location?: string;
  renter_message?: string;
  listings: {
    title: string;
    images?: string[];
    city?: string;
    state?: string;
  };
  owner_profile: {
    full_name: string;
    email: string;
  };
  renter_profile: {
    full_name: string;
    email: string;
  };
}

/**
 * Email service for mobile app using Resend directly
 * This matches the web app's email functionality but runs independently
 */
export class EmailService {
  private provider: string;
  private fromEmail: string;

  constructor() {
    this.provider = process.env.EXPO_PUBLIC_EMAIL_PROVIDER || 'console';
    this.fromEmail = process.env.EXPO_PUBLIC_FROM_EMAIL || 'Rent it Forward <noreply@rentitforward.com.au>';
    
    // Debug logging
    console.log('📧 Mobile Email Service Configuration:');
    console.log('- Provider:', this.provider);
    console.log('- From Email:', this.fromEmail);
    console.log('- Resend API Key:', process.env.EXPO_PUBLIC_RESEND_API_KEY ? 'SET' : 'NOT SET');
  }

  /**
   * Send booking confirmation emails to both renter and owner
   */
  async sendBookingConfirmationEmails(bookingData: BookingData): Promise<EmailResponse> {
    try {
      console.log('📧 Sending booking confirmation emails for booking:', bookingData.id);
      
      // Send email to renter
      const renterEmailResult = await this.sendBookingConfirmationEmail({
        to: bookingData.renter_profile.email,
        recipientName: bookingData.renter_profile.full_name,
        isOwner: false,
        bookingData,
      });

      // Send email to owner
      const ownerEmailResult = await this.sendBookingConfirmationEmail({
        to: bookingData.owner_profile.email,
        recipientName: bookingData.owner_profile.full_name,
        isOwner: true,
        bookingData,
      });

      const success = renterEmailResult.success && ownerEmailResult.success;
      
      if (success) {
        console.log('✅ Both booking confirmation emails sent successfully');
        return { success: true };
      } else {
        console.warn('⚠️ Some confirmation emails failed to send');
        return {
          success: false,
          error: `Renter: ${renterEmailResult.error || 'OK'}, Owner: ${ownerEmailResult.error || 'OK'}`,
        };
      }
    } catch (error) {
      console.error('❌ Failed to send booking confirmation emails:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send individual booking confirmation email
   */
  private async sendBookingConfirmationEmail({
    to,
    recipientName,
    isOwner,
    bookingData,
  }: {
    to: string;
    recipientName: string;
    isOwner: boolean;
    bookingData: BookingData;
  }): Promise<EmailResponse> {
    try {
      // Format dates
      const startDate = new Date(bookingData.start_date).toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const endDate = new Date(bookingData.end_date).toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const subject = isOwner 
        ? `New Booking Confirmed - ${bookingData.listings.title}`
        : `Booking Confirmation - ${bookingData.listings.title}`;

      const html = isOwner 
        ? this.generateOwnerConfirmationEmail(bookingData, recipientName, startDate, endDate)
        : this.generateRenterConfirmationEmail(bookingData, recipientName, startDate, endDate);

      const text = html.replace(/<[^>]*>/g, ''); // Strip HTML for plain text

      return await this.sendEmail({
        to,
        subject,
        html,
        text,
      });
    } catch (error) {
      console.error('❌ Error preparing booking confirmation email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generic email sending method using Resend
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    const emailData = {
      ...options,
      from: options.from || this.fromEmail,
    };

    try {
      switch (this.provider) {
        case 'resend':
          return await this.sendWithResend(emailData);
        case 'console':
        default:
          return await this.sendToConsole(emailData);
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email using Resend API
   */
  private async sendWithResend(options: SendEmailOptions): Promise<EmailResponse> {
    if (!process.env.EXPO_PUBLIC_RESEND_API_KEY) {
      throw new Error('EXPO_PUBLIC_RESEND_API_KEY environment variable is required');
    }
    
    console.log('🔑 Using Resend API Key: [CONFIGURED]');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Email sent via Resend:', result.id);
    
    return {
      success: true,
      messageId: result.id,
    };
  }

  /**
   * Console logging for development (fallback)
   */
  private async sendToConsole(options: SendEmailOptions): Promise<EmailResponse> {
    console.log('📧 [CONSOLE EMAIL] Would send email:');
    console.log('- To:', options.to);
    console.log('- From:', options.from);
    console.log('- Subject:', options.subject);
    console.log('- HTML Length:', options.html.length);
    console.log('- Text Length:', options.text.length);
    
    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }

  /**
   * Generate renter confirmation email HTML
   */
  private generateRenterConfirmationEmail(
    bookingData: BookingData,
    recipientName: string,
    startDate: string,
    endDate: string
  ): string {
    const location = bookingData.listings.city && bookingData.listings.state 
      ? `${bookingData.listings.city}, ${bookingData.listings.state}`
      : 'Location TBD';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #44D62C; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; }
        .button { background: #44D62C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rentitforward.com.au/assets/images/RentitForwardMainLogo.png" alt="Rent it Forward" class="logo" />
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your rental is all set, ${recipientName}!</p>
        </div>
        
        <div class="content">
            <h2>Booking Details</h2>
            <div class="booking-details">
                <h3>${bookingData.listings.title}</h3>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Rental Period:</strong></p>
                <p>📅 <strong>Start:</strong> ${startDate}</p>
                <p>📅 <strong>End:</strong> ${endDate}</p>
                <p><strong>Total Paid:</strong> $${bookingData.total_amount.toFixed(2)} AUD</p>
                <p><strong>Booking ID:</strong> ${bookingData.id}</p>
            </div>

            <h3>What's Next?</h3>
            <ul>
                <li>💬 The host will be notified of your booking</li>
                <li>🔒 Your payment is held securely until the item is returned</li>
                <li>📞 Message each other to organise pickup and drop-off</li>
            </ul>

            <h3>Host Contact</h3>
            <div class="booking-details">
                <p><strong>Host:</strong> ${bookingData.owner_profile.full_name}</p>
                <p><strong>Pickup Location:</strong> ${bookingData.pickup_location || 'TBD'}</p>
                ${bookingData.renter_message ? `<p><strong>Your Message:</strong> ${bookingData.renter_message}</p>` : ''}
            </div>

            <h3>Payment Protection</h3>
            <ul>
                <li>✅ Your payment is protected by our secure payment system</li>
                <li>✅ Funds are held securely until successful item return</li>
                <li>✅ Platform fee and owner payment are automatically separated</li>
                <li>✅ Security deposit will be refunded after item return</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>Rent it Forward</strong> - Share More, Buy Less</p>
            <p>Building communities, one rental at a time.</p>
            <p>📧 <a href="mailto:hello@rentitforward.com.au" style="color: #44D62C;">hello@rentitforward.com.au</a> | 🌐 <a href="https://rentitforward.com.au" style="color: #44D62C;">rentitforward.com.au</a></p>
            <p style="font-size: 12px; margin-top: 15px;">© 2025 Rent it Forward. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate owner confirmation email HTML
   */
  private generateOwnerConfirmationEmail(
    bookingData: BookingData,
    recipientName: string,
    startDate: string,
    endDate: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Booking - ${bookingData.listings.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #44D62C; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; }
        .button { background: #44D62C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rentitforward.com.au/assets/images/RentitForwardMainLogo.png" alt="Rent it Forward" class="logo" />
            <h1>💰 New Booking Confirmed!</h1>
            <p>Great news, ${recipientName}! You have a new booking.</p>
        </div>
        
        <div class="content">
            <h2>Booking Details</h2>
            <div class="booking-details">
                <h3>${bookingData.listings.title}</h3>
                <p><strong>Renter:</strong> ${bookingData.renter_profile.full_name}</p>
                <p><strong>Rental Period:</strong></p>
                <p>📅 <strong>Start:</strong> ${startDate}</p>
                <p>📅 <strong>End:</strong> ${endDate}</p>
                <p><strong>Total Amount:</strong> $${bookingData.total_amount.toFixed(2)} AUD</p>
                <p><strong>Booking ID:</strong> ${bookingData.id}</p>
            </div>

            ${bookingData.renter_message ? `
            <h3>Message from Renter</h3>
            <div class="booking-details">
                <p>${bookingData.renter_message}</p>
            </div>
            ` : ''}

            <h3>Next Steps</h3>
            <ul>
                <li>🏠 Prepare the item for pickup/delivery</li>
                <li>💬 Message each other to organise pickup and drop-off</li>
                <li>📋 Review rental rules and item condition</li>
                <li>🔄 Payment will be released after successful return</li>
            </ul>

            <h3>Payment Information</h3>
            <div class="booking-details">
                <p><strong>Status:</strong> Payment confirmed and held securely</p>
                <p><strong>Release:</strong> Funds will be transferred to your account after successful rental completion</p>
                <p><strong>Platform Fee:</strong> Our commission is automatically deducted</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Rent it Forward</strong> - Share More, Buy Less</p>
            <p>Building communities, one rental at a time.</p>
            <p>📧 <a href="mailto:hello@rentitforward.com.au" style="color: #44D62C;">hello@rentitforward.com.au</a> | 🌐 <a href="https://rentitforward.com.au" style="color: #44D62C;">rentitforward.com.au</a></p>
            <p style="font-size: 12px; margin-top: 15px;">© 2025 Rent it Forward. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}

// Export a singleton instance
export const emailService = new EmailService();
