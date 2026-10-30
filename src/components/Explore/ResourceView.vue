<script setup>
import { ref, computed, onMounted } from 'vue'
import AlertBasic from '../Interface/AlertBasic.vue'

const props = defineProps({
    project: { type: Object, required: true }
})

const emit = defineEmits(['close', 'install'])

const closing = ref(false)

function cancel() {
    closing.value = true
    setTimeout(() => emit('close'), 175)
}

const showAlert = ref(false)
const alertTitle = ref('Notification')
const alertDescription = ref('')

const isMod = props.project.project_type === 'mod'

const instances = ref([])
const projectVersions = ref([])
const loading = ref(true)

onMounted(async () => {
    try {
        const [data, res] = await Promise.all([
            window.electronAPI.library_getinstancedata(),
            fetch(`https://api.modrinth.com/v2/project/${props.project.project_id}/version`)
        ])

        instances.value = Object.entries(data).map(([key, inst]) => ({ key, ...inst }))
        projectVersions.value = await res.json()
    } catch (err) {
        console.error(err)
    }
    loading.value = false
})

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function acceptedLoaders(type) {
    const t = type.toLowerCase()
    return t === 'quilt' ? ['quilt', 'fabric'] : [t]
}

function findVersion(inst) {
    const loaders = acceptedLoaders(inst.type)
    return projectVersions.value.find(v =>
        v.game_versions.includes(inst.version) &&
        (!isMod || loaders.some(l => v.loaders.includes(l)))
    )
}

const compatibleInstances = computed(() =>
    instances.value
        .map(inst => ({
            ...inst,
            label: `${inst.name} (${capitalize(inst.type)})`,
            match: findVersion(inst)
        }))
        .filter(inst => inst.match)
)

const instanceSearch = ref('')
const instanceDropdown = ref(false)
const selected = ref(null)

const filteredInstances = computed(() =>
    compatibleInstances.value.filter(inst =>
        inst.label.toLowerCase().includes(instanceSearch.value.toLowerCase())
    )
)

function selectInstance(inst) {
    selected.value = inst
    instanceSearch.value = inst.label
    instanceDropdown.value = false
}

function onInput() {
    selected.value = null
    instanceDropdown.value = true
}

function closeDropdown() {
    instanceDropdown.value = false
    if (!selected.value) instanceSearch.value = ''
}

function install() {
    if (!selected.value) {
        alertTitle.value = 'Incorrect information'
        alertDescription.value = 'No instance was chosen'
        showAlert.value = true
        return
    }

    emit('install', {
        instance: selected.value.key,
        version: selected.value.match
    })
    cancel()
}
</script>

<template>
    <div>
        <div class="bg" @click="cancel"></div>

        <div class="CreateNew" :class="{ closing }">
            <h2>Install "{{ project.title }}" to:</h2>

            <p>Pick Instance</p>

            <div class="Version">
                <input
                    :placeholder="loading ? 'Loading...' : 'Select an instance'"
                    type="text"
                    v-model="instanceSearch"
                    @focus="instanceDropdown = true"
                    @input="onInput"
                    @blur="closeDropdown"
                >

                <div class="VersionDropdown" v-if="instanceDropdown && !loading">
                    <div
                        class="VersionOption"
                        v-for="inst in filteredInstances"
                        :key="inst.key"
                        @mousedown.prevent="selectInstance(inst)"
                    >
                        {{ inst.label }}
                    </div>

                    <div class="VersionOption" v-if="!filteredInstances.length">
                        No compatible instances
                    </div>
                </div>
            </div>

            <div class="Options">
                <button @click="cancel" style="color: red;">Cancel</button>
                <button @click="install">Install</button>
            </div>
        </div>

        <AlertBasic
            v-if="showAlert"
            :title="alertTitle"
            :description="alertDescription"
            @close="showAlert = false"
        />
    </div>
</template>

<style scoped>

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