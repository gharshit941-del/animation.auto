const express = require("express");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

// Environment variables
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

app.post("/generate", async (req, res) => {
  const script = req.body.script;

  try {
    // DEBUG — check if VOICE_ID is loaded
console.log("VOICE_ID:", process.env.VOICE_ID);
    // Generate voice
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      { text: script },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    fs.writeFileSync("voice.mp3", response.data);

    // Create video
    exec(
      `ffmpeg -loop 1 -i bg.jpg -i voice.mp3 -c:v libx264 -t 20 -pix_fmt yuv420p output.mp4`,
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error generating video");
        }

        res.download("output.mp4");
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating video");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
