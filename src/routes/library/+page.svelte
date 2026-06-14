<script>
const { ipcRenderer } = window.require("electron");
    let createBoxVisible = false;
    let versions = [];
    let instanceName = "";
  let instanceVersion = "";
  let instancePlatform = "vanilla";
 import { onMount } from "svelte";
import { goto } from '$app/navigation';
  async function loadVersions() {
    const res = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json');
    const data = await res.json();
    versions = data.versions;
  }

  loadVersions();



async function createInstanceConfiguration(iName, Iplat, Iver) {
  await ipcRenderer.invoke(
    "createInstanceConfig",
    iName,
    Iplat,
    Iver
  );
}

async function completeConfig() {
    if (instanceName == "" || instanceVersion == "" || instancePlatform == "") {
        await ipcRenderer.invoke("alert", "Missing name, version or platform.");
        return;
    } else {
        createInstanceConfiguration(instanceName, instanceVersion, instancePlatform);
        window.location.reload();
    }
    
}

async function goToPlay(name) {
    ipcRenderer.invoke("setPlayVersion", String(name.name))
    goto('/');
}

async function getSpecificConfig(name, key) {
    const config = await ipcRenderer.invoke("readconfig", name);
    return config[key];
}

let versionlist = [];
async function getInstalled() {
  const res = await ipcRenderer.invoke("getversionconfigs");

  versionlist = await Promise.all(
    res.dirs.map(async (name) => {
      const config = await ipcRenderer.invoke("readconfig", name);
      return {
        name,
        ver: config.Version ?? "Unknown",
        platf: config.platform ?? "Unknown",
      };
    })
  );
}

onMount(() => {
  getInstalled();
});

let searchQuery = "";
$: filteredList = versionlist.filter(instance =>
    instance.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

</script>

<main>
    <div class="UpperNavigation">
        <div class="UpperNavigationDIV">

            <div class="searchWrapper">
                <i class="fa-solid fa-magnifying-glass searchIcon"></i>
                <input class="inptSearchBox" placeholder="Search Instance Name" type="text" bind:value={searchQuery}>
            </div>
            <button aria-label="Create" class="btnCreate" on:click={() => createBoxVisible = true}>
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
    </div>

    <div class="CreateBox" class:visible={createBoxVisible}>
    <h2 class="hTitle">Create Instance</h2>
    <input class="inptName" bind:value={instanceName} type="text" placeholder="Instance Name" />
    <br><br>

    <input bind:value={instanceVersion} class="inptVersions" list="version-list" placeholder="Select or search version. Click the arrow ->" autocomplete="off" />
    <datalist id="version-list">
        {#each versions as v}
        <option value={v.id}></option>
        {/each}
    </datalist>

    <br><br>
    <select bind:value={instancePlatform} class="inptPlatform">
  <option value="vanilla">Vanilla</option>
  <option value="fabric">Fabric</option>
  <option value="forge">Forge</option>
    </select>
    <br><br>
    <button class="btnCreateInstance" on:click={completeConfig}>Create</button>
    <br><br>
    <button class="btnCloseBox" on:click={() => createBoxVisible = false}>Cancel</button>
    </div>


<div class="ContentArea">
  {#each filteredList as instance (instance.name)}
    <div class="InstanceBox">
      <h3>{instance.name}</h3>
      <h3>{instance.ver}</h3>
      <h3>{instance.platf}</h3>

      <button
        class="btnUseVer"
        id={instance.name}
        on:click={() => goToPlay(instance)}
      >
        Use
      </button>
    </div>
  {/each}
</div>
</main>
<style>

.InstanceBox {
    width: 80%;
    height: 70px;
    flex-shrink: 0;
    background: rgba(47, 47, 47, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 256px;
    box-shadow:
        0px 0px 0px 1px #000000,
        0px 0px 13.3px 1px #000000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 30px;
    backdrop-filter: blur(32px);
}

.InstanceBox h3 {
    margin: 0;
    color: white;
    width: 33%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.InstanceBox h3:first-child {
    text-align: left;
}

.btnUseVer {
    flex-shrink: 0;
    padding-left: 30px;
    padding-right: 30px;
}

.ContentArea {
    width: 100%;
    height: 100%;
    position: absolute;

    display: flex;
    flex-direction: column;
    align-items: center; 

    padding: 100px;
    box-sizing: border-box;
    gap: 15px;

    overflow-y: auto;
    overflow-x: hidden;

    justify-content: flex-start;
}


  *::-webkit-scrollbar {
    width: 6px;
  }

  *::-webkit-scrollbar-track {
    background: none;
  }

  *::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.582);
    border-radius: 10px;
  }

.CreateBox {
    width: clamp(320px, 30vw, 480px);
    height: calc(100vh - 48px);
    background: rgba(47, 47, 47, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0px 0px 0px 1px #000000;
    backdrop-filter: blur(32px);
    border-radius: 48px;
    corner-shape: squircle;
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 99999;
    box-sizing: border-box;
    padding: 24px;
        transform: translateX(calc(100% + 40px));
    opacity: 0;
    transition:
      transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: none;
    filter: blur(128px);
}

.CreateBox.visible {
    transform: translateX(0);
    opacity: 1;
    pointer-events: all;
    filter: blur(0px)
}


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
    }
    .UpperNavigationDIV {
        height: 50px;
        width: 98%;
        display: flex;
        justify-content: flex-end;
        gap: 23px;
        align-items: center;
    }
    .searchWrapper {
        position: relative;
        display: flex;
        align-items: center;
        height: 45px;
    }
    .searchIcon {
        position: absolute;
        left: 14px;
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 1);
        pointer-events: none;
        z-index: 1;
        padding-right: 0;
        width: auto;
        flex-shrink: unset;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    button {
        height: 45px;
        padding-left: 10px;
        padding-right: 10px;
        background: linear-gradient(135deg, rgba(228, 228, 228, 0.01) 100%, rgba(206, 206, 206, 0.01) 0%);
        border: none;
        box-shadow: 0px 3.87826px 53.1322px #000000, inset 1.3834px 1.3834px 2.76681px rgba(255, 255, 255, 0.3), inset -1.3834px -1.3834px 2.76681px rgba(87, 87, 87, 0.5);
        backdrop-filter: blur(7.05723px);
        border-radius: 47.5px;
        color: white;
        font-weight: 600;
    }
    button:active {
        color: black;
        background-color: white;
    }
    i {
        padding-right: 0px;
        font-size: 1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        flex-shrink: 0;
    }
    .inptSearchBox {
        height: 45px;
        padding-left: 60px;
        padding-right: 40px;
        background: linear-gradient(135deg, rgba(228, 228, 228, 0.01) 100%, rgba(206, 206, 206, 0.01) 0%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0px 3.87826px 53.1322px 
#000000, inset 1.3834px 1.3834px 2.76681px rgba(255, 255, 255, 0.3), inset -1.3834px -1.3834px 2.76681px rgba(87, 87, 87, 0.5);
        backdrop-filter: blur(3px) saturate(150%);
        border-radius: 47.5px;
        color: white;
        font-weight: 600;
        box-sizing: border-box;
        outline: none;
        
    }
    .inptSearchBox::placeholder {
        color: rgba(255, 255, 255, 1);
        font-weight: 400;
    }
    .inptSearchBox:focus {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);

    }
    .inptSearchBox:active {
    filter: brightness(40%)
    }

    .hTitle {
        color: white;
    }

    .btnCreateInstance {
        width: 100%;
        font-weight: 800;
    }

    .btnCloseBox {
        width: 100%;
        color: rgba(255, 61, 61, 0.589);
        font-weight: 800;
    }

    .inptName {
        width: 100%;
        height: 40px;
        border: none;
        color: white;
        background: linear-gradient(135deg, rgba(228, 228, 228, 0.01) 100%, rgba(206, 206, 206, 0.01) 0%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0px 3.87826px 53.1322px #000000, inset 1.3834px 1.3834px 2.76681px rgba(255, 255, 255, 0.3), inset -1.3834px -1.3834px 2.76681px rgba(87, 87, 87, 0.5);
        backdrop-filter: blur(7.05723px);
        border-radius: 256px;
        padding: 8px 12px;
        box-sizing: border-box;
    }

    .inptName:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);
    }

    .inptName::placeholder {
        color: rgba(255, 255, 255, 0.6);
        font-weight: 400;
    }

        .inptVersions::placeholder {
        color: rgba(255, 255, 255, 0.6);
        font-weight: 400;
    }

    .inptVersions{
        width: 100%;
        height: 40px;
        border: none;
        color: white;
        background: linear-gradient(135deg, rgba(228, 228, 228, 0.01) 100%, rgba(206, 206, 206, 0.01) 0%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0px 3.87826px 53.1322px #000000, inset 1.3834px 1.3834px 2.76681px rgba(255, 255, 255, 0.3), inset -1.3834px -1.3834px 2.76681px rgba(87, 87, 87, 0.5);
        backdrop-filter: blur(7.05723px);
        border-radius: 256px;
                padding: 8px 12px;
        box-sizing: border-box;
        
    }

    .inptVersions:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);
    }

        .inptPlatform{
        width: 100%;
        height: 40px;
        border: none;
        color: white;
        background: linear-gradient(135deg, rgba(228, 228, 228, 0.01) 100%, rgba(206, 206, 206, 0.01) 0%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0px 3.87826px 53.1322px #000000, inset 1.3834px 1.3834px 2.76681px rgba(255, 255, 255, 0.3), inset -1.3834px -1.3834px 2.76681px rgba(87, 87, 87, 0.5);
        backdrop-filter: blur(7.05723px);
        border-radius: 256px;
                padding: 8px 12px;
        box-sizing: border-box;
    }

    .inptPlatform:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);
    }

    option {
        background-color: #1e1e1e;
    }
</style>
