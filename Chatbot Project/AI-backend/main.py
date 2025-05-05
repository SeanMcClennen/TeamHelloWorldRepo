# main.py

from fastapi import FastAPI
from pydantic import BaseModel
from ai_logic import generate_response


app = FastAPI()

class Post(BaseModel):
    text: str
    is_reply: bool = False
    username: str = "user"

@app.post("/analyze")
async def analyze_post(post: Post):
    reply = generate_response(post.text, post.is_reply, post.username)
    return {"response": reply if reply else None}
