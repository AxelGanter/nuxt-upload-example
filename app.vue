<template>
  <div>
    <main>
      <NuxtPage />
      <Impressum />
    </main>     
  </div>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'
// Normalerweise braucht app.vue hier wenig bis keinen spezifischen Script-Code,
// es sei denn, Sie verwalten globale Zustände oder Layout-Logik.
</script>

<style>
/* Globale Styles oder Layout-Styles können hier oder in einer separaten CSS-Datei platziert werden */
/* main {
  padding-bottom: 60px; /* Beispiel: Platz für den Footer schaffen, falls er 'fixed' wäre */
/* } */

</style>