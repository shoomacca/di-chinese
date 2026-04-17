"""
Generate MP3 audio files for every phrase using Microsoft edge-tts.

Produces two files per phrase in public/audio/:
  {id}.mp3       — normal speed
  {id}-slow.mp3  — 40% slower (for learners)

Voice: zh-CN-XiaoxiaoNeural (Mandarin Chinese female, neural).

Usage:
  pip install edge-tts
  python scripts/generate_audio.py

Re-runs are idempotent: files that already exist and have non-zero size are skipped.
Delete public/audio/ if you want to regenerate everything.
"""

from __future__ import annotations

import asyncio
import json
import re
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("edge-tts not installed. Run: pip install edge-tts", file=sys.stderr)
    sys.exit(1)


VOICE = "zh-CN-XiaoxiaoNeural"
PROJECT_ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = PROJECT_ROOT / "public" / "audio"
PHRASES_FILE = PROJECT_ROOT / "src" / "data" / "phrases.ts"


def load_phrases() -> list[dict]:
    """Extract the PHRASES array from the TypeScript source file."""
    text = PHRASES_FILE.read_text(encoding="utf-8")
    match = re.search(r"export const PHRASES[^=]*=\s*(\[[\s\S]*?\n\]);", text)
    if not match:
        raise RuntimeError("Could not find PHRASES array in src/data/phrases.ts")

    body = match.group(1)
    entries = re.findall(r"\{\s*id:\s*(\d+)\s*,[^}]*?zh:\s*\"([^\"]+)\"[^}]*?\}", body)
    if not entries:
        raise RuntimeError("Could not parse any phrase entries")

    return [{"id": int(eid), "zh": zh} for eid, zh in entries]


async def synth(text: str, rate: str, out_path: Path) -> None:
    tts = edge_tts.Communicate(text=text, voice=VOICE, rate=rate)
    await tts.save(str(out_path))


async def generate_for_phrase(phrase: dict) -> list[str]:
    results: list[str] = []
    pid = phrase["id"]
    zh = phrase["zh"]

    for suffix, rate in [("", "+0%"), ("-slow", "-40%")]:
        out = AUDIO_DIR / f"{pid}{suffix}.mp3"
        if out.exists() and out.stat().st_size > 1024:
            results.append(f"skip   {out.name}")
            continue
        try:
            await synth(zh, rate, out)
            size_kb = out.stat().st_size // 1024
            results.append(f"wrote  {out.name} ({size_kb} KB)")
        except Exception as e:  # noqa: BLE001
            results.append(f"FAILED {out.name}: {e}")
    return results


async def main() -> int:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    phrases = load_phrases()
    print(f"Generating audio for {len(phrases)} phrases -> {AUDIO_DIR}")
    print(f"Voice: {VOICE}\n")

    sem = asyncio.Semaphore(4)

    async def bounded(p: dict) -> list[str]:
        async with sem:
            return await generate_for_phrase(p)

    results = await asyncio.gather(*[bounded(p) for p in phrases])
    failures = 0
    for lines in results:
        for line in lines:
            print(line)
            if line.startswith("FAILED"):
                failures += 1

    print(f"\nDone. {failures} failure(s).")
    manifest = AUDIO_DIR / "manifest.json"
    manifest.write_text(json.dumps({"voice": VOICE, "count": len(phrases)}, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
