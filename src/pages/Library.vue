<script setup>
import Toolbar from '../components/Library/Toolbar.vue'
import AlertBasic from '../components/Interface/AlertBasic.vue'
import CreateNew from '../components/Library/CreateNew.vue'
import { ref, onMounted } from 'vue'

const showAlert = ref(false)
const instances = ref([])

async function loadInstances() {
    instances.value = await window.electronAPI.library_getinstancedata()
}

async function selectInstance(instance, version) {
    await window.electronAPI.library_selectinstance(instance.name)
    await loadInstances()
}

onMounted(loadInstances)
</script>

<template>
    <Toolbar @created="loadInstances" />
    
    <AlertBasic
        v-if="showAlert"
        title="Feature Not Available"
        description="This feature is coming soon"
        @close="showAlert = false"
    />

    <div class="InstancesGroup">

        <div
            v-for="instance in instances"
            :key="instance.name"
            class="Instance"
        >
            <img
                @click="showAlert = true"
                :src="instance.icon"
                alt=""
            >

            <div class="IDescription">
                <h2>{{ instance.name }}</h2>
                <h3>{{ instance.version }} ({{ instance.type.charAt(0).toUpperCase() + instance.type.slice(1) }})</h3>
            </div>

  <div class="InstanceButtons">
    <button @click="showAlert = true"
                
                alt="">
        <i class="fa-solid fa-pencil"></i>
    </button>

<button
    :class="{ selectedbtn: instance.selected }"
    @click="selectInstance(instance, instance.version)"
>
    <i class="fa-solid fa-check"></i>
    {{ instance.selected ? 'Selected' : 'Select' }}
</button>
</div>
        </div>

    </div>
   
</template>

<style lang="css" scoped>
.InstancesGroup {
      display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  align-content: stretch;
  gap: 12px;
    position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* background-color: rgb(109, 41, 73); */
  width: calc(100% - 250px);
  height: 100%;
   box-sizing: border-box;
   padding-top: 80px;
      overflow-y: auto;
    overflow-x: hidden;
}

.Instance {
    width: 100%;
    height: 80px;
    display: flex;
    background: rgba(0, 0, 0, 0.3);
    border-width: 1px 0px 1px 0px;
    border-style: solid;
    border-color: color-mix(in srgb, var(--activecolor) 30%, transparent);
    backdrop-filter: blur(12px) saturate(120%);
    border-radius: 256px;
    flex-shrink: 0;
    align-items: center;
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
}

h2,
h3 {
    margin: 0;
}

h2 {
    font-weight: 600;
    font-size: 18px;
}

h3 {
    color: white;
    font-size: 16px;
    opacity: 45%;
}

.IDescription {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 4px;
    padding-left: 20px;
}

img {
    width: 40px;
    height: 40px;
}

button {
    height: 48px;
    padding-left: 16px;
    padding-right: 16px;
    box-sizing: border-box;
    border-width: 1px 0px;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(32px);
    border-radius: 32px;
    color: white;
    font-weight: 700;
    transition:
        scale 300ms cubic-bezier(.34, 1.56, .64, 1),
        filter 150ms ease;
    background: rgba(255, 255, 255, 0.096);
}

button:hover {
    scale: 1.2;
    background: var(--activecolor);
}

button:active {
    opacity: 25%;
    scale: 1.1;
    filter: blur(2px) saturate(150%);
}

* {
    user-select: none;
    -webkit-user-drag: none;
}

img {
       transition:
    scale 300ms cubic-bezier(.34, 1.56, .64, 1),
    filter 150ms ease;
}

img:hover {
    scale: 1.2;
}

img:active {
    scale: 1.5;
    opacity: 90%;
    filter: blur(2px) saturate(150%);
}

.selectedbtn {
    background: var(--activecolor);
}

.InstanceButtons {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
    pointer-events: none;
}

.Instance:hover .InstanceButtons {
    pointer-events: auto;
}

.InstanceButtons:has(button:last-child:hover) button:first-child {
    border-top-color: color-mix(in srgb, var(--activecolor) 50%, transparent);
}

.InstanceButtons:has(button:first-child:hover) button:last-child {
    border-color: color-mix(in srgb, var(--activecolor) 30%, transparent);
}

</style>
