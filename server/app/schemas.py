from typing import Literal, Optional

from pydantic import BaseModel


class BBox(BaseModel):
    x: int
    y: int
    w: int
    h: int


class DomNode(BaseModel):
    tag: str
    id: Optional[str] = None
    role: Optional[str] = None
    text: Optional[str] = None
    rect: Optional[BBox] = None


class ActionRequest(BaseModel):
    url: str
    title: Optional[str] = None
    dom: list[DomNode] = []
    screenshot_b64: Optional[str] = None


class Action(BaseModel):
    type: Literal["click", "type", "scroll", "navigate", "done"]
    selector: Optional[str] = None
    value: Optional[str] = None


class ActionResponse(BaseModel):
    actions: list[Action]
    meta: dict = {}
