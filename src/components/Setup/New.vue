
<script setup>
import video from '../../assets/new.mp4'

function completesetup() {
    window.location.reload()
}
</script>

<template>
    <div class="New">
        <div class="Content">
            <video
                :src="video"
                autoplay
                muted
                loop
                playsinline
                preload="auto"
            ></video>
        </div>

        <h2>Create, Manage and Launch instances easily</h2>
        <p>More features on the way</p>
        <br>
        <button @click="completesetup()">Continue</button>
    </div>
</template>

<style scoped>
.New {
    background: linear-gradient(180deg, #000000 60%, rgba(0, 0, 0, 0.1) 100%);
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 30000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(4px);
}

.Content {
    width: calc(100% - 150px);
    height: 60%;
    background-color: rgba(0, 0, 0, 0.123);
    box-sizing: border-box;
    margin-bottom: 16px;
    overflow: hidden;
}

.Content video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

h2, p {
    color: rgba(255, 255, 255, 0.9);
    margin: 12px;
    user-select: none;
}

button {
height: 60px;
width: 120px;
background: rgba(0, 0, 0, 0.2);
border-width: 1px 0px;
border-style: solid;
border-color: #434FA4;
backdrop-filter: blur(12.5px) saturate(130%);
border-radius: 256px;
color: white;
font-weight: 600;
font-size: 16px;
   transition: scale 300ms cubic-bezier(.34, 1.56, .64, 1);
  
}

button:hover {
    scale: 1.1;
}

button:active {
  background: rgba(20, 58, 165, 0.3);
  filter: brightness(66%);
  backdrop-filter: blur(12.5px) saturate(250%);
  scale: 1.0;
}

</style>
