<script>
  const { ipcRenderer } = window.require("electron");
  import { onMount, onDestroy } from "svelte";

  let username = null;
  let uuid = 1;
  let isLoading = false;
  let logs = [];
  let progress = 0;
  let status = '';

  async function loadLoginState() {
    username = await ipcRenderer.invoke("get-username");
    uuid = await ipcRenderer.invoke("get-uuid");
  }

  onMount(() => {
    loadLoginState();

  ipcRenderer.on('launch-progress', (_, { progress: p, size, element }) => {
    progress = Math.round((p / size) * 100);
    status = element ? `Downloading ${element}... ${progress}%` : `Downloading... ${progress}%`;
  });

    ipcRenderer.on('launch-check', (_, { progress: p, size, element }) => {
      status = `${element}...`;
    });

    ipcRenderer.on('launch-data', (_, data) => {
      logs = [...logs, data];
    });

    ipcRenderer.on('launch-error', (_, err) => {
      status = `Error: ${err}`;
      logs = [...logs, '[ERROR] ' + err];
      isLoading = false;
    });

    ipcRenderer.on('launch-started', () => {
  status = 'Game running';
  progress = 0;
  isLoading = false;  
});

    ipcRenderer.on('launch-close', (_, code) => {
      status = code === 0 ? 'Game closed.' : `Game crashed (exit code ${code})`;
      isLoading = false;
    });
  });

  onDestroy(() => {
    ipcRenderer.removeAllListeners('launch-progress');
    ipcRenderer.removeAllListeners('launch-check');
    ipcRenderer.removeAllListeners('launch-data');
    ipcRenderer.removeAllListeners('launch-error');
    ipcRenderer.removeAllListeners('launch-close');
    ipcRenderer.removeAllListeners('launch-started');
  });

  async function handleLogin() {
    if (username || isLoading) return;
    isLoading = true;
    await ipcRenderer.invoke("set-mica", false);
    const result = await ipcRenderer.invoke("login");
    if (!result.error) {
      username = await ipcRenderer.invoke("get-username");
      uuid = await ipcRenderer.invoke("get-uuid");
      await ipcRenderer.invoke("set-mica", true);
      window.location.reload();
    } else {
      console.error("Login failed:", result.error);
      await ipcRenderer.invoke("set-mica", true);
    }
    isLoading = false;
  }

  async function startGame() {
    const version = await ipcRenderer.invoke("readPlayVersion");
    const account = await ipcRenderer.invoke("checkIfAccount");

    if (version === "") {
      await ipcRenderer.invoke("alert", "No Version selected. Select one in library and try again.");
      return;
    }
    if (account === "nologin") {
      await ipcRenderer.invoke("alert", "No logged in or valid account.");
      return;
    }

    status = 'Starting...';
    isLoading = true;
    ipcRenderer.invoke("start");
  }
</script>

<main>
    <div class="UpperNavigation">
      <div class="UpperNavigationDIV">
              <h3 class="UpperNavigationH3" id="username">
        {username ? username : "Sign In ->"}
      </h3>
        <img class="UpperNavigationIMG" onclick={handleLogin} src="https://mc-heads.net/avatar/{uuid}/100" alt="">
      </div>
      
    </div>

    <div class="ContentArea">
        <div class="CentredContentArea">

          
          <div class="UhActualArea">
            <div class="ImageArea">
              <img
  class="ContentAreaAvatarIMG"
  src={`https://nmsr.nickac.dev/fullbody/${uuid || 3}`}
  alt=""
/>      
            </div>

            <div class="StartArea">
                <button class="StartAreaBtn" onclick={startGame}>Play</button>
                
            </div>
            
          </div>
        </div>
    </div>
{#if isLoading}
  <div class="LoadingArea">
    <div class="spinner">
      {#each Array(12) as _, i}
        <div class="blade" style="--i: {i}"></div>
      {/each}
    </div>
    <p class="loading-text">{status || 'Loading...'}</p>
    {#if progress > 0}
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width: {progress}%"></div>
      </div>
    {/if}
  </div>
{/if}
</main>

<style>
.UpperNavigation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 80px;
  position: absolute;
  display: flex;
  justify-content: center;
  z-index: 10000;
  align-items: center;
  /* background-color: red; */
}

.progress-bar-track {
  width: 260px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.2s ease;
}

.UpperNavigationDIV {
  height: 50px;
  width: 98%;
  display: flex;
  justify-content: flex-end;
  gap: 23px;
  /* background-color: blue;  */
  align-items: center;
}

.UpperNavigationIMG {
  width: 50px;
  height: 50px;
  border-radius: 256px;
}

.UpperNavigationIMG:active {
  filter: brightness(40%);
  -webkit-user-drag: none;
}

.UpperNavigationH3 {
  color: white;
}

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
  height: 80%;
  /* background-color: rgba(255, 255, 255, 0.11); */
  display: flex;
  justify-content: center;
  align-items: center;

}

.UhActualArea {
  position: relative;
  height: 100%;
  width: 35%;
  left: 50px;
  /* background-color: rgba(255, 255, 255, 0.452); */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.ImageArea {
  width: 100%;
  height: 50%;
  /* background-color: rgb(58, 58, 58); */
  overflow: hidden;
}

.ContentAreaAvatarIMG {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.StartArea {
  width: 80%;
  height: 10%;
  /* background-color: rgba(214, 214, 214, 0.277); */
}

.StartAreaBtn {
  width: 100%;
  border: none;
  height: 80%;
  background: linear-gradient(135deg, rgba(228, 228, 228, 0.01) 100%, rgba(206, 206, 206, 0.01) 0%);
  box-shadow: 0px 3.87826px 53.1322px #000000, inset 1.3834px 1.3834px 2.76681px rgba(255, 255, 255, 0.3), inset -1.3834px -1.3834px 2.76681px rgba(87, 87, 87, 0.5);
  backdrop-filter: blur(7.05723px);
  border-radius: 47.5px;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
}

.StartAreaBtn:active {
  background-color: #ffffff;
  color: black;
}

.LoadingArea {
  z-index: 10001;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px) saturate(150%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

.blade {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 10px;
  margin-left: -1.5px;
  margin-top: -18px;
  border-radius: 2px;
  background: white;
  transform-origin: center 18px;
  transform: rotate(calc(var(--i) * 30deg));
  animation: fade 1s linear infinite;
  animation-delay: calc((var(--i) - 12) / 12 * 1s);
}

@keyframes fade {
  0%   { opacity: 1; }
  100% { opacity: 0.1; }
}

.loading-text {
  color: rgba(255, 255, 255, 0.719);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  margin: 0;
}

</style>
