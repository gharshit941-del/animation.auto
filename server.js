const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(express.json());

app.post("/generate", (req, res) => {
  const script = req.body.script;

  if (!script) return res.status(400).send("Script text is required");

  // Step 1: Generate voice using Edge TTS Python script
  exec(`python edge_tts_generate.py "${script}"`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error generating voice");
    }

    // Step 2: Combine with background image → video
    // "-shortest" makes video match voice length automatically
    exec(
      `ffmpeg -loop 1 -i bg.jpg -i voice.mp3 -c:v libx264 -shortest -pix_fmt yuv420p output.mp4`,
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error generating video");
        }
        res.download("output.mp4");
      }
    );
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
