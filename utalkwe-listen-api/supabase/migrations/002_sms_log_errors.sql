-- Capture Twilio error details on failed SMS sends so we can diagnose
-- why texts aren't arriving instead of only seeing status='failed'.

ALTER TABLE sms_log
  ADD COLUMN IF NOT EXISTS error_code    TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT;
