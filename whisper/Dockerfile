FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/models \
    TRANSFORMERS_CACHE=/models

# System deps: ffmpeg for audio decode, libsndfile for soundfile, git for HF
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libsndfile1 git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
# Install CPU-only torch to keep the image small
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch==2.4.1 \
    && pip install -r requirements.txt

# Pre-download the model into the image so first request is fast.
RUN python -c "from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor; \
    AutoProcessor.from_pretrained('openai/whisper-small'); \
    AutoModelForSpeechSeq2Seq.from_pretrained('openai/whisper-small')"

COPY app.py ./

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--timeout-keep-alive", "60"]
