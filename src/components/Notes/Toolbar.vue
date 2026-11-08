
<script setup>
import { ref } from 'vue'
import CreateNew from './CreateNew.vue'

const activeTab = defineModel({ default: 'notes' })

const emit = defineEmits(['created'])

const createNewDisplay = ref(false)

function openCreate() {
    if (activeTab.value === 'notes') {
        createNewDisplay.value = true
    }
}

function closeCreate() {
    createNewDisplay.value = false
}

function handleCreated(note) {
    emit('created', note)
}
</script>

<template>
    <CreateNew
        v-if="createNewDisplay"
        @close="closeCreate"
        @created="handleCreated"
    />

    <div class="Toolbar">
        <div class="search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search notes and screenshots..." />
        </div>

        <div class="DuelTab">
            <button
                :class="{ selected: activeTab === 'notes' }"
                @click="activeTab = 'notes'"
            >
                Notes
            </button>

            <button
                :class="{ selected: activeTab === 'screenshots' }"
                @click="activeTab = 'screenshots'"
            >
                Screenshots
            </button>
        </div>

        <button
            class="create"
            :class="{ hidden: activeTab !== 'notes' }"
            :disabled="activeTab !== 'notes'"
            @click="openCreate"
        >
            <i class="fa-solid fa-plus"></i>
            Create
        </button>
    </div>
</template>

<style scoped>
.Toolbar {
    position: absolute;
    top: 0;
    width: 100%;
    height: 50px;
    background: rgba(217, 217, 217, 0.01);
    border-bottom: 2px solid #000;
    backdrop-filter: blur(12px) saturate(120%);
    z-index: 256;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    box-sizing: border-box;
    padding-right: 20px;
}

.Toolbar button {
    padding: 0 16px;
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

.search input:active {
    filter: brightness(80%);
}

.search input::placeholder {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    font-family: 'Inter';
}

.search:focus-within {
    outline: 3px solid var(--activecolor);
}

.Toolbar button.create {
    margin-right: 0;
}

.Toolbar button.create.hidden {
    visibility: hidden;
    pointer-events: none;
}
</style>
