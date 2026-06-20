<script>
  export const prerender = true;
  export const ssr = false;
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  $: currentTab = $page.url.pathname.replace('/', '') || 'Home';


  function showAnnouncement() {
    const overlay = document.getElementById('announcementOverlay');
    console.log('showAnnouncement, overlay found:', overlay);
    if (overlay) overlay.classList.add('show');
  }

function closeAnnouncement() {
  const pane = document.getElementById('announcementPane');
  const overlay = document.getElementById('announcementOverlay');
  if (!pane || !overlay) return;

  localStorage.setItem('announcementSeen0002', 'true');

  pane.classList.add('fadeOut');
  overlay.classList.add('fadeOut');

  setTimeout(() => {
    overlay.classList.remove('show', 'fadeOut');
    pane.classList.remove('fadeOut');
    overlay.style.display = 'none';
  }, 800);
}

onMount(() => {
  if (!localStorage.getItem('announcementSeen0002')) {
    showAnnouncement();
  }
});


</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
</svelte:head>

<main>
  <div class="UpperNavigationDepthEffect"></div>
  <div class="NavBar">
    <div class="NavBarList">
      <button on:click={() => goto('/')} class:selected={currentTab === 'Home'} style="--i:0">
        <i class="fa-solid fa-house"></i>
      </button>
      <button on:click={() => goto('/library')} class:selected={currentTab === 'library'} style="--i:1">
        <i class="fa-solid fa-bars"></i>
      </button>
      <button on:click={() => goto('/explore')} class:selected={currentTab === 'explore'} style="--i:2">
        <i class="fa-solid fa-compass"></i>
      </button>
      <button on:click={() => goto('/stats')} class:selected={currentTab === 'stats'} style="--i:3">
        <i class="fa-solid fa-chart-bar"></i>
      </button>
      <button on:click={() => goto('/profile')} class:selected={currentTab === 'profile'} style="--i:4">
        <i class="fa-solid fa-user"></i>
      </button>
      <button on:click={() => goto('/settings')} class:selected={currentTab === 'settings'} style="--i:5">
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>
  </div>

  <slot />
  <div class="BGBlur"></div>

  <div class="announcement-overlay" id="announcementOverlay">
    <div class="announcement-container" id="announcementPane">
      <h1>Whats New [Beta 2]</h1>

      <div class="feature-item">
        <div class="feature-text">New background wallpaper</div>
      </div>

      <div class="feature-item">
        <div class="feature-text">Quilt support</div>
      </div>

      <div class="feature-item">
        <div class="feature-text">Launcher updating system</div>
      </div>

      <div class="feature-item">
        <div class="feature-text">Other minor improvements</div>
      </div>


      <div class="feature-item">
        <div class="feature-text">Check the github page in settings to see more project information and updates.</div>
      </div>

      <button class="announcement-continue-btn" on:click={() => closeAnnouncement()}>Got it</button>
    </div>
  </div>
</main>

<style>
  .announcement-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0);
    z-index: 10000;
    display: none;
    align-items: center;
    justify-content: center;
  }

  .announcement-container {
    background: #1c1c1e;
    border-radius: 20px;
    padding: 32px 28px;
    width: 340px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    transform: translateY(100px);
    filter: blur(15px);
    opacity: 0;
    border: 2px solid black;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgb(53, 53, 53);
  }

  :global(.announcement-overlay.show) {
    display: flex;
    animation: fadeInOverlay 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }


  :global(.announcement-overlay.fadeOut) {
    animation: fadeOutOverlay 0.8s cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  :global(.announcement-overlay.show .announcement-container) {
    animation: slideUpBlur 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  :global(.announcement-container.fadeOut) {
    animation: slideDownBlur 0.8s cubic-bezier(0.4, 0, 0.6, 1) forwards !important;
  }
  .feature-text {
    color: white;
  }

  .announcement-container h1 {
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 24px 0;
    opacity: 1;
    animation: none;
  }

  .announcement-continue-btn {
    width: 100%;
    background: #007AFF;
    color: #ffffff;
    border: none;
    padding: 16px;
    border-radius: 256px;
    font-size: 17px;
    font-weight: 600;
    margin-top: 20px;
    transition: background 0.2s ease;
  }

  .announcement-continue-btn:active {
    background: #002e77 !important;
    filter: brightness(100%) !important;
    transition: 0.0s !important;
  }

  :global(body) {
    margin: 0;
    background-image: url('/globalBG.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    font-family: 'Inter', sans-serif;
    user-select: none;
    -webkit-user-drag: none;
  }

  .BGBlur {
    width: 100vw;
    height: 100vh;
    position: fixed;
    background-color: rgba(255, 255, 255, 0.1);
    top: 0;
    left: 0;
    backdrop-filter: blur(15px);
    z-index: -1;
  }

  @keyframes navSlideIn {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(-32px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }

  @keyframes buttonFadeIn {
    from {
      opacity: 0;
      transform: translateX(-14px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInOverlay {
    0% {
      background: rgba(0, 0, 0, 0);
    }
    100% {
      background: rgba(0, 0, 0, 0.7);
    }
  }

  @keyframes fadeOutOverlay {
    0% {
      background: rgba(0, 0, 0, 0.7);
    }
    100% {
      background: rgba(0, 0, 0, 0);
    }
  }

  @keyframes slideUpBlur {
    0% {
      transform: translateY(100px);
      filter: blur(15px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      filter: blur(0px);
      opacity: 1;
    }
  }

  @keyframes slideDownBlur {
    0% {
      transform: translateY(0);
      filter: blur(0px);
      opacity: 1;
    }
    100% {
      transform: translateY(150vh);
      filter: blur(15px);
      opacity: 1;
    }
  }

  i {
    padding-right: 0;
    font-size: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    flex-shrink: 0;
  }

  main {
    min-height: 100vh;
    padding-left: 0;
  }

  .NavBar {
    width: 80px;
    border-radius: 56px;
    position: fixed;
    z-index: 10001;
    background: rgba(20, 20, 20, 0.6);
    box-shadow: 0px 4px 62px #000000,
                inset 1.6px 1.6px 3.2px rgba(255, 255, 255, 0.15),
                inset -1.6px -1.6px 3.2px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(14px);
    top: 50%;
    transform: translateY(-50%);
    left: 24px;
    right: unset;
    animation: navSlideIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .NavBarList {
    width: 58px;
    position: static;
    transform: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 0;
    margin: 0 auto;
  }

  .NavBarList button {
    width: 58px;
    height: 58px;
    border-radius: 128px;
    border: 0;
    background-color: transparent;
    color: rgba(255, 255, 255, 0.5);
    font-size: large;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    animation: buttonFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    animation-delay: calc(0.1s + var(--i) * 0.07s);
  }

  .NavBarList button:active {
    filter: brightness(45%);
  }

  .selected {
    background-color: rgba(255, 255, 255, 0.15) !important;
    color: white !important;
  }

  .UpperNavigationDepthEffect {
    height: 80px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    background: linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0) 100%);
    z-index: 9998;
  }
</style>
