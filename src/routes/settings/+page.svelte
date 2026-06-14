<script>
  const { ipcRenderer } = window.require("electron");
  import { goto } from '$app/navigation';
    async function logout() {
        await ipcRenderer.invoke("logout")
        goto('/');
    }

    async function openDataFolder() {
        const result = await ipcRenderer.invoke("open_directory", "NeonLauncherData");
        if (result.error) {
            alert(result.error);
        }
    }

     async function openGithub() {
        await ipcRenderer.invoke(
            "open_url",
            "https://github.com/QuasiChicken90/NeonLauncher"
        );
    }
</script>

<main>
    <div class="ContentArea">
        <div class="CentredContentArea">
            <div class="UhActualArea">
                <button style="color: red;" on:click={logout}>Logout of account</button>
                <button on:click={openGithub}>Open project (github)</button>
                <button on:click={openDataFolder}>Open Data Folder</button>
            </div>
        </div>
    </div>
</main>

<style>
.ContentArea {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* background-color: rgb(53, 52, 54); */
  display: flex;
  justify-content: center;
  align-items: center;
}

.CentredContentArea {
  width: 100%;
  height: 100%;
  /* background-color: rgba(255, 255, 255, 0.11); */
  display: flex;
  justify-content: center;
  align-items: center;

}

.UhActualArea {
  position: relative;
  height: 100%;
  width: 65%;
  left: 50px;
  /* background-color: rgba(255, 255, 255, 0.452); */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 45px;
}

button {
    width: 100%;
    height: 50px;
    background: linear-gradient(135deg, rgba(228, 228, 228, 0.01) 100%, rgba(206, 206, 206, 0.01) 0%);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0px 3.87826px 53.1322px #000000, inset 1.3834px 1.3834px 2.76681px rgba(255, 255, 255, 0.3), inset -1.3834px -1.3834px 2.76681px rgba(87, 87, 87, 0.5);
    backdrop-filter: blur(7.05723px);
    border-radius: 47.5px;
    color:white;
    font-weight: 600;
}

button:active {
    color: black;
    background-color: white;
    border: none;
}
</style>
