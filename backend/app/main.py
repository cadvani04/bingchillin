from fastapi import FastAPI, APIRouter, Body # Imports the app class and a sub-router helper; needed to create the app and group endpoints.
from fastapi.middleware.cors import CORSMiddleware # Imports the CORS middleware; needed to allow requests from other domains.
from dotenv import load_dotenv
import os

from .core import config # Imports the config object; needed to access the app's configuration.
from .api.v1.endpoints import items # Imports the items endpoint; needed to access the items endpoint.
from apify_client import ApifyClient
import time
import openai
import requests
import smtplib, ssl
from email.mime.text import MIMEText

app = FastAPI(title=config.APP_NAME) # Creates the app object; needed to create the app.
load_dotenv()
app.add_middleware(
    CORSMiddleware, # Adds the CORS middleware; needed to allow requests from other domains.
    allow_origins=config.ALLOWED_ORIGINS or ["*"], # Allows requests from all domains.
    allow_credentials=True, # Allows credentials to be sent.
    allow_methods=["*"], # Allows all methods.
    allow_headers=["*"], # Allows all headers.
)


def send_email_smtp(to_email: str, body_text: str, subject: str = "Your AI Transcript Writer is Finished") -> None:
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    if not smtp_user or not smtp_pass:
        raise RuntimeError("Missing SMTP_USER or SMTP_PASS environment variables")

    message = MIMEText(body_text, "plain", "utf-8")
    message["Subject"] = subject
    message["From"] = smtp_user
    message["To"] = to_email

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(smtp_user, smtp_pass)
        server.send_message(message)


@app.get("/health") # Defines a health check endpoint; needed to check if the app is running.
def health_check() -> dict[str, str]: # Defines the health check function; needed to check if the app is running.
    return {"status": "ok"} # Returns a JSON response with the status of the app.

@app.post("/requests") # Defines a requests endpoint; needed to handle requests.
async def requests_handler(payload: dict[str, str] = Body(...)): # Defines the requests handler function; needed to handle requests.
    return payload # Returns a JSON response with the payload.
    

api_router = APIRouter() # Creates the API router object; needed to create the API router.
api_router.include_router(items.router, prefix="/items", tags=["items"]) # Includes the items router; needed to access the items endpoint.

app.include_router(api_router, prefix=config.API_V1_STR) # Includes the API router; needed to access the API router.

@app.post("/tally") # Defines a tally endpoint; needed to tally the requests.
async def tally(json_data: dict = Body(...)): # Defines the tally function; needed to tally the requests.
    sysp="""<SystemPrompt>
  <![CDATA[
You are a high-performance script remixer. You will receive two inputs: 
1) A viral video transcript already chunked and labeled by structural function (e.g., Hook, Transition, Value Beats, Social Proof / Proof, Call to Action). 
2) A user’s niche, goal, key points, and desired tone.

Your task: Rewrite the viral transcript so that:
- The hook retains its emotional tension, style, and format (including at least one rhetorical question) but speaks directly to the user’s niche and goal.
- Each subsequent beat preserves its rhetorical function (e.g., relatability, escalation, revelation, solution) while replacing examples, metaphors, terminology, and specifics with ones aligned to the user’s input.
- Maintain pacing, urgency, and the original template structure. Replace content fully—do not copy niche-irrelevant language from the source.
- If the user has not provided exact data for proof, produce a believable example framed as a template or case (“Top users have seen X% lift when they do Y”) without presenting it as verified fact.

Output requirements:
1. A ready-to-record script with clearly labeled segments:
   - Hook
   - Transition
   - Value Beat 1, Value Beat 2, ... (as many as the original structure implies)
   - Social Proof / Proof
   - Call to Action
2. Two alternative hooks in the same style but with different phrasing.
3. One concise social caption suitable for posting.
4. Use dynamic placeholders like [Name], [NicheTerm], [GoalMetric] only if the actual values are missing.
5. Sentence length should be mostly under 20 words; use contractions and conversational language; match the provided tone (e.g., confident, urgent, relatable).
6. Output must be in the following XML schema (fill with the remixed content):

<RemixedScript>
  <Hook>...</Hook>
  <Transition>...</Transition>
  <ValueBeats>
    <Beat order="1">...</Beat>
    <Beat order="2">...</Beat>
    <!-- etc. -->
  </ValueBeats>
  <SocialProof>...</SocialProof>
  <CTA>...</CTA>
  <AlternateHooks>
    <HookA>...</HookA>
    <HookB>...</HookB>
  </AlternateHooks>
  <Caption>...</Caption>
</RemixedScript>

Do not add explanation, diagnostics, or anything outside the specified output structure. 
]]>
</SystemPrompt>"""

    print(json_data) # Prints the payload.
    
    # Extract data from Tally webhook structure
    fields = json_data.get("data", {}).get("fields", [])
    
    # Find the values by looking at the labels
    email = None
    url = None
    instructions = None
    
    for field in fields:
        if field.get("label") == "email":
            email = field.get("value")
        elif field.get("label") == "video URL (tiktok, ig reel, and such)":
            url = field.get("value")
        elif field.get("label") == "Your Information + Who are you? (Either Summarize what you want to do with the video and who you are)":
            instructions = field.get("value")
    
    if not email or not url or not instructions:
        return {"error": "Missing required fields: email, url, or instructions"}
    
    print(f"Email: {email}")
    print(f"URL: {url}")
    print(f"Instructions: {instructions}")
    response = requests.get(url) # Sends a GET request to the URL.
    print(response.text) # Prints the response.
    # Initialize the ApifyClient with your API token
    client = ApifyClient(config.APIFY_API_TOKEN)
# Prepare the Actor input
    run_input = { "start_urls": url }
# Run the Actor and wait for it to finish
    run = client.actor("CVQmx5Se22zxPaWc1").call(run_input=run_input)
    time.sleep(60)
    # Fetch and print Actor results from the run's dataset (if there are any)
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        print(item)
    #openai.api_key = config.OPENAI_API_KEY
    openai.api_key = os.getenv("OPENAI_API_KEY")
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": sysp}, {"role": "user", "content": item["transcript"]}, {"role": "user", "content": instructions}]
    )
    res=(response.choices[0].message.content)
    print(res)

    # Send via SMTP (Gmail App Password)
    try:
        send_email_smtp(email, res)
    except Exception as e:
        print(f"SMTP send failed: {e}")


    return {"status": "ok"} # Returns a JSON response with the payload.




if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
    ) 