<script setup>
import { ref } from 'vue'

const activeTab = ref('General')

const props = defineProps({
    name: { type: String, required: true }
})

const emit = defineEmits(['close'])
const closing = ref(false)

const tabs = [
    { name: 'General', icon: 'fa-solid fa-cube' },
    { name: 'Content', icon: 'fa-solid fa-compass' },
    { name: 'Advanced', icon: 'fa-solid fa-sliders' },
    { name: 'Manage', icon: 'fa-solid fa-ellipsis' }
]

function selectTab(tab) {
    activeTab.value = tab
}

function close() {
    if (closing.value) return
    closing.value = true
    setTimeout(() => emit('close'), 175)
}

</script>

<template>
    <div class="overlay"></div>

    <div class="InstanceContainer" :class="{ closing }">

        <div class="Sidebar">
            <button
                v-for="tab in tabs"
                :key="tab.name"
                :class="{ active: activeTab === tab.name }"
                @click="selectTab(tab.name)"
            >
                <i :class="tab.icon"></i>
                {{ tab.name }}
            </button>
        </div>

        <div class="Content">

        <div class="Toolbar">
            <button @click="close">Done</button>
        </div>

            <div v-if="activeTab === 'General'" class="Centered">
    <h2>Coming Soon</h2>
    <p>General settings for this instance</p>
    </div>

    <div v-else-if="activeTab === 'Content'" class="Centered">
        <h2>Coming Soon</h2>
        <p>Manage your mods & installed content</p>
    </div>

    <div v-else-if="activeTab === 'Advanced'" class="Centered">
        <h2>Coming Soon</h2>
        <p>Advancecd configuration for this instance</p>
    </div>

    <div v-else-if="activeTab === 'Manage'" class="Centered">
        <h2>Coming Soon</h2>
        <p>Manage this instance</p>
    </div>

        </div>

    </div>
</template>

<style scoped>
.InstanceContainer {
    width: min(900px, 90vw);
    height: min(650px, 85vh);

    background-color: rgba(29, 29, 29, 0.1);
    backdrop-filter: blur(12px) saturate(2.5);

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    z-index: 2566;

    border: 1px solid rgba(255, 255, 255, 0.13);
    box-shadow: 0px 0px 0px 1px #000000;
    border-radius: 32px;

    display: flex;
    flex-direction: row;
    overflow: hidden;
    animation: scaleIn 175ms linear;
}

.Sidebar {
    width: 260px;
    min-width: 220px;
    height: 100%;

    background: transparent;
    padding: 16px;
    box-sizing: border-box;
    flex-shrink: 0;

    display: flex;
    flex-direction: column;
    gap: 10px;
}

.Content {
    flex: 1;
    min-width: 0;
    height: 100%;

    background-color: rgb(0, 0, 0, 0.5);

    padding: 32px;
    box-sizing: border-box;

    overflow-y: auto;
    position: relative;
}

.Sidebar button {
    height: 46px;
    width: 100%;
    padding: 0 16px;

    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;

    border: none;
    border-radius: 256px;

    color: white;
    background-color: transparent;

    text-align: left;
    font-size: 14px;
    font-weight: 600;
    user-select: none;

}

.Sidebar button i {
    width: 24px;
    font-size: 20px;
    text-align: center;
    color: white;
}

.Sidebar button:active {
    filter: opacity(0.5);
}

.Sidebar button.active {
    background-color: var(--activecolor, rgba(255, 255, 255, 0.12));
    color: white;
}


@media (max-width: 600px) {
    .InstanceContainer {
        width: 95vw;
        height: 90vh;
        border-radius: 16px;
    }

    .Sidebar {
        width: 30%;
        min-width: 90px;
        padding: 12px 8px;
    }

    .Sidebar button {
        padding: 0 10px;
        gap: 8px;
        font-size: 12px;
    }

    .Sidebar button i {
        font-size: 13px;
    }

    .Content {
        padding: 16px;
    }
}

@media (max-width: 380px) {
    .InstanceContainer {
        flex-direction: column;
    }

    .Sidebar {
        width: 100%;
        min-width: 0;
        height: auto;
        flex-direction: row;
        flex-shrink: 0;
        gap: 4px;
    }

    .Sidebar button {
        justify-content: center;
        padding: 8px 4px;
        flex-direction: column;
        height: 60px;
        gap: 4px;
        font-size: 10px;
    }

    .Content {
        width: 100%;
        flex: 1;
    }
}

.overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.534);
    z-index: 2565;
}


.Toolbar {
    width: 100%;
    height: 55px;
    top: 0;
    left: 0;
    position: absolute;
    box-sizing: border-box;
    padding: 16px;
    background-color: rgba(255, 255, 255, 0.055);
    border-bottom: 1px solid rgba(255, 255, 255, 0.050);
    backdrop-filter: blur(15px) saturate(1.5);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-end;
  align-items: center;
  align-content: stretch;
  gap: 20px;
}

.Toolbar button {
    background-color: transparent;
    border: none;
    font-size: 16px;
    font-weight: 600;
    color: var(--activecolor);
    user-select: none;
}

.Toolbar button:active {
    filter: brightness(0.35);
}


.InstanceContainer.closing {
    animation: scaleOut 175ms linear;
}


.overlay.closing {
    animation: fadeOut 175ms linear forwards;
}

@keyframes scaleIn {
    from {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }

    to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
}

@keyframes scaleOut {
    from {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }

    to {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }
}
.Centered {
    position: absolute;
    inset: 55px 0 0 0;  
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px;
    box-sizing: border-box;
}

.Centered h2,
.Centered p {
    margin: 0;
}

.Centered p {
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.801);
    opacity: 0.5;
    font-size: 14px;
}
</style>
