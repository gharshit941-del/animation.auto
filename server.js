const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Animation Auto Engine is running");
});

app.post("/generate", async (req, res) => {
  const script = req.body.script;

  if (!script) {
    return res.status(400).send("No script provided");
  }

  try {
    console.log("Generating voice using Edge-TTS...");

    exec(
      `edge-tts --text "${script}" --write-media voice.mp3`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Edge-TTS error:", stderr);
          return res.status(500).send("Voice generation failed");
        }

        console.log("Voice generated");

        const bgPath = path.join(__dirname, "bg.jpg");

        if (!fs.existsSync(bgPath)) {
          return res.status(500).send("Background image missing");
        }

        console.log("Creating video...");

        exec(
          `ffmpeg -y -loop 1 -i bg.jpg -i voice.mp3 -c:v libx264 -t 20 -pix_fmt yuv420p output.mp4`,
          (err) => {
            if (err) {
              console.error("FFmpeg error:", err);
              return res.status(500).send("Video generation failed");
            }

            res.download("output.mp4", () => {
              if (fs.existsSync("voice.mp3"))
                fs.unlinkSync("voice.mp3");

              if (fs.existsSync("output.mp4"))
                fs.unlinkSync("output.mp4");
            });
          }
        );
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).send("Generation failed");
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
