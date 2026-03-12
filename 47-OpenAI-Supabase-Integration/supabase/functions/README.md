# Supabase Edge Functions - Stripe Integration

This directory contains the Edge Functions deployed to Supabase for handling Stripe integration.

---

## 📁 **Structure**

```
supabase/functions/
├── create-checkout-session/
│   └── index.ts          # Creates Stripe Checkout session
├── stripe-webhook/
│   └── index.ts          # Processes Stripe webhooks
└── README.md             # This file
```

---

## 🔧 **Edge Functions vs Traditional Backend**

### **What are Edge Functions?**

Edge Functions are **serverless functions** that run on the edge (close to the user) using **Deno runtime**. They are Supabase's alternative to AWS Lambda or Vercel Functions.

### **Comparison:**

| Aspect | Edge Functions (Current) | Traditional Backend (API) |
|---------|------------------------|---------------------------|
| **Infrastructure** | Serverless (no server) | Requires server (Express, FastAPI, etc.) |
| **Scalability** | Auto-scalable | Manual (Docker, PM2, etc.) |
| **Cost** | Pay-per-use (free up to 500K requests/month) | 24/7 running server |
| **Maintenance** | Zero (Supabase handles it) | High (updates, security, monitoring) |
| **Deploy** | `supabase functions deploy` | Complete CI/CD pipeline |
| **Runtime** | Deno (native TypeScript) | Node.js, Python, etc. |
| **Cold Start** | ~100-300ms | 0ms (always active) |
| **Integration** | Native with Supabase Auth/DB | Requires manual configuration |

---

## 🚀 **If We Used a Traditional Backend**

### **Option 1: Express.js (Node.js)**

```javascript
// backend/routes/stripe.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Endpoint: POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user || user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get or create customer
    const { data: userLimits } = await supabase
      .from('user_limits')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId = userLimits?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      await supabase.from('user_limits').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: 'price_1T9xv8IYCNHVwUcqFTvkSOvR', quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: { supabase_user_id: userId },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint: POST /api/stripe/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await supabase.from('user_limits').update({
          is_pro: true,
          stripe_subscription_id: session.subscription,
          subscription_status: 'active',
          documents_limit: -1,
          transcripts_limit: -1,
        }).eq('user_id', session.metadata.supabase_user_id);
        break;
      
      // ... otros eventos
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

**Would require:**
- Express server running 24/7
- `package.json` with dependencies
- Environment variables
- Deploy process (Heroku, Railway, DigitalOcean, etc.)
- Monitoring and logs
- SSL/HTTPS
- CORS configured

---

### **Option 2: FastAPI (Python)**

```python
# backend/routes/stripe_routes.py
from fastapi import APIRouter, HTTPException, Request, Header
from stripe import stripe
from supabase import create_client
import os

router = APIRouter()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

@router.post('/create-checkout-session')
async def create_checkout_session(
    request: Request,
    authorization: str = Header(None)
):
    try:
        # Verify user
        token = authorization.replace('Bearer ', '')
        user = supabase.auth.get_user(token)
        
        # Similar logic to Express...
        
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post('/webhook')
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )
        
        # Process events...
        
        return {"received": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

**Would require:**
- Uvicorn/Gunicorn server
- `requirements.txt`
- Deploy on Python server
- Same overhead as Express

---

## ✅ **Advantages of Edge Functions (Our Implementation)**

1. **Zero Infrastructure**: No server, Docker, or anything needed
2. **Auto-scalable**: Handles 1 or 1 million requests without changes
3. **Native Integration**: Direct access to Supabase Auth and DB
4. **Native TypeScript**: Deno supports TS without compilation
5. **Simple Deploy**: One command and done
6. **Cost Effective**: Free up to 500K invocations/month
7. **Security**: Encrypted environment variables
8. **Integrated Logs**: `supabase functions logs`

---

## 📝 **When to Use Traditional Backend**

Consider a traditional backend if you need:

- **Very complex logic** requiring multiple services
- **Persistent WebSockets** (although Supabase Realtime exists)
- **Heavy processing** (>10 seconds execution)
- **Specific libraries** not available in Deno
- **Total control** over runtime and configuration

---

## 🔄 **How to Update Edge Functions**

If you need to modify the functions:

1. **Edit the local file**:
   ```bash
   # Edit: supabase/functions/create-checkout-session/index.ts
   # or: supabase/functions/stripe-webhook/index.ts
   ```

2. **Deploy changes**:
   ```bash
   supabase functions deploy create-checkout-session
   # or
   supabase functions deploy stripe-webhook
   ```

3. **Check logs**:
   ```bash
   supabase functions logs create-checkout-session
   supabase functions logs stripe-webhook
   ```

---

## 🌐 **Edge Functions URLs**

- **Checkout**: `https://wzmnxjohqflaiogblxoh.supabase.co/functions/v1/create-checkout-session`
- **Webhook**: `https://wzmnxjohqflaiogblxoh.supabase.co/functions/v1/stripe-webhook`

---

## 🔐 **Configured Environment Variables**

The following secrets are configured in Supabase:

- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook secret
- `SUPABASE_URL` - Auto-injected by Supabase
- `SUPABASE_ANON_KEY` - Auto-injected by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-injected by Supabase

---

## 📚 **Resources**

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

---

## 🎯 **Conclusion**

**Edge Functions are perfect for this use case** because:
- We only need 2 simple endpoints
- No complex logic
- Direct integration with Supabase
- $0 cost with our volume
- Deploy in seconds

If in the future you need more control or complex features, you can migrate to a traditional backend, but for Stripe payments, Edge Functions are the ideal solution. 🚀
