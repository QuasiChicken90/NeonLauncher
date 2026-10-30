<script setup>
import { ref } from 'vue'
import LoginOverlay from './LoginOverlay.vue'

const imageUrl = ref(
    'https://mc-api.io/render/FACE/NoPlayerSet00000000/JAVA?size=256'
)

const LoggedIn = ref(false)

async function initlogin() {
    var isLoggedIn = await window.electronAPI.authenticate_isloggedin()
    var username = await window.electronAPI.getjsondata("Library/Config/account.json", "name")
    if (isLoggedIn == true) {
        LoggedIn.value = true
        imageUrl.value = `https://mc-api.io/render/FACE/${username}/JAVA?size=256`
    }
}

initlogin()


const showLogin = ref(false)

async function authentication() {
    showLogin.value = true

    if (LoggedIn.value == false) {
        const result = await window.electronAPI.authenticate()

        console.log(result)
        showLogin.value = false
        window.location.reload()
    } 
    
    if (LoggedIn.value == true) {
        window.electronAPI.fs_rmfile("Library/Config/account.json")
        showLogin.value = false
        window.location.reload()
    }
}
</script>

<template>
    <div class="ProfileSection" :class="{ logout: LoggedIn }">
        <img :src="imageUrl" alt="Profile" draggable="false">
        <button @click="authentication">
            <i v-if="LoggedIn" class="fa-solid fa-right-to-bracket logout"></i>
            <i v-else class="fa-solid fa-right-from-bracket"></i>
        </button>
    </div>
    <LoginOverlay v-if="showLogin"></LoginOverlay>
</template>

<style scoped>
    .ProfileSection {
        width: 55px;
        height: auto;
        right: 15px;
        top: 15px;
        position: absolute;
        background: linear-gradient(180deg, rgba(217, 217, 217, 0.11) 0%, rgba(90, 159, 255, 0.0715) 100%);
        box-shadow: 0px 0px 0px 1px rgba(255, 255, 255, 0.07), 0px 4px 10.2px #000000;
        border-radius: 27.5px;
        border-bottom: 1px solid rgba(90, 159, 255, 0.65);
        border-top: 1px solid rgba(255, 255, 255, 0.199);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding-top: 12px;
        padding-bottom: 12px;
        flex-direction: column;
           transition:
    scale 300ms cubic-bezier(.34, 1.56, .64, 1),
    filter 150ms ease;

    }
@keyframes ripple {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

    .ProfileSection.logout:active {
        border-bottom: 1px solid rgba(255, 1, 1, 0.5);
    }

    .ProfileSection:active {
        border-bottom: 1px solid rgba(90, 159, 255, 0.4);
    }

    .ProfileSection:hover {
        scale: 1.2;
    }

    .ProfileSection.logout {
        border-bottom: 1px solid rgba(255, 115, 90, 0.65);
        background: linear-gradient(180deg, rgba(217, 217, 217, 0.11) 0%, rgba(255, 90, 90, 0.072) 100%);
    }

    i {
        color: #5A9FFF;
        animation: ripple 1.5s infinite;
        font-size: 24px;
    }

    i:hover {
        animation: none;
    }

    i.logout {
        color: #ff605a;
        animation: none;
    }

    button {
        background-color: transparent;
        border: none;

    }

    img {
        width: 34px;
        height: 34px;
        border-radius: 256px;
        user-select: none;
        -webkit-user-drag: none;
    }

    button:active {
        filter: brightness(0.5);
    }

    h2 {
        color: white;
    }
</style>

