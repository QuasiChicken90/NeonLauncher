<template>
  <div class="UpdatingOverlay">
    <h2>Installing new update...</h2>
  </div>
  <div class="DisableBG"></div>
</template>
<style scoped>
  .UpdatingOverlay {
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
    background: linear-gradient(180deg, rgba(43, 43, 43, 0.5) 52.21%, rgba(0, 22, 53, 0.1) 100%);
    border-width: 1px 0px;
    border-style: solid;
    border-color: #434FA4;
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
