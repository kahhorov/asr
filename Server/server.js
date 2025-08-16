import express from "express";
import cors from "cors";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = 28826605;
const apiHash = "2de06bf44ed92df5be19d4fc573b16aa";
const stringSession = new StringSession(
  "1AgAOMTQ5LjE1NC4xNjcuNDEBu3+MVVmgozAFnUkqzbyVyieVRZS9XQ8kYfIeYbDgbGigmUPp99dJ7cjcBCrtdxeZFkBZfOItByG2PLCJKkm2uD1tgR8I5TAaZ7+bVVjrVvzb/48ZBz2DLlI/KlGJpNkBN0INuZXrFABl8QyBKEGhrp8qI+qa+kacSC2CvAoNCPgW8e0KA+Y8nEjlT3QDvaHnHzwAwzinL2aZiaJwakSFbOv6qv1IBzcylZW150rLEHiFH34RgRcTilM1x2OzaT6QlW9YzDfISJTaQKhPGXDCI7I/peCko4WpN62KavabRlZrkNlrR5RhpxKQg9/vFBjpOpDEofibpLynL1YYz26baK4="
);

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

await client.connect();
console.log("✅ Telegram client ulandi!");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/sendMessage", async (req, res) => {
  try {
    const { clientUser, message } = req.body;

    if (!clientUser || !message) {
      return res
        .status(400)
        .json({ success: false, error: "clientUser va message kerak" });
    }

    await client.sendMessage(clientUser, { message });
    console.log(`✅ ${clientUser} ga xabar yuborildi: ${message}`);
    res.json({ success: true });
  } catch (e) {
    console.error("Xatolik:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(5000, () => console.log("Server 5000-portda ishlayapti"));
