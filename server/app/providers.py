import os
from typing import Protocol

from .schemas import Action, ActionRequest, ActionResponse


class Provider(Protocol):
    name: str

    def act(self, req: ActionRequest) -> ActionResponse: ...


class MockProvider:
    name = "mock"

    def act(self, req: ActionRequest) -> ActionResponse:
        return ActionResponse(actions=[Action(type="done")], meta={"url": req.url})


class OllamaProvider:
    name = "ollama"

    def __init__(self, base_url: str, model: str) -> None:
        self.base_url = base_url
        self.model = model

    def act(self, req: ActionRequest) -> ActionResponse:
        raise NotImplementedError("ollama provider is wired in S4")


def get_provider() -> Provider:
    name = os.environ.get("VLM_PROVIDER", "mock")
    if name == "ollama":
        return OllamaProvider(
            base_url=os.environ.get("OLLAMA_URL", "http://localhost:11434"),
            model=os.environ.get("OLLAMA_MODEL", "qwen2.5vl:7b"),
        )
    return MockProvider()
