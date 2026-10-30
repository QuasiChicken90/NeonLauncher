<template>
  <div class="LoginOverlay">
    <h2>Loading</h2>
  </div>
  <div class="DisableBG"></div>
</template>
<style scoped>
  .LoginOverlay {
    position: absolute;
    width: 405px;
    height: 84px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    justify-content: center;
    align-items: center;
    display: grid;
    backdrop-filter: blur(24px) saturate(150%);
    background: linear-gradient(180deg, color-mix(in srgb, var(--activecolor) 10%, transparent) 52.21%, rgba(0, 0, 0, 0.01) 100%);
    border-width: 1px 0px;
    border-style: solid;
    border-color: color-mix(in srgb, var(--activecolor) 60%, transparent);
    border-radius: 31px;
    user-select: none;
    z-index: 9999;
  }

  .DisableBG {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(65, 28, 114, 0.1);
    backdrop-filter: blur(8px);
    z-index: 500;
  }
</style>