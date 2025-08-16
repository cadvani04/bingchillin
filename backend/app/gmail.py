import base64
import os
from email.mime.text import MIMEText

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def send_email(to_email: str, body_text: str, subject: str = "Your BingChilling result"):
    creds = Credentials(
        None,
        refresh_token=os.getenv("GMAIL_REFRESH_TOKEN"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GMAIL_CLIENT_ID"),
        client_secret=os.getenv("GMAIL_CLIENT_SECRET"),
        scopes=["https://www.googleapis.com/auth/gmail.send"],
    )
    
    service = build("gmail", "v1", credentials=creds)

    msg = MIMEText(body_text, "plain", "utf-8")
    msg["to"] = to_email
    msg["from"] = os.getenv("GMAIL_SENDER")
    msg["subject"] = subject

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
    return service.users().messages().send(userId="me", body={"raw": raw}).execute()

import smtplib, ssl

def send_email_smtp(to_email: str, body: str, subject="Your BingChilling result"):
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = os.getenv("SMTP_USER")
    msg["To"] = to_email

    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as s:
        s.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
        s.send_message(msg)