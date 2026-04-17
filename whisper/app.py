"""FastAPI wrapper around OpenAI Whisper for Mandarin Chinese.

POST /transcribe
  multipart form:
    audio:  the user's recording (webm/mp4/ogg/wav/mp3)
    target: (optional) the target Chinese phrase — echoed back for
            the frontend's similarity scorer. Not used to bias ASR.

Returns JSON: { text: str, confidence: float, target: str|null }

Health: GET /healthz -> { status, model }

Deployed at https://whisper-cn.bsbsbs.au behind Traefik.
"""

from __future__ import annotations

import logging
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import numpy as np
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from transformers import (
    AutoModelForSpeechSeq2Seq,
    AutoProcessor,
    pipeline,
)

LOG = logging.getLogger("whisper")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

MODEL_ID = os.environ.get("WHISPER_MODEL", "openai/whisper-small")
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "https://china.bsbsbs.au,https://di-chinese.vercel.app,http://localhost:5174",
    ).split(",")
    if o.strip()
]
ALLOWED_ORIGIN_REGEX = os.environ.get(
    "ALLOWED_ORIGIN_REGEX",
    r"^https://.*\.vercel\.app$",
)

app = FastAPI(title="Whisper Chinese API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)


_pipe = None


def get_pipeline():
    global _pipe
    if _pipe is not None:
        return _pipe

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    LOG.info("Loading model %s on %s (%s)", MODEL_ID, device, torch_dtype)

    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        MODEL_ID,
        torch_dtype=torch_dtype,
        low_cpu_mem_usage=True,
    )
    model.to(device)
    processor = AutoProcessor.from_pretrained(MODEL_ID)

    _pipe = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        torch_dtype=torch_dtype,
        device=device,
        return_timestamps=False,
    )
    LOG.info("Model ready")
    return _pipe


@app.on_event("startup")
def _warmup() -> None:
    try:
        get_pipeline()
    except Exception:
        LOG.exception("Model load failed on startup — will retry on first request")


def decode_to_wav(src: Path, dst: Path) -> None:
    """Use ffmpeg to convert any audio to 16kHz mono PCM WAV."""
    cmd = [
        "ffmpeg", "-nostdin", "-y", "-loglevel", "error",
        "-i", str(src),
        "-ac", "1", "-ar", "16000",
        "-f", "wav", str(dst),
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        stderr = result.stderr.decode("utf-8", errors="replace")
        raise HTTPException(status_code=400, detail=f"ffmpeg failed: {stderr[:200]}")


@app.get("/healthz")
def healthz():
    return {"status": "ok", "model": MODEL_ID, "cuda": torch.cuda.is_available()}


@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    target: Optional[str] = Form(None),
):
    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="empty audio")
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="audio too large (10MB max)")

    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / (audio.filename or "input.bin")
        wav = Path(td) / "input.wav"
        src.write_bytes(raw)
        decode_to_wav(src, wav)

        import soundfile as sf
        data, sr = sf.read(str(wav), dtype="float32")
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        if sr != 16000:
            raise HTTPException(status_code=500, detail=f"unexpected sr {sr}")

        pipe = get_pipeline()
        try:
            out = pipe(data.copy(), generate_kwargs={"language": "zh", "task": "transcribe"})
        except TypeError:
            out = pipe(data.copy())

        text = (out.get("text") or "").strip() if isinstance(out, dict) else ""

    return JSONResponse({"text": text, "confidence": 1.0, "target": target})


@app.get("/")
def root():
    return {"service": "Whisper Chinese API", "endpoints": ["/transcribe", "/healthz"]}
