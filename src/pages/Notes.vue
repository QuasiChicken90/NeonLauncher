<script setup>
import { ref } from 'vue'
import Toolbar from '../components/Notes/Toolbar.vue'

const currentTab = ref('notes')
</script>

<template>
    <Toolbar v-model="currentTab" />

    <div class="Notes">
        <div v-if="currentTab === 'notes'">
            <h1>Coming Soon: Store anything important here</h1>
            <p>Coordinates, links and more</p>
        </div>

        <div v-else-if="currentTab === 'screenshots'">
            <h1>Coming Soon: All screenshots and screenshot features</h1>
            <p>All screenshots across instances, with screenshot tools to save coordinates and important information</p>
        </div>
    </div>
</template>


<style scoped>

    .Notes {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center; 
        align-items: center;    

    }
    h1 {
        color: white;
        text-align: center;
        font-weight: 1;
    }

    p {
        color: white;
        text-align: center;
        font-weight: 1;
    }
</style>
