from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .providers import get_provider
from .schemas import ActionRequest, ActionResponse

app = FastAPI(title="sih-26171-server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "provider": get_provider().name}


@app.post("/v1/act", response_model=ActionResponse)
def act(req: ActionRequest) -> ActionResponse:
    return get_provider().act(req)
