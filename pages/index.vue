<template>
  <div class="upload-container">
    <h1>Bild hochladen! ✨</h1>

    <div class="input-options">
      <label for="file-select-input" class="input-option-button select-button">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
        Bild auswählen
      </label>
      <input id="file-select-input" type="file" @change="handleFileChange" accept="image/*" />

      <label for="camera-input" class="input-option-button camera-button">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-2 6c-1.84 0-3.48-.96-4.34-2.46l-.86-.86c-.2-.2-.2-.51 0-.71l.86-.86C4.52 12.65 6.16 11.69 8 11.69s3.48.96 4.34 2.45l.86.86c.2.2.2.51 0 .71l-.86.86C11.48 17.04 9.84 18 8 18zm10-4c0-1.84-1.52-3.35-3.66-4.34l-.86-.86c-.2-.2-.51-.2-.71 0l-.86.86C10.04 9.65 8.4 10.61 6.54 11.66l-.86-.86c-.2-.2-.51-.2-.71 0l-.86.86C3.2 12.52 2 14.16 2 16c0 1.84 1.52 3.35 3.66 4.34l.86.86c.2.2.51.2.71 0l.86-.86c1.96-1.05 3.6-2.01 5.46-2.96l.86.86c.2.2.51.2.71 0l.86-.86c.92-.92 1.66-2.09 1.66-3.4zM12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg> Foto machen
      </label>
      <input id="camera-input" type="file" @change="handleFileChange" accept="image/*" capture="environment" />
      </div>

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
// KEINE ÄNDERUNGEN HIER NÖTIG!
// Der bestehende Code mit refs, handleFileChange, uploadImage, copyToClipboard etc. bleibt gleich.
import { ref, onUnmounted } from 'vue';

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const uploading = ref(false);
const uploadError = ref<string | null>(null);
const uploadSuccess = ref<string | null>(null);
const uploadedFilePath = ref<string | null>(null);
const linkCopiedMessage = ref<string | null>(null);

// --- Handle File Selection (wird von BEIDEN Inputs genutzt) ---
const handleFileChange = (event: Event) => {
uploadError.value = null;
uploadSuccess.value = null;
uploadedFilePath.value = null;
linkCopiedMessage.value = null;
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
// (uploadImage Funktion bleibt unverändert)
const uploadImage = async () => {
if (!selectedFile.value) {
  uploadError.value = 'Wähle zuerst eine Datei aus oder mache ein Foto.'; // Text leicht angepasst
  return;
}
uploading.value = true;
uploadError.value = null;
uploadSuccess.value = null;
uploadedFilePath.value = null;
linkCopiedMessage.value = null;
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


// --- CopyToClipboard ---
// (copyToClipboard Funktion bleibt unverändert)
const copyToClipboard = async () => {
if (!uploadedFilePath.value) return;
try {
  await navigator.clipboard.writeText(uploadedFilePath.value);
  linkCopiedMessage.value = 'Link kopiert!';
  setTimeout(() => { linkCopiedMessage.value = null; }, 2000);
} catch (err) {
  console.error('Fehler beim Kopieren in die Zwischenablage:', err);
  linkCopiedMessage.value = 'Kopieren fehlgeschlagen!';
   setTimeout(() => { linkCopiedMessage.value = null; }, 2000);
}
};

// --- Cleanup ---
onUnmounted(() => {
if (previewUrl.value) {
  URL.revokeObjectURL(previewUrl.value);
}
});
</script>

<style scoped src="~/assets/css/uploader-styles.css"></style>