-- Migration: Add Stripe fields to user_limits table
-- Description: Adds stripe_customer_id and stripe_subscription_id for payment tracking
-- Date: 2024-03-12

-- Add Stripe customer ID column
ALTER TABLE user_limits
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add Stripe subscription ID column
ALTER TABLE user_limits
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add subscription status column
ALTER TABLE user_limits
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Add subscription end date column (for tracking when subscription expires)
ALTER TABLE user_limits
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_limits_stripe_customer_id 
ON user_limits(stripe_customer_id);

-- Create index on stripe_subscription_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_limits_stripe_subscription_id 
ON user_limits(stripe_subscription_id);

-- Add comment to columns
COMMENT ON COLUMN user_limits.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN user_limits.stripe_subscription_id IS 'Stripe subscription ID for recurring payments';
COMMENT ON COLUMN user_limits.subscription_status IS 'Subscription status: active, inactive, canceled, past_due';
COMMENT ON COLUMN user_limits.subscription_end_date IS 'Date when subscription ends or renews';
