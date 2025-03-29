<template>
    <div class="log-display-container" v-if="logs.length > 0">
      <!-- <h3>Client-Logs:</h3> -->
      <pre class="log-output"><code><span v-for="(log, index) in logs" :key="index">{{ log + '\n' }}</span></code></pre>
      <!-- <button @click="clearLogs" class="clear-logs-button">Logs löschen</button> -->
    </div>
  </template>
  
  <script setup lang="ts">
  import { usePageLogger } from '~/composables/usePageLogger';
  
  // Logs und clearLogs Funktion aus dem Composable holen
  const { logs, clearLogs } = usePageLogger();
  </script>
  
  <style scoped>
  .log-display-container {
    margin-top: 40px;
    padding: 15px 20px;
    border-top: 2px solid #eee;
    background-color: #f8f8f8;
    font-family: monospace; /* Lesbarkeit für Logs */
  }
  .log-output {
    background-color: #282c34; /* Dunkler Hintergrund */
    color: #abb2bf; /* Helle Schrift */
    padding: 15px;
    border-radius: 5px;
    max-height: 350px; /* Höhe begrenzen */
    overflow-y: auto; /* Scrollbar bei Bedarf */
    font-size: 0.85em;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.4;
  }
   .log-output span:last-child {
      /* Verhindert unnötigen Zeilenumbruch am Ende */
      /* display: block; */
   }
  .clear-logs-button {
     margin-top: 10px;
     padding: 5px 12px;
     font-size: 0.8em;
     cursor: pointer;
     background-color: #e0e0e0;
     border: 1px solid #ccc;
     border-radius: 4px;
  }
  .clear-logs-button:hover {
      background-color: #d5d5d5;
  }
  h3 {
      margin-bottom: 10px;
      font-family: 'Poppins', sans-serif; /* Überschrift lesbarer */
      color: #333;
  }
  </style>