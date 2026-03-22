const express = require("express");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(express.json());

// Read environment variables
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

console.log("Server starting...");
console.log("VOICE ID:", VOICE_ID ? "Loaded" : "Missing");
console.log("API KEY:", API_KEY ? "Loaded" : "Missing");

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

  if (!API_KEY || !VOICE_ID) {
    console.error("Missing API key or Voice ID");
    return res.status(500).send("Server configuration error");
  }

  try {
    console.log("Generating voice...");

    const voiceResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: script,
        model_id: "eleven_multilingual_v2"
      },
      {
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    fs.writeFileSync("voice.mp3", voiceResponse.data);

    console.log("Voice generated");

    // Check if bg.jpg exists
    const bgPath = path.join(__dirname, "bg.jpg");

    if (!fs.existsSync(bgPath)) {
      console.error("bg.jpg not found");
      return res.status(500).send("Background image missing");
    }

    console.log("Creating video with FFmpeg...");

    exec(
      `ffmpeg -y -loop 1 -i bg.jpg -i voice.mp3 -c:v libx264 -t 20 -pix_fmt yuv420p output.mp4`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("FFmpeg error:", error);
          console.error(stderr);
          return res.status(500).send("Video generation failed");
        }

        console.log("Video created");

        res.download("output.mp4", "video.mp4", () => {
          console.log("Video sent to user");

          // cleanup
          if (fs.existsSync("voice.mp3")) fs.unlinkSync("voice.mp3");
          if (fs.existsSync("output.mp4")) fs.unlinkSync("output.mp4");
        });
      }
    );

  } catch (err) {
    console.error("Error generating voice:");

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data.toString());
    }

    res.status(500).send("Generation failed");
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
