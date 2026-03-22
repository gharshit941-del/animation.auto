# edge_tts_generate.py
import sys
import asyncio
import edge_tts

async def main(text):
    # "en-US-AriaNeural" is the voice; you can change if needed
    tts = edge_tts.Communicate(text, "en-US-AriaNeural")
    await tts.save("voice.mp3")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide script text")
        sys.exit(1)
    
    # Join all command-line arguments to support multi-word scripts
    script_text = " ".join(sys.argv[1:])
    
    # Run the async function
    asyncio.run(main(script_text))
