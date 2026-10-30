<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Render, RunningAnimation } from 'skin3d'
import bgplay from '../assets/background_play.png'

const skinContainer = ref(null)
const reflectionContainer = ref(null)

const instanceName = ref('')
const instances = ref({})
const activity = ref('')

let viewer = null
let reflectionViewer = null
let removeProgressListener = null
let reloadTimeout = null
let fallbackTimeout = null

let downloadComplete = false
let launchSucceeded = false
let isReloading = false
let receivedProgress = false

function cancelPendingReload() {
  clearTimeout(reloadTimeout)
  reloadTimeout = null
  isReloading = false
}
function armStallTimer() {
  clearTimeout(fallbackTimeout)
  if (!launchSucceeded || downloadComplete) return

  fallbackTimeout = setTimeout(() => {
    downloadComplete = true
    reloadWhenReady()
  }, receivedProgress ? 15000 : 7000)
}

function reloadWhenReady() {
  if (!downloadComplete || !launchSucceeded || isReloading) return

  isReloading = true
  clearTimeout(fallbackTimeout)

  reloadTimeout = setTimeout(() => {
    window.location.reload()
  }, 7000)
}

function cancel() {
  window.location.reload()
}

async function loadInstances() {
  instances.value =
    await window.electronAPI.library_getinstancedata()

  const selected = Object.values(instances.value)
    .find(instance => instance.selected)

  instanceName.value = selected?.name ?? ''
}

onMounted(async () => {
  const elements = document.querySelectorAll(
    '.activity, .Progressbg, .background, button'
  )
    elements.forEach(element => {
    element.animate(
      [
        {
          filter: 'blur(50px) saturate(3)',
          transform: 'scale(0.5)'
        },
        {
          filter: 'blur(0px) saturate(1)',
          transform: 'scale(1)'
        }
      ],
      {
        duration: 350,
        easing: 'ease-out',
        fill: 'forwards'
      }
    )
  })

  try {
    await loadInstances()

    if (!instanceName.value) {
      activity.value = 'No instance selected'
      alert('No instance selected. Please select an instance first.')
      return
    }
  } catch (error) {
    const details = error?.message || String(error)

    activity.value = 'Failed to load instances'
    alert(`Failed to load instances:\n\n${details}`)
    return
  }

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

    const skinUrl = `https://mc-heads.net/skin/${username}`

    if (skinContainer.value) {
      viewer = new Render({
        canvas: skinContainer.value,
        width: 200,
        height: 300
      })

      viewer.animation = new RunningAnimation()
      skinContainer.value.style.pointerEvents = 'none'

      await viewer.loadSkin(skinUrl)
      viewer.globalLight.intensity = 3.2

      const model = viewer.playerObject ?? viewer.model

      if (model?.rotation) {
        model.rotation.y = Math.PI / 2 - 0.2
      }
    }

    if (reflectionContainer.value) {
      reflectionViewer = new Render({
        canvas: reflectionContainer.value,
        width: 200,
        height: 300
      })

      reflectionViewer.animation = new RunningAnimation()
      reflectionContainer.value.style.pointerEvents = 'none'

      await reflectionViewer.loadSkin(skinUrl)
      reflectionViewer.globalLight.intensity = 3.2

      const reflectionModel =
        reflectionViewer.playerObject ?? reflectionViewer.model

      if (reflectionModel?.rotation) {
        reflectionModel.rotation.y = Math.PI / 2 - 0.2
      }
    }
  } catch {
   
  }

  try {
    removeProgressListener =
      window.electronAPI.onDownloadProgress((data) => {
        if (typeof data?.percent !== 'number') return

        receivedProgress = true

        activity.value =
          `(${data.percent.toFixed(2)}% Downloaded)`

        if (data.percent >= 99.9) {
          downloadComplete = true
          reloadWhenReady()
        } else {

          downloadComplete = false
          cancelPendingReload()
          armStallTimer()
        }
      })
  } catch {

  }


  try {
    activity.value = `Configuring ${instanceName.value}...`

    const result = await window.electronAPI.launch_instance(
      instanceName.value
    )

    if (result?.success) {
      launchSucceeded = true
      activity.value = 'Preparing'

      if (downloadComplete) {
        reloadWhenReady()
      } else {
        armStallTimer()
      }
    } else {
      const details = [
        `Instance: ${instanceName.value}`,
        `Stage: ${result?.stage ?? 'Unknown'}`,
        `Error: ${result?.error ?? 'No error message returned'}`
      ].join('\n\n')

      activity.value =
        `Launch failed: ${result?.error ?? 'Unknown error'}`

      alert(`Minecraft launch failed!\n\n${details}`)
    }
  } catch (error) {
    const details = error?.message || String(error)

    activity.value = 'Failed to launch Minecraft'
    alert(`Minecraft launch error:\n\n${details}`)
  }
})

onBeforeUnmount(() => {

  removeProgressListener?.()

  clearTimeout(reloadTimeout)
  clearTimeout(fallbackTimeout)

  viewer?.dispose?.()
  reflectionViewer?.dispose?.()
})
</script>

<template>

  <h2 class="activity">Launching: {{ activity }}</h2>
  <div class="Progressbg"></div>
  <div class="background">
    <img :src="bgplay" alt="Background" draggable="false" />

  
    <canvas
      ref="reflectionContainer"
      id="skin_reflection_container"
      width="200"
      height="300"
    ></canvas>

    <canvas
      ref="skinContainer"
      id="skin_view_container"
      width="200"
      height="300"
    ></canvas>

    <div class="LoadingBarGlowyThing">
      
    </div>
   
  </div>
  <!-- <button>Minimize</button> -->
</template>

<style scoped>
.background {
  position: fixed;
  inset: 0;
  background: black;
  overflow: hidden;
  z-index: 99999;
}

.background img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}

#skin_view_container {
  position: absolute;
  z-index: 24;
  width: 200px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: block;
  pointer-events: none;
  animation: moveAcross 3s linear infinite;
}

#skin_reflection_container {
  position: absolute;
  z-index: 23;
  width: 200px;
  height: 300px;

  top: calc(50% + 300px);
  left: 50%;
  filter: blur(14px);

  transform: translate(-50%, -50%) scaleY(-1);
  transform-origin: center;

  display: block;
  opacity: 0.3;
  pointer-events: none;

  animation: moveAcrossReflection 3s linear infinite;
}

@keyframes moveAcross {
  from {
    left: -200px;
  }
  to {
    left: calc(100% + 200px);
  }
}


@keyframes moveAcrossReflection {
  from {
    left: -200px;
  }
  to {
    left: calc(100% + 200px);
  }
}

.LoadingBarGlowyThing {
  position: absolute;
  bottom: -20px;
  left: -10%;
  width: 120%;
  height: 40px;

  background-color: var(--activecolor);
  border-radius: 0;
  opacity: 0.5;
  filter: blur(64px) saturate(2);
  pointer-events: none;

  animation:
    glowColors 3s ease-in-out infinite,
    glowSaturate 3s ease-in-out infinite;
}

@keyframes glowColors {
  0%, 100% {
    background-color: rgb(8, 153, 172);
  }

  33% {
    background-color: var(--activecolor);
  }

  66% {
    background-color: rgb(118, 139, 0);
  }
}

@keyframes glowSaturate {
  0%, 100% {
    filter: blur(64px) saturate(2);
  }

  33% {
    filter: blur(64px) saturate(3);
  }

  66% {
    filter: blur(64px) saturate(5);
  }

  85% {
    filter: blur(64px) saturate(4);
  }
}



.activity {
  position: absolute;
  top: 20px;
  left: 20px;
  margin: 0;
  color: white;
  font-size: 24px;
  line-height: 1.3;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
  z-index: 100000;
  text-align: left;
  user-select: none;
}




.Progressbg {
  position: fixed;
  top: 65px;
  left: 0;
  width: 100%;
  height: 8px;
  
  border-radius: 6px;
  z-index: 100001;
  pointer-events: none;
  overflow: hidden;
  
}

.Progressbg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 25%;
  height: 100%;
  background-color: rgb(73, 201, 252);
  border-radius: 6px;
  animation: slideProgress 1.5s linear infinite;
  filter: blur(50px) saturate();
}

@keyframes slideProgress {
  from {
    left: -25%;
  }

  to {
    left: 125%;
  }
}

</style>
