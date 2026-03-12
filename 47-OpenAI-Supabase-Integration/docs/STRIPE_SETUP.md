# 🔐 Stripe Payment Integration Setup Guide

This document contains all the instructions to configure and deploy the Stripe payment system.

---

## 📋 **Integration Summary**

### **Created Files:**

#### **Database:**
- ✅ `supabase/migrations/20240312_add_stripe_fields.sql` - Migration to add Stripe fields

#### **Edge Functions (Backend):**
- ✅ `supabase/functions/create-checkout-session/index.ts` - Creates checkout session
- ✅ `supabase/functions/stripe-webhook/index.ts` - Processes Stripe webhooks

#### **Frontend:**
- ✅ `src/services/stripe.service.ts` - Service to call Edge Functions
- ✅ `src/pages/PaymentSuccessPage.tsx` - Payment success page
- ✅ `src/pages/PaymentCancelPage.tsx` - Payment cancel page
- ✅ `src/components/Modals/UpgradeModal.tsx` - Modal updated with integration

#### **Routes:**
- ✅ `/payment-success` - Redirects here after successful payment
- ✅ `/payment-cancel` - Redirects here if user cancels

---

## 🚀 **Step 1: Deploy Edge Functions**

### **1.1 Install Supabase CLI (if you don't have it)**

```bash
# macOS
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### **1.2 Login to Supabase**

```bash
supabase login
```

### **1.3 Link your project**

```bash
# In the project root
supabase link --project-ref <YOUR_PROJECT_REF>
```

To get your `PROJECT_REF`:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > General
4. Copy the "Reference ID"

### **1.4 Deploy Edge Functions**

```bash
# Deploy checkout function
supabase functions deploy create-checkout-session

# Deploy webhook function
supabase functions deploy stripe-webhook
```

---

## 🔑 **Step 2: Configure Environment Variables**

### **2.1 Get Stripe Secret Key**

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your "Secret key" (starts with `sk_test_...`)

### **2.2 Get Stripe Webhook Secret**

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_...`)

### **2.3 Configure Secrets in Supabase**

```bash
# Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here

# Stripe Webhook Secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

---

## 🗄️ **Step 3: Run Database Migration**

The migration was already executed via MCP, but if you need to run it manually:

```bash
# From project root
supabase db push
```

Or execute the SQL directly in Supabase SQL Editor:

```sql
-- Content from supabase/migrations/20240312_add_stripe_fields.sql
ALTER TABLE user_limits
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE user_limits
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

ALTER TABLE user_limits
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

ALTER TABLE user_limits
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_limits_stripe_customer_id 
ON user_limits(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_limits_stripe_subscription_id 
ON user_limits(stripe_subscription_id);
```

---

## 🧪 **Step 4: Test the Integration**

### **4.1 Test Checkout Session**

1. Start your application: `npm run dev`
2. Login with your user
3. Try uploading a 4th document (after reaching limit)
4. Click "Upgrade to Pro"
5. You should be redirected to Stripe Checkout

**IMPORTANT:** The Edge Function requires authentication. You cannot call it directly from the browser without a JWT token. It must be called from the authenticated frontend using `stripeService.redirectToCheckout()`.

### **4.2 Test Payment (Test Mode)**

Use these Stripe test cards:

**Successful Payment:**
- Number: `4242 4242 4242 4242`
- Date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Failed Payment:**
- Number: `4000 0000 0000 0002`

### **4.3 Verify Webhook**

1. Complete a test payment
2. Go to https://dashboard.stripe.com/test/webhooks
3. Click on your endpoint
4. Verify events were received correctly
5. Check your database and verify `is_pro=true` for your user

---

## 🔍 **Step 5: Verify Everything Works**

### **Checklist:**

- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Webhook configured in Stripe
- [ ] Database migration executed
- [ ] Checkout session creates correctly
- [ ] Redirect to Stripe works
- [ ] Test payment completes successfully
- [ ] User updated to Pro in database
- [ ] Success page displays correctly
- [ ] Limits updated to unlimited (∞)

---

## 🐛 **Troubleshooting**

### **Error: "Invalid JWT" (401)**

This is **normal** if you're calling the Edge Function directly from the browser. The function requires authentication and must be called from the frontend using:

```typescript
import { stripeService } from '@/services/stripe.service';

// In your component
await stripeService.redirectToCheckout();
```

The service automatically includes the JWT token in the request.

### **Error: "Function not found"**

```bash
# Verify functions are deployed
supabase functions list
```

### **Error: "Missing Stripe secret"**

```bash
# Verify secrets
supabase secrets list

# If not present, configure them again
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Error: "Webhook signature verification failed"**

1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Ensure webhook URL in Stripe is correct
3. Verify selected events are correct

### **Error: "User not upgraded after payment"**

1. Go to Stripe Dashboard > Webhooks
2. Verify `checkout.session.completed` event was received
3. Check Edge Function logs:

```bash
supabase functions logs stripe-webhook
```

---

## 📊 **Monitoring**

### **View Edge Function logs:**

```bash
# Checkout logs
supabase functions logs create-checkout-session

# Webhook logs
supabase functions logs stripe-webhook
```

### **View events in Stripe:**

1. Go to https://dashboard.stripe.com/test/events
2. Filter by event type
3. Review event details

---

## 🔄 **Update Edge Functions**

If you make changes to Edge Functions:

```bash
# Deploy changes
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

---

## 🎯 **Next Steps (Production)**

When ready for production:

1. **Switch to production keys:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Update webhook to production:**
   - Create new webhook in live mode
   - Update `STRIPE_WEBHOOK_SECRET`

3. **Update Price ID:**
   - In `create-checkout-session/index.ts` line 83
   - Change to your production Price ID

4. **Test thoroughly:**
   - Make small real payments
   - Verify webhooks
   - Confirm database updates

---

## 📞 **Support**

If you have issues:

1. Check Supabase logs
2. Check Stripe events
3. Verify webhook configuration
4. Ensure environment variables are correct

---

## ✅ **Complete System**

Once all steps are completed, your payment system will be fully functional:

- ✅ Users can upgrade to Pro
- ✅ Payments processed by Stripe
- ✅ Webhooks automatically update database
- ✅ Limits updated to unlimited
- ✅ Recurring subscriptions work
- ✅ Cancellations handled correctly

🎉 **Ready to accept payments!**
