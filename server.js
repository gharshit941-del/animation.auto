const express = require("express");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

app.post("/generate", async (req, res) => {
  const script = req.body.script;

  try {
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID",
      { text: script },
      {
        headers: {
          "xi-api-key": "YOUR_API_KEY",
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    fs.writeFileSync("voice.mp3", response.data);

    exec(
      `ffmpeg -loop 1 -i bg.jpg -i voice.mp3 -c:v libx264 -t 20 -pix_fmt yuv420p output.mp4`,
      (err) => {
        if (err) return res.send("Error generating video");
        res.download("output.mp4");
      }
    );

  } catch (error) {
    console.error(error);
    res.send("Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require("express");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
const ELEVENLABS_API_KEY = "sk_341b071cb0266a6605a77de46fb435486f34a7f45cd9a118";     
const ELEVENLABS_VOICE_ID = "flHkNRp1BlvT73UL6gyz";

app.post("/generate", async (req, res) => {
  const script = req.body.script;

  try {
    // Step 1: Generate voice
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
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

    // Step 2: Combine with background image → video
    exec(
      `ffmpeg -loop 1 -i bg.jpg -i voice.mp3 -c:v libx264 -t 20 -pix_fmt yuv420p output.mp4`,
      (err) => {
        if (err) return res.status(500).send("Error generating video");
        res.download("output.mp4");
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating video");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
