from dataclasses import dataclass
from typing import Optional, List

@dataclass
class UploadResponse:
    message: str
    file_path: Optional[str] = None
    error: Optional[str] = None

@dataclass
class ExtractionResponse:
    message: str
    file_url: str
    text: str
    error: Optional[str] = None

@dataclass
class AIProcessingRequest:
    user_prompt: str
    extracted_text: str
    user_api_key: Optional[str] = None
    ai_provider: str = 'gemini'

@dataclass
class AIProcessingResponse:
    message: str
    content: Optional[dict] = None
    error: Optional[str] = None

@dataclass
class PromptTemplate:
    id: int
    name: str
    prompt: str
