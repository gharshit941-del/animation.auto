# edge_tts_generate.py
import sys
import asyncio
import edge_tts

async def main(text):
    tts = edge_tts.Communicate(text, "en-US-AriaNeural")  # pick your voice
    await tts.save("voice.mp3")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide script text")
        sys.exit(1)
    script_text = sys.argv[1]
    asyncio.run(main(script_text))
