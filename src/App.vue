<script setup>
import TabViewLeft from './components/Interface/TabViewLeft.vue'
import Updating from './components/Setup/Updating.vue'
import Setup from './components/Setup/New.vue'

import { ref, onMounted } from 'vue'

import background1 from './assets/background_1.jpg'
import background2 from './assets/background_2.jpg'
import background3 from './assets/background_3.jpg'
import background4 from './assets/background_4.jpg'
import background5 from './assets/background_5.jpg'

const showSetup = ref(false)
const updating = ref(false)

const backgrounds = {
    1: background1,
    2: background2,
    3: background3,
    4: background4,
    5: background5
}

const accentColors = {
    1: '#4071db',
    2: '#db6c40',
    3: '#30b124',
    4: '#a09139',
    5: '#535557'
}

const background = ref(background5)

async function getTheme() {
    try {
        const themeNumber = await window.electronAPI.launcher_gettheme()
        const theme = backgrounds[themeNumber] ? themeNumber : 1

        background.value = backgrounds[theme]

        document.documentElement.style.setProperty(
            '--activecolor',
            accentColors[theme]
        )
    } catch (error) {
        console.error('Failed to load theme:', error)
        background.value = background1

        document.documentElement.style.setProperty(
            '--activecolor',
            accentColors[1]
        )
    }
}

onMounted(async () => {
    await getTheme()

    const setupComplete = await window.electronAPI.launcher_newuser()

    if (setupComplete === false) {
        showSetup.value = true
    }

    const versionCheck =
        'https://raw.githubusercontent.com/QuasiChicken90/NeonLauncher/refs/heads/main/latestversion.txt'

    const currentver = '1.0.0-Beta_6'

    try {
        const response = await fetch(versionCheck, {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Version check failed: HTTP ${response.status}`)
        }

        const latestver = (await response.text()).trim()

        if (!/^[\w.-]+$/.test(latestver)) {
            throw new Error(`Invalid version string: ${latestver.slice(0, 40)}`)
        }

        if (latestver === currentver) {
            console.log('Already latest.')
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
        console.error('Update failed:', error)
        updating.value = false
    }
})
</script>

<template>
    <Setup v-if="showSetup" />

    <img
        class="background"
        :src="background"
        draggable="false"
    >

    <Updating v-if="updating" />

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
