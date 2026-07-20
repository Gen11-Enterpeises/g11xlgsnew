# EmailJS Setup Guide — Linga Global School Website

This guide walks you through connecting the **Contact form** and **Admissions form** so they send real emails, instead of just showing a demo message. It takes about 5–10 minutes and EmailJS's free plan is enough to get started (200 emails/month).

You will only ever need to edit **one file**: `assets/js/emailjs-config.js`

---

## Step 1 — Create an EmailJS account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Click **Sign Up** and create a free account (you can sign up with Google).

---

## Step 2 — Connect an email service

1. In the EmailJS dashboard, go to **Email Services** (left sidebar).
2. Click **Add New Service**.
3. Choose your provider — Gmail, Outlook, Yahoo, or any custom SMTP. Gmail is the easiest.
4. Follow the prompts to connect the school's email account (e.g. `info@lingaschool.org`).
5. Once connected, EmailJS gives you a **Service ID** (looks like `service_abc1234`).
   → Copy this, you'll need it in Step 5.

---

## Step 3 — Create an email template for the Contact form

1. Go to **Email Templates** → **Create New Template**.
2. Give it a name, e.g. `Contact Form`.
3. In the template body, use these variables (they match the Contact form fields exactly):

   | Variable | Comes from |
   |---|---|
   | `{{user_name}}` | Name field |
   | `{{user_email}}` | Email field |
   | `{{message}}` | Message field |
   | `{{to_email}}` | Hidden field (school inbox) |

   Example template body:
   ```
   New enquiry from the website contact form.

   Name: {{user_name}}
   Email: {{user_email}}

   Message:
   {{message}}
   ```
4. Set the **To Email** field in the template settings to `{{to_email}}` (or hard-code the school's email address directly).
5. Set **Reply To** to `{{user_email}}` so you can hit "reply" and it goes straight to the parent.
6. Save the template and copy its **Template ID** (looks like `template_xyz9876`).
   → You'll need this in Step 5.

---

## Step 4 — Create an email template for the Admissions form

1. Go to **Email Templates** → **Create New Template** again.
2. Name it, e.g. `Admissions Form`.
3. Use these variables (matching the Admissions form fields):

   | Variable | Comes from |
   |---|---|
   | `{{parent_name}}` | Parent / Guardian Name |
   | `{{student_name}}` | Student Name |
   | `{{grade}}` | Applying for Grade |
   | `{{phone}}` | Phone Number |
   | `{{user_email}}` | Email Address |
   | `{{message}}` | Message (optional) |
   | `{{to_email}}` | Hidden field (school inbox) |

   Example template body:
   ```
   New admission application from the website.

   Parent / Guardian: {{parent_name}}
   Student: {{student_name}}
   Grade applying for: {{grade}}
   Phone: {{phone}}
   Email: {{user_email}}

   Message:
   {{message}}
   ```
4. Set **To Email** to `{{to_email}}` and **Reply To** to `{{user_email}}`, same as before.
5. Save and copy this template's **Template ID** too.

---

## Step 5 — Get your Public Key

1. Go to **Account** → **API Keys** (left sidebar / profile menu).
2. Copy your **Public Key** (looks like `A1b2C3d4E5f6G7h8`).

---

## Step 6 — Fill in the config file

Open `assets/js/emailjs-config.js` in the website files and replace the placeholder values:

```js
window.LGS_EMAILJS = {
  PUBLIC_KEY:             "YOUR_PUBLIC_KEY",            // from Step 5
  SERVICE_ID:             "YOUR_SERVICE_ID",             // from Step 2
  CONTACT_TEMPLATE_ID:    "YOUR_CONTACT_TEMPLATE_ID",    // from Step 3
  ADMISSION_TEMPLATE_ID:  "YOUR_ADMISSION_TEMPLATE_ID",  // from Step 4
  TO_EMAIL:               "info@lingaschool.org"         // where submissions should land
};
```

Save the file and upload/publish it along with the rest of the website. **That's it — no other files need to change.**

---

## Step 7 — Test it

1. Open `contact.html` on the live site, fill out the form, and submit.
2. Open `admissions.html` and do the same with the application form.
3. Check the inbox of the address set in `TO_EMAIL` — you should receive both test emails within a few seconds.
4. If something goes wrong, open your browser's Developer Console (F12 → Console tab) while submitting — any EmailJS error will be logged there, and the form will show a fallback message asking the visitor to call or email the school directly instead.

---

## Notes

- Until the config file is filled in, both forms will show a friendly "this form is almost ready" message instead of failing silently — so it's safe to publish the site before setting up EmailJS.
- The free EmailJS plan allows **200 emails/month**. If the school expects more admissions traffic than that, consider upgrading on [EmailJS pricing](https://www.emailjs.com/pricing/).
- Nothing else about the site (design, other pages, navigation) needs to change — this setup only affects the two forms on `contact.html` and `admissions.html`.
