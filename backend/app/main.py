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
1) A viral video transcript already chunked and labeled by structural function (Hook, Transition, Value Beats, Social Proof / Proof, Call to Action).
2) A user’s niche, goal, key points, and desired tone.

Your mandate: Produce a winning, ready-to-record script that is *minimally changed* from the original while precisely aligned to the user’s niche and goal.

Remix rules (read carefully):
- Preserve the original structure and sentence order (Hook → Transition → Value beats → Social Proof → CTA). Keep the same number of sentences per section whenever possible.
- Minimal-delta rewrite: keep the core phrasing and rhythm. Only swap niche-irrelevant nouns, examples, metrics, and metaphors with on-niche equivalents. Prefer synonym swaps over full rephrases. Target ≥85% token overlap per sentence when feasible.
- Hook: choose one, and only one, pattern from the “1000 Viral Hooks” list (e.g., “If I woke up [pain] tomorrow…”, “Here’s exactly how much [X] you need to [result]”, “What if I told you…”, etc.). Keep emotional tension and include at least one rhetorical question.
- Maintain pacing, urgency, and rhetorical function for each beat (relatability → escalation → revelation → solution). Do not introduce new beats unless essential for coherence.
- Proof: if exact data is missing, provide a *clearly templated* example (e.g., “Top users see [X%–Y%] lift after [action]”) without presenting it as verified fact.
- Tone: match the provided tone (confident, urgent, relatable). Use contractions and mostly <20-word sentences.

Formatting rules (strict):
- OUTPUT ONLY THE FINAL SCRIPT AS PLAIN TEXT. No XML, JSON, labels, headings, or annotations.
- Put ONE blank line between every sentence. Do not add bullets or numbers.
- Keep line breaks from the original sections in the same order (you may not label them, but keep their flow).

Content requirements:
- Include: Hook → Transition → 1–3 Value beats (as in the source) → Social Proof / Proof → Clear CTA.
- Keep CTA action-oriented and specific to the user’s funnel.
- Use placeholders like [Name], [NicheTerm], [GoalMetric] only if those values are missing.

Quality bar:
- Feels like the original creator, but perfectly on-niche.
- Scroll-stopping first two lines (hook pattern + tension).
- Zero fluff. No “as an AI” language. No meta commentary.

Return: the plain-text script only, with blank lines between sentences.
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