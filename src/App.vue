<script setup>
import TabViewLeft from './components/Interface/TabViewLeft.vue'
import background from './assets/background.png'
import setup from './components/Setup/New.vue'
import Updating from './components/Setup/Updating.vue'
import { ref, onMounted } from 'vue'

const showSetup = ref(false) 
const updating = ref(false)

onMounted(async () => {
    const setupComplete = await window.electronAPI.launcher_newuser()

    if (setupComplete === false) {
        showSetup.value = true
    }

    const versionCheck = "https://raw.githubusercontent.com/QuasiChicken90/NeonLauncher/refs/heads/main/latestversion.txt"
    const currentver = "1.0.0-Beta_5"

    try {
        const response = await fetch(versionCheck, { cache: 'no-store' })
        if (!response.ok) {
            throw new Error(`Version check failed: HTTP ${response.status}`)
        }

        const latestver = (await response.text()).trim()

        if (!/^[\w.\-]+$/.test(latestver)) {
            throw new Error(`Invalid version string: ${latestver.slice(0, 40)}`)
        }

        if (latestver === currentver) {
            console.log("Already latest.")
            return
        }

        updating.value = true

        const result = await window.electronAPI.update_download(
            `https://github.com/QuasiChicken90/NeonLauncher/releases/download/${latestver}/${latestver}.zip`
        )

        if (!result.success) {
            throw new Error(result.error)
        }

    } catch (error) {
        console.error("Update failed:", error)
        updating.value = false   
    }
})
</script>

<template>

    <setup v-if="showSetup"></setup>
    <img class="background" :src="background" draggable="false">
    <Updating v-if="updating"></Updating>
 <TabViewLeft />
</template>

<style>
.background {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    user-select: none;
    -webkit-user-drag: none;
    z-index: -1;
}

h2 {
    color: white;
    font-family: Inter, sans-serif;
}
</style>
