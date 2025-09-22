import { supabase } from '../lib/supabase';

export interface IssueReportData {
  booking_id: string;
  reporter_role: 'owner' | 'renter';
  issue_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: string;
  occurred_at: string;
  financial_impact: boolean;
  estimated_cost: number;
  resolution_request?: string;
  contact_preference: 'email' | 'phone' | 'message';
  photos: string[];
}

export interface IssueReportResponse {
  success: boolean;
  report_id?: string;
  message: string;
  error?: string;
}

class IssueReportService {
  private static instance: IssueReportService;

  public static getInstance(): IssueReportService {
    if (!IssueReportService.instance) {
      IssueReportService.instance = new IssueReportService();
    }
    return IssueReportService.instance;
  }

  /**
   * Submit an issue report directly to Supabase
   * This bypasses the web API and submits directly to the database
   */
  async submitIssueReport(reportData: IssueReportData): Promise<IssueReportResponse> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return {
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated'
        };
      }

      // Verify user has access to this booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          renter_id,
          listings!listing_id (
            owner_id
          )
        `)
        .eq('id', reportData.booking_id)
        .single();

      if (bookingError || !booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: bookingError?.message || 'Invalid booking ID'
        };
      }

      // Check if user is authorized (either renter or owner)
      const isRenter = booking.renter_id === user.id;
      const isOwner = booking.listings?.owner_id === user.id;
      
      if (!isRenter && !isOwner) {
        return {
          success: false,
          message: 'Access denied',
          error: 'You are not authorized to report issues for this booking'
        };
      }

      // Upload photos to Supabase Storage if any
      const photoUrls: string[] = [];
      if (reportData.photos.length > 0) {
        for (let i = 0; i < reportData.photos.length; i++) {
          const photoUri = reportData.photos[i];
          try {
            const photoUrl = await this.uploadPhoto(photoUri, reportData.booking_id, i);
            if (photoUrl) {
              photoUrls.push(photoUrl);
            }
          } catch (photoError) {
            console.warn(`Failed to upload photo ${i}:`, photoError);
            // Continue with other photos even if one fails
          }
        }
      }

      // Insert issue report into database
      const { data: insertData, error: insertError } = await supabase
        .from('issue_reports')
        .insert({
          booking_id: reportData.booking_id,
          reporter_id: user.id,
          reporter_role: reportData.reporter_role,
          issue_type: reportData.issue_type,
          severity: reportData.severity,
          title: reportData.title,
          description: reportData.description,
          location: reportData.location || null,
          occurred_at: reportData.occurred_at,
          financial_impact: reportData.financial_impact,
          estimated_cost: reportData.estimated_cost,
          resolution_request: reportData.resolution_request || null,
          contact_preference: reportData.contact_preference,
          photos: photoUrls,
          status: 'open',
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting issue report:', insertError);
        return {
          success: false,
          message: 'Failed to submit report',
          error: insertError.message
        };
      }

      // Send notification to web backend (optional - for email/FCM notifications)
      try {
        await this.notifyWebBackend(insertData.id, reportData);
      } catch (notificationError) {
        console.warn('Failed to send notification to web backend:', notificationError);
        // Don't fail the entire request if notification fails
      }

      return {
        success: true,
        report_id: insertData.id,
        message: 'Issue report submitted successfully'
      };

    } catch (error) {
      console.error('Error submitting issue report:', error);
      return {
        success: false,
        message: 'Failed to submit report',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload a photo to Supabase Storage
   */
  private async uploadPhoto(photoUri: string, bookingId: string, index: number): Promise<string | null> {
    try {
      // Convert URI to blob for upload
      const response = await fetch(photoUri);
      const blob = await response.blob();
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${bookingId}/${timestamp}_${index}.jpg`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('issue-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Error uploading photo:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('issue-photos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadPhoto:', error);
      return null;
    }
  }

  /**
   * Notify web backend about new issue report for email/FCM notifications
   */
  private async notifyWebBackend(reportId: string, reportData: IssueReportData): Promise<void> {
    try {
      const webApiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://rentitforward.com.au';
      
      const response = await fetch(`${webApiUrl}/api/issue-reports/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_id: reportId,
          booking_id: reportData.booking_id,
          severity: reportData.severity,
          issue_type: reportData.issue_type,
          title: reportData.title,
        }),
      });

      if (!response.ok) {
        console.warn('Web backend notification failed:', response.status);
      }
    } catch (error) {
      console.warn('Failed to notify web backend:', error);
      // Don't throw - this is optional
    }
  }

  /**
   * Get issue reports for a specific booking
   */
  async getIssueReports(bookingId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('issue_reports')
        .select(`
          *,
          reporter:profiles!reporter_id (
            full_name,
            email
          )
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching issue reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getIssueReports:', error);
      return [];
    }
  }
}

export const issueReportService = IssueReportService.getInstance();


