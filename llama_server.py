from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_name = "meta-llama/Llama-2-7b-hf"  # Model identifier

tokenizer = AutoTokenizer.from_pretrained(model_name, use_auth_token=True)  # Load tokenizer
model = AutoModelForCausalLM.from_pretrained(model_name, use_auth_token=True)  # Load model


app = FastAPI()

class Query(BaseModel):
    prompt: str
    max_tokens: int = 500
    temperature: float = 0.7

# @app.post("/generate")
# async def generate(query: Query):
#     return {"response": f"Echo: {query.prompt}"}

@app.post("/generate")
async def generate(query: Query):
    try:
        # Tokenize input and move tensors to GPU
        inputs = tokenizer(query.prompt, return_tensors="pt")
        # Generate text
        outputs = model.generate(
            inputs["input_ids"],
            max_new_tokens=query.max_tokens,
            temperature=query.temperature,
        )
        # Decode the model's output
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print("ok")
        return {"response": response.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=9000)