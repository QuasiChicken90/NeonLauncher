<script setup>
import { ref, computed, onMounted } from 'vue'
import AlertBasic from '../Interface/AlertBasic.vue'
const emit = defineEmits(['close', 'created'])

const name = ref('')

const showAlert = ref(false)
const alertDescription = ref('')
const alertTitle = ref('Notification')

const selectedLoader = ref('Vanilla')

const loaders = [
    { name: 'Vanilla', icon: 'fa-solid fa-v' },
    { name: 'Fabric', icon: 'fa-solid fa-scroll' },
    { name: 'Forge', icon: 'fa-solid fa-hammer' },
    { name: 'Quilt', icon: 'fa-solid fa-q' }
]

const closing = ref(false)

function cancel() {
    closing.value = true

    setTimeout(() => {
        emit('close')
    }, 175)
}

const versions = ref([])
const versionSearch = ref('')
const versionDropdown = ref(false)

onMounted(async () => {
    const res = await fetch(
        'https://launchermeta.mojang.com/mc/game/version_manifest.json'
    )
    const data = await res.json()
    versions.value = data.versions
})

const filteredVersions = computed(() =>
    versions.value.filter(v =>
        v.id.toLowerCase().includes(versionSearch.value.toLowerCase())
    )
)

function selectVersion(version) {
    versionSearch.value = version.id
    versionDropdown.value = false
}

function closeVersionDropdown() {
    setTimeout(() => {
        if (!versions.value.some(v => v.id === versionSearch.value)) {
            versionSearch.value = ''
        }

        versionDropdown.value = false
    }, 25)
}


let resolveAlert

async function createInstance() {
    if (!name.value.trim() || !versionSearch.value) {
        alertTitle.value = 'Incorrect information'
        alertDescription.value = 'Please fill in all fields. (Name, Version, Modding)'
    } else {
        try {
            await window.electronAPI.library_createinstance(
                name.value,
                selectedLoader.value.toLowerCase(),
                versionSearch.value
            )
            alertTitle.value = 'Instance created'
            alertDescription.value = 'Your instance was created successfully!'
            emit('created')
        } catch (error) {
            alertTitle.value = 'Could not create instance'
            alertDescription.value = error.message || 'An unexpected error occurred.'
        }
    }

    showAlert.value = true

    await new Promise(resolve => resolveAlert = resolve)
    if (alertDescription.value === 'Your instance was created successfully!') {
        cancel()
    }
}


</script>

<template>


    <div>

         <div class="bg"></div>


    <div class="CreateNew" :class="{ closing }">
        <h2>Create New</h2>

        <p>Name</p>
        <input
    placeholder="Name this instance"
    type="text"
    v-model="name"
/>

        <p>Version</p>
        <div class="Version">
<input
    placeholder="Select or type a version"
    type="text"
    v-model="versionSearch"
    @focus="versionDropdown = true"
    @input="versionDropdown = true"
    @blur="closeVersionDropdown"
>

    <div v-if="versionDropdown" class="VersionDropdown">
        <div
            v-for="version in filteredVersions"
            :key="version.id"
            class="VersionOption"
            @mousedown="selectVersion(version)"
        >
            {{ version.id }}
        </div>
    </div>
</div>
        
        <p>Modding</p>
          <div class="Loaders">
        <button
            v-for="loader in loaders"
            :key="loader.name"
            :class="{ selected: selectedLoader === loader.name }"
            @click="selectedLoader = loader.name"
        >
            <i :class="loader.icon"></i>
            {{ loader.name }}
        </button>
    </div>
        <div class="Options">
            <button @click="cancel" style="color: red;">Cancel</button>
            <button @click="createInstance">Create</button>
        </div>
    </div>
<AlertBasic
    v-if="showAlert"
    :title="alertTitle"
    :description="alertDescription"
    @close="showAlert = false; resolveAlert()"
/>
    </div>




</template>

<style scoped>

* {
    user-select: none;
    -webkit-user-drag: none;
}

.CreateNew {
    position: absolute;
    width: 600px;
    height: auto;
    background: rgba(134, 134, 134, 0.1);
    box-shadow: 0px 0px 0px 1px #000000;
    backdrop-filter: blur(14px) saturate(150%);
    top: 0%;
    left: 50%;
    transform: translate(-50%, 0%);
    border-radius: 0px 0px 24px 24px;
    z-index: 2500;
    padding: 20px;
    box-sizing: border-box;
    animation: slideDown 175ms linear;
}

@keyframes slideDown {
    from {
        transform: translate(-50%, -100%);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0%);
        opacity: 1;
    }

}


@keyframes slideUp {
    from {
        transform: translate(-50%, 0%);
        opacity: 1;
    }

    to {
        transform: translate(-50%, -100%);
        opacity: 0;
    }
}

h2 {
    margin: 0 0 24px;
}

p {
    color: rgba(255, 255, 255, 0.836);
    text-align: left;
    font-size: 17px;
    font-weight: 600;
    margin: 4px 0 14px;

}

input {
    width: 100%;
    height: 45px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0px 4px 11.3px 2px rgba(0, 0, 0, 0.1);
    border-radius: 256px;
    color: white;
    font-size: 16px;
    box-sizing: border-box;
    padding: 10px 15px;
    margin-bottom: 20px;
}


.CreateNew.closing {
    animation: slideUp 175ms linear;
}
@keyframes slideUp {
    from {
        transform: translate(-50%, 0%);
        opacity: 1;
    }

    to {
        transform: translate(-50%, -100%);
        opacity: 0;
    }
}

input:active {
    filter: brightness(80%);
}

input:focus {
    outline: none;
    outline: var(--activecolor) 4px solid;
    border-bottom-color: transparent;
}

input::placeholder {
    color: white;
}

.bg {
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    z-index: 999;
        position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
}

.Loaders {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: stretch;
    align-content: stretch;
    gap: 20px;
    margin-top: 4px;
}

.Loaders button {
    height: 60px;
    width: 125px;
    border-radius: 256px;
    border: none;
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    font-weight: 600;
    backdrop-filter: blur(6px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            gap: 8px;
}

.Loaders button:active {
    filter: brightness(70%);
}

.Loaders button.selected {
   background-color: var(--activecolor);
}

.Options {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
}

.Options button {
    background-color: transparent;
    border: none;
    color: white;
    font-weight: 700;
    font-size: 16px;
}

.Options button:active {
    filter: brightness(40%);
}

i {
    font-size: 20px;
}


.Version {
    position: relative;
}

.VersionDropdown {
    position: absolute;
    top: 45px;
    left: 0;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 1);
    border-radius: 20px;
    padding: 5px;
    box-sizing: border-box;
    z-index: 3000;
    transition:
    scale 300ms cubic-bezier(.34, 1.56, .64, 1),
    filter 150ms ease;
}

.VersionDropdown:hover {
    scale: 1.010;
}

.VersionOption {
    color: white;
    padding: 10px 15px;
    border-radius: 20px;
}

.VersionOption:hover {
    background: var(--activecolor);
}


</style>
