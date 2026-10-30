<script setup>
import { ref, onMounted } from 'vue'
import Toolbar from '../components/Notes/Toolbar.vue'

const currentTab = ref('notes')
const screenshots = ref([])

onMounted(async () => {

  screenshots.value = await window.electronAPI.getScreenshots()
})
</script>

<template>
  <Toolbar v-model="currentTab" />

  <div class="Notes">
    <div v-if="currentTab === 'notes'" class="NotesGrid">
      <!-- <div class="Note">
        <p>Description</p>
        <p class="date">Date</p>
      </div> -->
      <h1>Coming soon. For now, view screenshots</h1>
    </div>

    <div v-if="currentTab === 'screenshots'" class="ScreenshotGrid">
      <img draggable="false"
        v-for="shot in screenshots"
        :key="shot.path"
        :src="shot.url"
        :alt="`${shot.instance} - ${shot.name}`"
        loading="lazy"
      />
    </div>
  </div>
</template>


<style scoped>

.ScreenshotGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    gap: 16px;
    justify-content: start;
    align-content: start;
    width: 100%;
}

.ScreenshotGrid img {
    width: 100%;
    height: 200px;
    object-fit: cover; 
    box-sizing: border-box;
    border-radius: 6px;
    transition: scale 300ms cubic-bezier(.34, 1.56, .64, 1);
}

.ScreenshotGrid img:hover {
    scale: 1.02;
}

.ScreenshotGrid img:active {
    filter: brightness(0.5);
    scale: 1;
}


.Notes {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 100px 32px 32px 116px;
    box-sizing: border-box;
}

.NotesGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    gap: 16px;
    justify-content: start;
    align-content: start;
    width: 100%;
}

.Note {
    width: 300px;
    min-height: 100px;
    height: fit-content;
    border: 1px solid rgba(255, 255, 255, 0.151);
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(64px) saturate(1.3);
    border-radius: 24px;
    padding: 24px;
    box-sizing: border-box;
    border-width: 1px 0px;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0px 4px 10.2px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(24px) saturate(120%);
}

.Note:active {
    opacity: 0.8;
}

.Note p {
    color: white;
}

.Note h2 {
    user-select: none;
}

.Note p.date {
    color: rgba(255, 255, 255, 0.7);
    text-align: right;
    user-select: none;
}

.Notes h1 {
position: absolute;
top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: 1;
}

</style>