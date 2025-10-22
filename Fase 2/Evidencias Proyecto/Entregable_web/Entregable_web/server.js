import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const apiKey = process.env.OPENAI_API_KEY;
let openai;
if (apiKey) {
  openai = new OpenAI({ apiKey });
  console.log(" OpenAI API Key cargada correctamente");
} else {
  console.warn(" No se encontró OpenAI API Key. Se usará modo simulación.");
}

// Ruta para manejar los mensajes del chatbot
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No enviaste ningún mensaje" });
  }

  // Intentar usar OpenAI
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un asistente amable y útil para los usuarios de MedifyAlert." },
          { role: "user", content: message },
        ],
      });

      return res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
      console.error("Error OpenAI:", error.message || error);

      // Si hay error de cuota o cualquier otro, caer al modo simulación
      return res.json({ reply: `He capturado tu mensaje que es el siguiente:"${message}" Chatbot En Alpha ` });
    }
  } else {
    // Modo simulación si no hay API Key
    return res.json({ reply: `He capturado tu mensaje que es el siguiente:${message}" Chatbot En Alpha ` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`El servidor corre en el Puerto: ${PORT}`));
