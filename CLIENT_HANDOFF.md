# ElderGuide Follow-Up Survey

## What You're Getting

A branded, mobile-friendly survey that automatically follows up with families after a senior care placement. When a family clicks the link in their email, they'll see a personalized greeting — e.g., *"How is Darlene's experience at Angel Stars?"* — and can rate their experience with a simple star rating.

**Try it yourself:**
[https://followupsurvey.pages.dev/?client_id=David&loved_one=Darlene&facility=Angel%20Stars](https://followupsurvey.pages.dev/?client_id=David&loved_one=Darlene&facility=Angel%20Stars)

---

## How It Works

The survey intelligently routes families down one of two paths based on their rating:

**Happy families (4-5 stars):**
After rating, they're immediately encouraged to leave a public Google review for your business. Their positive rating is also emailed to you.

**Unhappy families (1-3 stars):**
Instead of being sent to Google, they see a private feedback form: *"What could be better?"* Their rating and written feedback are emailed directly to you — giving you a chance to follow up personally before anything goes public.

Every submission sends you an email that includes the star rating, the family's name, the facility, and any written feedback.

---

## Benefits

- **Protect your reputation.** Negative feedback comes to you privately instead of ending up on Google.
- **Generate more Google reviews.** Happy families are nudged to leave a public review right when they're feeling positive.
- **Zero manual work.** Once set up, the survey runs automatically through your Senior Place email workflows.
- **Personalized for every family.** Each link dynamically greets the family by name and references their specific facility.
- **Works on any device.** The survey is fully responsive — looks great on phones, tablets, and desktops.

---

## What It Costs

**Nothing.** The survey runs on free-tier infrastructure:

| Service | Purpose | Cost |
|---------|---------|------|
| Cloudflare Pages | Hosts the survey website | Free |
| Web3Forms | Delivers survey results to your email | Free (up to 250 emails/month) |

If your volume ever exceeds 250 survey responses per month, Web3Forms offers paid plans starting at $10/month for unlimited submissions.

---

## How to Set It Up

There are three one-time setup steps. Each takes about 5 minutes.

### Step 1: Activate Email Notifications

This connects the survey to your inbox so you receive results.

1. Go to [web3forms.com](https://web3forms.com/).
2. Enter the email address where you want to receive survey results.
3. Check your inbox — Web3Forms will send you an **Access Key** (a long string of letters and numbers).
4. Send me the Access Key and I'll plug it in for you — or, if you prefer to do it yourself:
   - Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
   - Go to **Workers & Pages** → **followupsurvey** → **Settings** → **Environment variables**.
   - Add: `VITE_WEB3FORMS_ACCESS_KEY` = *(your Access Key)*
   - Click **Save**, then go to **Deployments** and click **Retry deployment**.

### Step 2: Connect Your Google Review Link

This activates the "Leave a Google Review" button that happy families see.

1. Go to Google and search for your business name (make sure you're logged into the Google account that manages the business profile).
2. In the management dashboard, click **"Ask for reviews"**.
3. Copy the short link it gives you (looks like `https://g.page/r/YOUR_ID/review`).
4. Send me the link and I'll add it — or add it yourself in Cloudflare:
   - Same **Environment variables** page as Step 1.
   - Add: `VITE_GOOGLE_REVIEW_URL` = *(your Google review link)*
   - **Save** and trigger a new deployment.

### Step 3: Add the Survey Link to Senior Place

This is how the survey gets sent to families automatically.

1. In **Senior Place**, open the Email Template or Workflow you use for post-placement follow-ups.
2. In the email body, add a button or link with this URL:

```
https://followupsurvey.pages.dev/?client_id={{Client.Id}}&loved_one={{Client.FirstName}}&facility={{Community.Name}}
```

3. To insert the `{{ }}` parts, use the **`{ }` (Placeholders) button** in the Senior Place email editor. Select the **Client ID**, **Client First Name**, and **Community Name** fields from the dropdown.

When Senior Place sends the email, it will automatically replace those placeholders with each family's real information.

> **Important:** If someone visits the bare link (`followupsurvey.pages.dev`) without the family data attached, they'll see an "Invalid Link" screen. This is intentional — it prevents anonymous submissions.

---

## Working With Me

- **If you just want to send me the keys:** Send me your Web3Forms Access Key and Google Review link, and I'll configure everything for you. You'll only need to handle Step 3 (adding the link to Senior Place).
- **If something isn't working:** Send me a screenshot and the link you used. I can usually diagnose and fix issues same-day.
- **If you want to change the wording:** The greeting, feedback prompts, and all survey text can be updated anytime — just let me know what you'd like it to say.
