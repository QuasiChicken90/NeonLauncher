<template> 

    <div class="Map">
        <h1 style="color: white; font-weight: 1">Coming Soon</h1>
    </div>
    
</template>

<style scoped>

.Map {
    width: calc(100% - 69px - 16px - 16px - 32px);
    height: 95%;

    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);

    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 26px;
    backdrop-filter: blur(24px) saturate(2);

    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
