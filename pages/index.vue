<template>
    <div class="upload-container">
      <h1>Bild hochladen! ✨</h1>
  
      <label for="file-upload" class="custom-file-upload">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
        {{ selectedFile ? selectedFile.name : 'Wähle ein Bild aus...' }}
      </label>
      <input id="file-upload" type="file" @change="handleFileChange" accept="image/*" />
  
      <div v-if="previewUrl" class="image-preview">
        <h3>Vorschau:</h3>
        <img :src="previewUrl" alt="Image preview" />
      </div>
  
      <button @click="uploadImage" :disabled="!selectedFile || uploading" class="upload-button">
        <span v-if="uploading">Lade hoch... ⏳</span>
        <span v-else>Jetzt hochladen! 🚀</span>
      </button>
  
      <div v-if="uploadSuccess || uploadError" :class="['status-message', uploadSuccess ? 'success' : 'error']">
        <span v-if="uploadSuccess">✅ {{ uploadSuccess }}</span>
        <span v-if="uploadError">❌ Hoppla! {{ uploadError }}</span>
      </div>
  
      <div v-if="uploadedFilePath" class="file-actions">
        <span>Super! Hier ist dein Bild:</span>
        <div class="button-group">
          <button @click="copyToClipboard" class="action-button copy-button" title="Link in Zwischenablage kopieren">
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            Link kopieren
          </button>
          <a :href="uploadedFilePath" target="_blank" class="action-button open-button" title="Bild in neuem Tab öffnen">
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
            Bild öffnen
          </a>
        </div>
         <span v-if="linkCopiedMessage" class="copy-success-message">{{ linkCopiedMessage }}</span>
      </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onUnmounted } from 'vue';
  
  const selectedFile = ref<File | null>(null);
  const previewUrl = ref<string | null>(null);
  const uploading = ref(false);
  const uploadError = ref<string | null>(null);
  const uploadSuccess = ref<string | null>(null);
  const uploadedFilePath = ref<string | null>(null);
  // NEU: Ref für die "Kopiert"-Nachricht
  const linkCopiedMessage = ref<string | null>(null);
  
  // --- Handle File Selection ---
  const handleFileChange = (event: Event) => {
    uploadError.value = null;
    uploadSuccess.value = null;
    uploadedFilePath.value = null;
    linkCopiedMessage.value = null; // Nachricht zurücksetzen
    selectedFile.value = null;
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = null;
    }
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      if (!file.type.startsWith('image/')) {
          uploadError.value = 'Bitte wähle eine Bilddatei aus.';
          return;
      }
      selectedFile.value = file;
      previewUrl.value = URL.createObjectURL(file);
    }
  };
  
  // --- Handle Upload ---
  const uploadImage = async () => {
    if (!selectedFile.value) {
      uploadError.value = 'Wähle zuerst eine Datei aus.';
      return;
    }
    uploading.value = true;
    uploadError.value = null;
    uploadSuccess.value = null;
    uploadedFilePath.value = null;
    linkCopiedMessage.value = null; // Nachricht zurücksetzen
    const formData = new FormData();
    formData.append('imageFile', selectedFile.value, selectedFile.value.name);
  
    try {
      const response = await $fetch('/api/upload', { method: 'POST', body: formData });
      if (response.success) {
        uploadSuccess.value = response.message || 'Datei erfolgreich hochgeladen!';
        if ('filePath' in response && response.filePath){
          uploadedFilePath.value = response.filePath.replace(/\\/g, '/'); // Ersetze Backslashes durch Vorwärtsslashes
        }else{
          uploadedFilePath.value = "noFilePathProvided"; // Fallback-URL
        }        
      } else {
         throw new Error(response.message || 'Backend meldet einen Fehler.');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.data && error.data.message) {
           uploadError.value = error.data.message;
      } else if (error.message) {
          uploadError.value = error.message;
      } else {
          uploadError.value = 'Ein unerwarteter Fehler ist aufgetreten.';
      }
    } finally {
      uploading.value = false;
    }
  };
  
  // NEU: Funktion zum Kopieren des Links
  const copyToClipboard = async () => {
    if (!uploadedFilePath.value) return;
  
    try {
      await navigator.clipboard.writeText(uploadedFilePath.value);
      linkCopiedMessage.value = 'Link kopiert!'; // Erfolgsmeldung setzen
      // Nachricht nach einiger Zeit ausblenden
      setTimeout(() => {
        linkCopiedMessage.value = null;
      }, 2000); // Nachricht nach 2 Sekunden ausblenden
    } catch (err) {
      console.error('Fehler beim Kopieren in die Zwischenablage:', err);
      linkCopiedMessage.value = 'Kopieren fehlgeschlagen!'; // Fehlermeldung setzen
       setTimeout(() => {
        linkCopiedMessage.value = null;
      }, 2000);
    }
  };
  
  
  // --- Cleanup ---
  onUnmounted(() => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
  });
  
  </script>
  
  <style scoped>
  /* Bestehende Styles bleiben weitgehend gleich... */
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@400;600&display=swap');
  
  .upload-container {
    max-width: 500px;
    margin: 40px auto;
    padding: 30px;
    background: linear-gradient(135deg, #e0f2f7, #d0f0e0);
    border-radius: 25px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
    font-family: 'Poppins', sans-serif;
    color: #333;
  }
  
  h1 {
    font-family: 'Pacifico', cursive;
    color: #00796b;
    font-size: 2.8em;
    margin-bottom: 30px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  }
  
  input[type="file"] {
    display: none;
  }
  
  .custom-file-upload {
    border: 2px dashed #4db6ac;
    border-radius: 15px;
    display: inline-block;
    padding: 12px 20px;
    cursor: pointer;
    background-color: #ffffff;
    color: #00796b;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .custom-file-upload:hover {
    background-color: #e0f2f1;
    border-color: #26a69a;
    transform: translateY(-2px);
  }
  
  .image-preview {
    margin-top: 25px;
    margin-bottom: 25px;
    padding: 15px;
    border: 1px solid #b2dfdb;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 15px;
  }
  
  .image-preview h3 {
    margin: 0 0 10px 0;
    font-size: 1em;
    color: #00796b;
    font-weight: 600;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 250px;
    display: block;
    margin: 0 auto;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .upload-button {
    background: linear-gradient(45deg, #26a69a, #00897b);
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1.1em;
    border: none;
    padding: 15px 30px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 121, 107, 0.4);
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .upload-button:hover:not(:disabled) {
    background: linear-gradient(45deg, #00897b, #00796b);
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 121, 107, 0.5);
  }
  
  .upload-button:active:not(:disabled) {
      transform: scale(0.98);
  }
  
  .upload-button:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
    opacity: 0.7;
    box-shadow: none;
  }
  
  .status-message {
    margin-top: 20px;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .status-message.success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  
  .status-message.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }
  
  /* NEU: Styles für Aktionen nach Upload */
  .file-actions {
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #b2dfdb; /* Leichte Trennlinie */
  }
  
  .file-actions span:first-child { /* Der Text "Super! Hier ist dein Bild:" */
      display: block;
      margin-bottom: 15px;
      font-size: 1em;
      color: #555;
  }
  
  .button-group {
      display: flex;
      justify-content: center;
      gap: 15px; /* Abstand zwischen den Buttons */
      flex-wrap: wrap; /* Umbruch bei schmalen Bildschirmen */
  }
  
  .action-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 15px;
      border-radius: 8px;
      border: 1px solid #00796b; /* Grüne Kontur */
      background-color: #ffffff;
      color: #00796b; /* Grüne Schrift */
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 0.9em;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
  }
  
  .action-button:hover {
      background-color: #e0f2f1; /* Helles Grün als Hover */
      color: #004d40; /* Dunkleres Grün */
      border-color: #004d40;
      transform: translateY(-1px);
  }
  
  .action-button svg {
      margin-bottom: -1px; /* Kleine Anpassung für vertikale Ausrichtung */
  }
  
  .copy-success-message {
      display: block;
      margin-top: 10px;
      font-size: 0.85em;
      color: #2e7d32; /* Erfolgsgrün */
      font-weight: 600;
  }
  
  </style>