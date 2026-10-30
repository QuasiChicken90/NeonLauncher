<script setup>
import { ref, onMounted } from 'vue'
import { Render, IdleAnimation } from 'skin3d'
import AlertBasic from '../../components/Interface/AlertBasic.vue'
import Launch from "../../pages/Launch.vue"

const skinContainer = ref(null)

const instanceName = ref('')
const instances = ref({})

const showAlert = ref(false)

const start = ref(false)

async function loadInstances() {
    instances.value = await window.electronAPI.library_getinstancedata()

    const selected = Object.values(instances.value)
        .find(instance => instance.selected)

    instanceName.value = selected?.name ?? 'No instance selected'
}


onMounted(async () => {
  loadInstances()
  try {

    let username = 'NoUsername00000000'

    const isLoggedIn =
      await window.electronAPI.authenticate_isloggedin()


    if (isLoggedIn === true) {
      username = await window.electronAPI.getjsondata(
        'Library/Config/account.json',
        'name'
      )
    }


    const viewer = new Render({
      canvas: skinContainer.value,
      width: 200,
      height: 300
    })

    viewer.animation = new IdleAnimation()

    const skinUrl = `https://mc-heads.net/skin/${username}`


    await viewer.loadSkin(skinUrl)


  } catch (error) {
    console.error('ERROR:', error)
  }
})


async function checks() {
  const loggedIn = await window.electronAPI.authenticate_isloggedin()

  if (loggedIn == false) {
      showAlert.value = true
      return
  }

  if (instanceName.value == "No instance selected") {
    showAlert.value = true
    return
  }

  start.value = true 
  
}

</script>

<template>
      <AlertBasic
        v-if="showAlert"
        title="Error"
        description="Make sure you're logged in and have selected an instance"
        @close="showAlert = false"
    />

    <Launch v-if="start"></Launch>
  <div class="StartGame">
    <canvas
      ref="skinContainer"
      id="skin_view_container"
      width="300"
      height="400"
    ></canvas>
    <br>
    <button @click="checks()">Play</button>
       <h2 v-if="instanceName">{{ instanceName }}</h2>
  </div>
  
</template>

<style scoped>
#skin_view_container {
  width: 600px;
  height: 800px;
}

.StartGame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  align-content: stretch;
  gap: 8px;

}

button {
  width: 400px;
  height: 60px;


background: rgba(0, 0, 0, 0.2);
border-width: 1px 0px;
border-style: solid;
border-color: color-mix(in srgb, var(--activecolor) 50%, transparent);
backdrop-filter: blur(12.5px) saturate(130%);
border-radius: 256px;
color: white;
font-weight: 600;
font-size: 16px;
   transition:
    scale 300ms cubic-bezier(.34, 1.56, .64, 1),
    filter 150ms ease-out;
    user-select: none;
}

button:hover {
    scale: 1.1;
}

button:active {
  background: color-mix(in srgb, var(--activecolor) 30%, transparent);;
  filter: brightness(66%);
  backdrop-filter: blur(12.5px) saturate(250%);
  scale: 1.0;
}

h2 {
  color: white;
  font-size: 16px;
  opacity: 0.6;
  user-select: none;
}
</style>