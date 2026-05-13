# ElderGuide Survey: Client Integration Guide

This document outlines the final steps required from the business owner to fully launch the ElderGuide Survey.

## 1. Setting Up Email Notifications (Required)

Every time a family completes the survey, you will receive an email with their rating, feedback, and which facility they were placed at. This requires a free Web3Forms access key.

**How to get your Access Key:**
1. Go to [Web3Forms.com](https://web3forms.com/).
2. Enter the email address where you want to receive survey results.
3. Check your inbox — Web3Forms will send you an **Access Key** (a long string of letters and numbers).

**How to add the key to your survey:**
1. Log into your **Cloudflare Dashboard**.
2. Go to **Workers & Pages** -> **followupsurvey** -> **Settings** -> **Environment variables**.
3. Under the Production environment, add a new variable:
   - **Variable name:** `VITE_WEB3FORMS_ACCESS_KEY`
   - **Value:** *(Paste your Access Key)*
4. Click **Save**.
5. Go to the **Deployments** tab and click **Retry deployment** on the most recent build to apply the changes.

> **Free Tier Note:** Web3Forms allows up to 250 emails per month on the free plan, which is more than sufficient for typical survey volumes.

---

## 2. Connecting the Google Review Button

When a user gives a 4 or 5-star rating, the survey shows a "Leave a Google Review" button. To activate this button, you need to generate a specific short link from your Google Business Profile.

**How to generate the Review Link:**
*(You must be logged into the Google Account that manages the Olympic Senior Advisors business profile.)*

1. Go to Google Search or Google Maps and search for your business.
2. If you are logged into the correct account, you will see a management dashboard directly in the search results.
3. Click the **"Ask for reviews"** button.
4. Copy the short link provided (it will look something like `https://g.page/r/YOUR_ID/review`).
   - *Reference: [Google Business Profile Help: Get a link for customers to write reviews](https://support.google.com/business/answer/16816815?hl=en)*

**How to add the link to the survey:**
1. In Cloudflare, go to **Workers & Pages** -> **followupsurvey** -> **Settings** -> **Environment variables**.
2. Add a new variable:
   - **Variable name:** `VITE_GOOGLE_REVIEW_URL`
   - **Value:** *(Paste the short link you generated above)*
3. Click **Save** and trigger a new deployment.

---

## 3. Generating Survey Links (Senior Place CRM)

When automating follow-up emails in **Senior Place**, you can use their built-in **Email Placeholders** to automatically generate a personalized survey link for every family.

1. Go to your post-placement Email Template (or Workflow) in Senior Place.
2. Type out the base URL: `https://followupsurvey.pages.dev/?`
3. Use the **`{ }` (Placeholders) button** in the Senior Place email editor to insert the dynamic variables exactly like this:

```text
https://followupsurvey.pages.dev/?client_id={{Client.Id}}&loved_one={{Client.FirstName}}&facility={{Community.Name}}
```
*(Note: The exact formatting of the `{ }` tags depends on Senior Place, but you just need to select the Client ID, Client First Name, and the Placed Community Name from the placeholder dropdown).*

When Senior Place sends the email, it will invisible swap those `{ }` tags with the real family data. If a family visits the bare `followupsurvey.pages.dev` link without this data attached, they will see an "Invalid Link" security screen.

---

## 4. What You'll Receive

For every survey submission, you will receive an email that includes:
- ⭐ **Star rating** (1-5, shown visually)
- 📝 **Written feedback** (if the family chose to leave any)
- 🏥 **Facility name**
- 🆔 **Client ID** (for CRM cross-reference)
- 💙 **Loved one's name**

**For negative reviews (1-3 stars):** The family is prompted to share private feedback before the email is sent. This gives you actionable context for follow-up.

**For positive reviews (4-5 stars):** The email is sent immediately, and the family is encouraged to leave a public Google review.
