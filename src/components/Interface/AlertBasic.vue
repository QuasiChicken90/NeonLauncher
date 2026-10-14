<script setup>
defineProps({
    title: String,
    description: String
})
const emit = defineEmits(['close'])
</script>

<template>
    <div class="AlertBasic">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <br>
        <button @click="emit('close')">Ok</button>
    </div>
</template>

<style lang="css" scoped>
    .AlertBasic {

box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

display: flex;
flex-direction: column;
align-items: flex-start;
padding: 29px 26px 25px 27px;
gap: 1px;

max-width: calc(100vw - 40px);
height: auto;

background: linear-gradient(180deg, rgba(43, 43, 43, 0.5) 52.21%, rgba(18, 29, 45, 0.5) 100%);
box-shadow: 0px 0px 0px 1px #000000;
backdrop-filter: blur(12px) saturate(150%);
border-radius: 33px;
z-index: 10000;
transition:
    transform 300ms cubic-bezier(.34, 1.56, .64, 1),
    filter 150ms ease;
    
    }

    .AlertBasic:hover {
        transform: translate(-50%, -50%) scale(1.050);
        
    }

    .AlertBasic:active {
        transform: translate(-50%, -50%) scale(1.0);
        filter: blur(2px) saturate(150%);
    }

    h1 {
        color: white;
        margin: 0;
        font-size: medium;
        font-weight: 900;
    }
    p {
        color: white;
        overflow-wrap: break-word;
    white-space: normal;
    }

    button {
        height: 48px;
        width: 100%;
        background: #4693FF;
        border: none;
        border-radius: 256px;
        font-weight: 700;
        color: white;

    }

button:active {
    opacity: 25%;
}

</style>
