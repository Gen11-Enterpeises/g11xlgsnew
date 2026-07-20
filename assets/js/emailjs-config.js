/* ==========================================================================
   LINGA GLOBAL SCHOOL — EmailJS Configuration
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to make the Contact and Admission
   forms send real emails.

   HOW TO SET IT UP (free, ~5 minutes):
   1. Create a free account at https://www.emailjs.com
   2. Email Services -> Add New Service (Gmail/Outlook/etc.) -> copy the
      "Service ID" it gives you -> paste into SERVICE_ID below.
   3. Email Templates -> Create Template -> build a simple template using
      variables such as {{user_name}}, {{user_email}}, {{message}},
      {{student_name}}, {{grade}}, {{phone}} (match the "name" attributes
      used in the form fields). Create ONE template for the contact form
      and ONE for the admissions form -> copy each "Template ID" below.
   4. Account -> API Keys -> copy your "Public Key" -> paste into
      PUBLIC_KEY below.
   5. Set TO_EMAIL to the school inbox that should receive submissions
      (this can also just be hard-coded inside your EmailJS template).
   6. Save this file. Both forms will now send live emails — no other
      code changes required.
   ========================================================================== */

window.LGS_EMAILJS = {
  PUBLIC_KEY:             "bFL_v7_fcoJjXxknj",           // EmailJS -> Account -> API Keys
  SERVICE_ID:             "service_n3z6ao3",            // EmailJS -> Email Services
  CONTACT_TEMPLATE_ID:    "template_7laa5cb",   // EmailJS -> Email Templates (Contact form)
  ADMISSION_TEMPLATE_ID:  "template_bllmivn", // EmailJS -> Email Templates (Admissions form)
  TO_EMAIL:               "info@lingaschool.org"
};
