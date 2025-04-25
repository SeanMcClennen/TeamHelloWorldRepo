# ai_logic.py

from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

# Load sentiment classifier
classifier = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")

# Load code fixer model
tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5-small")
model = AutoModelForSeq2SeqLM.from_pretrained("Salesforce/codet5-small")
fixer = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

# Classify post type
def classify_post_type(text: str, is_reply: bool) -> str:
    text_lower = text.lower()
    if is_reply:
        if any(word in text_lower for word in ["try", "you could", "maybe", "check", "should", "did you"]):
            return "helpful_reply"
        else:
            return "ignore"
    elif "fix" in text_lower or "finished" in text_lower or "finally worked" in text_lower:
        return "congrats"
    elif "error" in text_lower or "bug" in text_lower or "help" in text_lower or "issue" in text_lower:
        return "needs_help"
    else:
        return "ignore"

# Extract code (simplified)
def extract_code_from_text(text: str) -> str:
    if "```" in text:
        return text.split("```")[1].strip()
    return ""

# Fix code using CodeT5
def fix_code(code: str) -> str:
    prompt = f"Fix the following Python code:\n{code}"
    result = fixer(prompt, max_length=256)[0]["generated_text"]
    return result

# Generate a response based on post type
def generate_response(text: str, is_reply: bool, username: str = "user") -> str:
    post_type = classify_post_type(text, is_reply)

    if post_type == "congrats":
        return f"🎉 Great job, {username}! Keep it up!"
    elif post_type == "needs_help":
        code = extract_code_from_text(text)
        if code:
            fixed = fix_code(code)
            return f"🔧 Here's a possible fix for your code:\n\n{fixed}"
        else:
            return "🛠️ Can you share your code and the error you're getting?"
    elif post_type == "helpful_reply":
        return f"🙌 Thanks for helping out, {username}!"
    return ""  # ignore
