
<script setup>
import { ref } from 'vue'
import Play from '../../pages/Play.vue'
import Library from '../../pages/Library.vue'
import Explore from '../../pages/Explore.vue'
import Skin from '../../pages/Skin.vue'
import Map from '../../pages/Map.vue'
import Notes from '../../pages/Notes.vue'
import Settings from '../../pages/Settings.vue'

const activeTab = ref(0)
</script>

<template>
    <div
        class="Sidebar"
        :class="{
            firstTab: activeTab === 0,
            secondTab: activeTab === 1,
            thirdTab: activeTab === 2,
            fourthTab: activeTab === 3,
            fifthTab: activeTab === 4,
            sixthTab: activeTab === 5,
            lastTab: activeTab === 6
        }"
    >
        <button :class="{ activeTab: activeTab === 0 }"
            @click="activeTab = 0" v-tooltip="'Play'">
            <i class="fa-solid fa-play"></i>
        </button>

        <button :class="{ activeTab: activeTab === 1 }"
            @click="activeTab = 1" v-tooltip="'Library'">
            <i class="fa-solid fa-bars"></i>
        </button>

        <button :class="{ activeTab: activeTab === 2 }"
            @click="activeTab = 2" v-tooltip="'Content'">
            <i class="fa-solid fa-compass"></i>
        </button>

        <button :class="{ activeTab: activeTab === 3 }"
            @click="activeTab = 3" v-tooltip="'Skins'">
            <i class="fa-solid fa-person"></i>
        </button>

        <button :class="{ activeTab: activeTab === 4 }"
            @click="activeTab = 4" v-tooltip="'World Map'">
            <i class="fa-solid fa-map"></i>
        </button>

        <button :class="{ activeTab: activeTab === 5 }"
            @click="activeTab = 5" v-tooltip="'Notes'">
            <i class="fa-solid fa-note-sticky"></i>
        </button>

        <button :class="{ activeTab: activeTab === 6 }"
            @click="activeTab = 6" v-tooltip="'Settings'">
            <i class="fa-solid fa-gear"></i>
        </button>
    </div>

    <Play v-if="activeTab === 0" />
    <Library v-else-if="activeTab === 1" />
    <Explore v-else-if="activeTab === 2" />
    <Skin v-else-if="activeTab === 3" />
    <Map v-else-if="activeTab === 4" />
    <Notes v-else-if="activeTab === 5" />
    <Settings v-else-if="activeTab === 6" />
</template>

<style scoped>
.Sidebar {
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    gap: 14px;

    position: absolute;
    width: 69px;
    height: auto;
    left: 15px;
    background: rgba(118, 118, 118, 0.11);
    border-width: 1px 0px;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.21);
    box-shadow: 0px 4px 10.2px rgba(0, 0, 0, 0.8);
    border-radius: 34.5px;
    top: 50%;
    transform: translateY(-50%);

    transition:
        scale 300ms cubic-bezier(.34, 1.56, .64, 1),
        filter 150ms ease;

    backdrop-filter: blur(12px) saturate(120%);
    z-index: 9999;
}

.Sidebar:hover {
    scale: 1.050;
}

.Sidebar.firstTab {
    border-top: 1px solid var(--activecolor);
}

.Sidebar.lastTab {
    border-bottom: 1px solid var(--activecolor);
}

button {
    background-color: transparent;
    border: none;
    height: 48px;
    width: 48px;
    border-radius: 256px;
}

button.activeTab {
    background-color: var(--activecolor);
}

button:active {
    filter: brightness(0.5);
}

i {
    color: white;
    font-size: 24px;
}
</style>
