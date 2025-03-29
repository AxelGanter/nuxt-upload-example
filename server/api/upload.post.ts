
// server/api/upload.post.ts
import { defineEventHandler, readMultipartFormData, setResponseStatus } from 'h3';
import { put } from '@vercel/blob'; // <--- Importieren

import OpenAI from "openai";
import dotenv from 'dotenv';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default defineEventHandler(async (event) => {
  // Kein fs.mkdir mehr nötig für Blob Storage

  try {
    const formData = await readMultipartFormData(event);
    const fileData = formData?.find(item => item.name === 'imageFile'); // Muss 'imageFile' sein, wie im Frontend

    if (!fileData || !fileData.filename || !fileData.data) {
      setResponseStatus(event, 400);
      return { success: false, message: 'No file data received or file is empty.' };
    }

    // Validierungen (Dateityp, Größe) wie zuvor hier einfügen...
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
     if (!fileData.type || !allowedTypes.includes(fileData.type)) {
         setResponseStatus(event, 400);
         return { success: false, message: 'Invalid file type.' };
     }
     // Optional: Größenlimit prüfen...

    // --- HIER KOMMT VERCEL BLOB INS SPIEL ---

    // Sanitize filename (wichtig!)
    const originalFilename = fileData.filename;
    const sanitizedFilename = `${Date.now()}-${originalFilename.replace(/[^a-zA-Z0-9._-]/g, '')}`; 
    const pathname = `uploads/${sanitizedFilename}`; 



    // send to openai -------------------------------
    const base64 = fileData.data.toString('base64');
    const mimeType = fileData.type;
    
    const imageUrl = `data:${mimeType};base64,${base64}`; 
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analysiere das Bild und schätze die enthaltenen Lebensmittel mit Mengenangabe und Kalorien.
    Antworte **nur** mit gültigem JSON im Format:
    
    {
      "items": [
        {
          "kategorien": "Lebensmittelkategorie",
          "name": "Lebensmittelname",
          "amount": "geschätzte Menge",
          "fat": "geschätzte Fettzahl in Gramm (ohne Einheit)",
          "carbs": "geschätzte Kohlenhydrate in Gramm (ohne Einheit)",
          "protein": "geschätzte Eiweißzahl in Gramm (ohne Einheit)",
          "calories": geschätzte Kalorienzahl,
          "imageDescription_Food": "Bildbeschreibung (vom Lebensmittel)",
          "imageDescription_other": "Bildbeschreibung (unabhängig vom Lebensmittel)"
        }
      ],
      "totalCalories": Gesamtanzahl
    }`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
    });
    
  
    const answerFromOpenAI = response.choices[0].message;
    let answerFromOpenAIAsJson = answerFromOpenAI.content 
      ? answerFromOpenAI.content 
      : "{}";
    // Entferne den ```json und ``` Codeblock
    answerFromOpenAIAsJson = answerFromOpenAIAsJson.replace(/^```json\s+|\s+```$/g, '');

    // Parsen des bereinigten JSON-Strings
    answerFromOpenAIAsJson = JSON.parse(answerFromOpenAIAsJson);

    // Upload to Vercel Blob

    console.log(`Uploading to Vercel Blob at path: ${pathname}`);

    // Verwende 'put' zum Hochladen
    const { url } = await put(
        pathname,         // Der Pfad/Dateiname im Blob Store
        fileData.data,    // Der Inhalt der Datei (Buffer)
        {
          access: 'public', // Macht die Datei über die zurückgegebene URL öffentlich zugänglich
          // contentType: fileData.type // Optional: Setzt den Content-Type explizit
        }
    );

    console.log(`File uploaded successfully - URL: ${url}`);

    // --- Ende Vercel Blob ---

    // Rückgabe an das Frontend
    return {
      success: true,
      message: 'File uploaded successfully',
      answerFromOpenAIAsJson,
      filePath: url // Die öffentliche URL der Datei zurückgeben
    };

  } catch (error: any) {
    console.error('Error handling file upload:', error);
     // Spezifische Fehler von Vercel Blob abfangen?
     // if (error instanceof BlobAccessError) { ... }

    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'An error occurred during file upload.',
      answerFromOpenAIAsJson: null,
      error: error.message,
    };
  }
});