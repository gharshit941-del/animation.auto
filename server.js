const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const edgeTTS = require("edge-tts");

const app = express();
app.use(express.json());

console.log("Server starting...");
console.log("Using Edge TTS voice engine");

// Health check route
app.get("/", (req, res) => {
  res.send("Animation Auto Engine is running");
});

// Video generation route
app.post("/generate", async (req, res) => {
  const script = req.body.script;

  console.log("Received script:", script);

  if (!script) {
    return res.status(400).send("No script provided");
  }

  try {
    console.log("Generating voice with Edge TTS...");

    const voicePath = path.join(__dirname, "voice.mp3");

    // Generate voice
    const audio = await edgeTTS.synthesize({
      text: script,
      voice: "en-US-AriaNeural",
      format: "audio-24khz-48kbitrate-mono-mp3"
    });

    fs.writeFileSync(voicePath, audio);

    console.log("Voice generated");

    // Check background image
    const bgPath = path.join(__dirname, "bg.jpg");

    if (!fs.existsSync(bgPath)) {
      console.error("bg.jpg not found");
      return res.status(500).send("Background image missing");
    }

    console.log("Creating video with FFmpeg...");

    const outputPath = path.join(__dirname, "output.mp4");

    exec(
      `ffmpeg -y -loop 1 -i "${bgPath}" -i "${voicePath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("FFmpeg error:", error);
          console.error(stderr);
          return res.status(500).send("Video generation failed");
        }

        console.log("Video created");

        res.download(outputPath, "video.mp4", () => {
          console.log("Video sent to user");

          // cleanup
          if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });
      }
    );

  } catch (err) {
    console.error("Error generating voice:", err);
    res.status(500).send("Generation failed");
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
