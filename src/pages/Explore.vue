<script setup>

import { ref, watch } from 'vue'

const currentTab = ref('Mods')
const query = ref('')
const results = ref([])

const tabTypes = {
    'Mods': 'mod',
    'Resource Packs': 'resourcepack',
    'Shaders': 'shader'
}

function selectTab(tab) {
    currentTab.value = tab
}

let requestId = 0

async function fetchResults() {
    const id = ++requestId 
    const facets = encodeURIComponent(
        JSON.stringify([[`project_type:${tabTypes[currentTab.value]}`]])
    )
    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query.value)}&facets=${facets}&limit=100`

    try {
        const res = await fetch(url)
        const data = await res.json()
        if (id === requestId) results.value = data.hits
    } catch (err) {
        console.error(err)
    }
}

watch([currentTab, query], fetchResults, { immediate: true })

</script>

<template>
    <div class="temp">
        <h1>Coming Soon</h1>
    </div>
    
<div class="Toolbar">
    <div class="search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" :placeholder="`Search ${currentTab}...`" v-model="query" />
    </div>

    <div class="Tabs">
        <button
            :class="{ selected: currentTab === 'Mods' }"
            @click="selectTab('Mods')"
        >
            Mods
        </button>

        <button
            :class="{ selected: currentTab === 'Resource Packs' }"
            @click="selectTab('Resource Packs')"
        >
            Resource Packs
        </button>

        <button
            :class="{ selected: currentTab === 'Shaders' }"
            @click="selectTab('Shaders')"
        >
            Shaders
        </button>
    </div>
</div>


<div class="Content">
    <div class="Resource" v-for="project in results" :key="project.project_id">
        <img v-if="project.icon_url" :src="project.icon_url" alt="" />
        <div class="ResourceText">
            <h2>{{ project.title }}</h2>
            <h3>{{ project.author }}</h3>
            <p>{{ project.description }}</p>
        </div>
    </div>
</div>

</template>

<style scoped>

.Toolbar {
    position: absolute;
    top: 0px;
    width: 100%;

    height: 50px;
    background: rgba(217, 217, 217, 0.01);
    border-bottom: 2px solid #000000;
    backdrop-filter: blur(12px) saturate(120%);
    z-index: 256;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    box-sizing: border-box;
    padding-right: 20px;
}

i {
    color: white;
    font-size: 16px;
    margin-right: 4px;
}

.search {
    position: absolute;
    left: 100px;
    width: 40%;
    height: 35px;

    display: flex;
    align-items: center;

    background: rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0px 4px 11.3px 2px rgba(0, 0, 0, 0.1);
}

.search i {
    margin-left: 14px;
    color: white;
}

.search input {
    flex: 1;
    height: 100%;
    border: none;

    outline: none;
    background: transparent;
    color: white;
    padding-left: 10px;
}

.search input::placeholder {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    font-family: 'Inter';
}

.search input:active {
    filter: brightness(80%);
}

.search:focus-within {
    outline: 3px solid var(--activecolor);
}

.Content {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 100px;
    width: 90%;

    box-sizing: border-box;
    padding-top: 70px;
    padding-bottom: 20px;
    padding-right: 20px;
    overflow-y: auto;
}

.Resource {
    display: flex;
    align-items: center;
    gap: 16px;

    width: 100%;
    min-height: 100px;
    box-sizing: border-box;
    padding: 13px 16px;
    margin-bottom: 20px;

    background: rgba(118, 118, 118, 0.11);
    border-width: 1px 0px;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0px 4px 10.2px rgba(0, 0, 0, 0.2);
    border-radius: 14px;
    backdrop-filter: blur(16px);
    cursor: default;
    user-select: none;
    -webkit-user-drag: none;
}


.Resource:active {
    background-color: var(--activecolor);
}

.Resource img {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    object-fit: cover;
    border-radius: 12px;
}

.Resource h2,
.Resource h3,
.Resource p {
    margin: 0;
    color: white;
}

.Resource h3 {
    font-size: 13px;
    margin-bottom: 8px;
    margin-top: 4px;
    opacity: 0.8;
}

.Toolbar button {
    padding-left: 16px;
    padding-right: 16px;
    height: 35px;

    background: transparent;
    border-radius: 21.5px;
    color: white;
    font-size: 16px;
    font-weight: 700;
    margin-right: 9px;
    border: none;
}

.Toolbar button.selected {
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.Toolbar button:active {
    opacity: 45%;
}

.Content {
    opacity: 0; 
}

h1 {
  text-align: center;
  font-weight: 1;
  color: white;
}

.temp {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center; 
        align-items: center;    
}

</style>
