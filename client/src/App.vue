<template>
  <RouterView />
</template>

<script setup lang="ts">
// Wir importieren nur noch, was wir wirklich brauchen
import { RouterView } from 'vue-router'
</script>

<style>
/* Globale Styles für die ganze App.
  Ich habe sie an dein index.html-Beispiel angelehnt.
*/
body {
  font-family: Arial, sans-serif;
  margin: 2rem;
  background: #f4f4f7;
  color: #333;
}
h1, h2 {
  color: #4a148c;
  text-align: center;
}
.card {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
input[type="text"],
input[type="password"],
textarea {
  width: calc(100% - 1.2rem); /* 100% - padding */
  padding: 0.6rem;
  margin: 0.5rem 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
button {
  width: 100%;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 6px;
  background: #4a148c;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #6a1b9a;
}
</style>