<script setup>
import { ref, onMounted } from 'vue'
import AlertBasic from '../components/Interface/AlertBasic.vue'

const storage = ref("Calculating...")
const alert_notloggedin = ref(false)
const whatsNew = ref("Loading...")

async function logout() {
    const login = await window.electronAPI.authenticate_isloggedin()
    if (login == true) {
        window.electronAPI.fs_rmfile("Library/Config/account.json")
        window.location.reload()
    } else {
        alert_notloggedin.value = true;
    }

}

onMounted(async () => {
try {
        const updateURL =
            "https://raw.githubusercontent.com/QuasiChicken90/NeonLauncher/refs/heads/main/Updates/1.0.0-Beta_4.txt";

        const response = await fetch(updateURL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const updateInfo = await response.text();
        whatsNew.value = updateInfo;
    } catch (err) {
        console.error("Failed to load update information:", err);
        whatsNew.value = "Unable to load update information.";
    }

    try {
        const gb = await window.electronAPI.fs_getusedstorage()
        storage.value = `${gb.toFixed(2)} GB`
    } catch (err) {
        console.error(err)
        storage.value = "Unavailable"
    }
})

</script>

<template> 

        <AlertBasic
        v-if="alert_notloggedin"
        title="Not logged in"
        description="You can't log out because you didn't login yet. Go to Play to login"
        @close="alert_notloggedin = false"
    />
    
    <div class="Settings">
        <div class="Setting">
            <h2>Storage Used</h2>
            <p>Total Instance & Tools storage: {{ storage }}</p>
        </div>

        <div class="Setting">
            <h2>Logout</h2>
            <p>Logout of current account</p>
            <button @click="logout()" style="background-color: #db4040;">Logout</button>
        </div>

        <div class="Setting">
            <h2>Whats New in this version</h2>
            <p>{{ whatsNew}}</p>
        </div>

    </div>
    
</template>


<style scoped>


.Settings {
    box-sizing: border-box;
    margin: 0;
    padding: 16px;
    width: 100%;
    height: 100vh;
    z-index: 2;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 14px;

    overflow-y: auto;
    overflow-x: hidden;
}

.Setting {
    box-sizing: border-box;
    width: 70%;
    flex-shrink: 0;
    height: auto;

    background: rgba(0, 0, 0, 0.3);
    border-radius: 37px;
    padding: 24px;
    border-width: 1px 0;
    border-style: solid;
    border-color: rgba(70, 58, 240, 0.21);
    backdrop-filter: blur(12px) saturate(120%);
}


    h2 {
        margin: 0 0 12px 0;
        font-size: 18px;
        user-select: none;
    }

    p {
        margin: 0 0 20px 0;
        color: rgba(255, 255, 255, 0.7);
        user-select: none;
         white-space: pre-wrap;
    overflow-wrap: anywhere;
    }

    button {
        width: 100%;
        height: 40px;
        border-radius: 256px;
        border: none;
        background: var(--activecolor);
        color: white;
        font-weight: 500;
        user-select: none;
    }

    button:active {
        scale: 1;
        filter: brightness(30%);
    }

</style>
