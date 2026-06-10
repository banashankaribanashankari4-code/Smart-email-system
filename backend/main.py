from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.email_router import router

app = FastAPI(title="Smart Email Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the email router
app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "running", "message": "Kitchen is open!"}