-- Create a function to handle mobile payment session creation
-- This will be called directly from the mobile app instead of using Edge Functions

CREATE OR REPLACE FUNCTION create_mobile_payment_session(
  booking_id_param UUID,
  user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_record RECORD;
  result JSON;
BEGIN
  -- Get booking details with validation
  SELECT 
    b.*,
    l.title as listing_title,
    l.price_per_day,
    p.name as owner_name,
    p.email as owner_email
  INTO booking_record
  FROM bookings b
  JOIN listings l ON b.listing_id = l.id
  JOIN profiles p ON l.owner_id = p.id
  WHERE b.id = booking_id_param
    AND b.renter_id = user_id_param
    AND b.status = 'payment_required'
    AND b.created_at > NOW() - INTERVAL '30 minutes'; -- Only allow payment within 30 minutes

  -- Check if booking exists and is valid
  IF booking_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Booking not found or not eligible for payment'
    );
  END IF;

  -- For now, return a mock payment URL that the mobile app can handle
  -- In a real implementation, this would call Stripe API
  -- But since we can't make external HTTP calls from SQL functions easily,
  -- we'll return the booking details and let the mobile app handle Stripe directly
  
  result := json_build_object(
    'success', true,
    'booking_id', booking_record.id,
    'amount', booking_record.total_amount,
    'currency', 'usd',
    'listing_title', booking_record.listing_title,
    'start_date', booking_record.start_date,
    'end_date', booking_record.end_date,
    'payment_url', 'stripe://checkout/mobile/' || booking_record.id::text
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_mobile_payment_session(UUID, UUID) TO authenticated;

