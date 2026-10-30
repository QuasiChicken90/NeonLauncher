<script setup>
import { ref } from 'vue'
import CreateNew from './CreateNew.vue'

const emit = defineEmits(['created'])
const createNewDisplay = ref(false)
</script>

<template>
    <CreateNew
        v-if="createNewDisplay"
        @close="createNewDisplay = false"
        @created="emit('created')"
    />

    <div class="Toolbar">
        <div class="search">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" placeholder="Search..." />
</div>
        <button @click="createNewDisplay = true">
            <i class="fa-solid fa-plus"></i>
            Create
        </button>
        
    </div>
</template>

<style scoped>
    .Toolbar {
        position: absolute;
        top: 0px;
        width: 100%;
      
    height: 50px;
    background: rgba(217, 217, 217, 0.01);
    border-bottom: 2px solid #000000;
    backdrop-filter: blur(12px) saturate(120%);
        z-index: 256;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        box-sizing: border-box;
        padding-right: 20px;
    }

    h2 {
        font-weight: 800;
        user-select: none;
        -webkit-user-drag: none;
    }

    .Toolbar button {
padding-left: 16px;
padding-right: 16px;
height: 40px;

background: transparent;
border-radius: 21.5px;
color: white;
font-size: 16px;
font-weight: 700;
border: none;
    }

    .Toolbar button:active {
        opacity: 45%;
    }

    i {
        color: white;
        font-size: 16px;
        margin-right: 4px;
    }

.search i {
    margin-left: 14px;
    color: rgba(255, 255, 255, 0.6);
}

.search {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    width: 40%;
    height: 35px;

    display: flex;
    align-items: center;

    background: rgba(255, 255, 255, 0.1);
    border-radius: 14px;
}

.search {
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0px 4px 11.3px 2px rgba(0, 0, 0, 0.1);
}

.search i {
    margin-left: 14px;
    color: white;
}

.search input {
    flex: 1;
    height: 100%;
    border: none;

    outline: none;
    background: transparent;
    color: white;
    padding-left: 10px;
     
}

.search input::placeholder {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    font-family: 'Inter';
}

    .search input:active {
        filter: brightness(80%);
    }

.search:focus-within {
    outline: 3px solid var(--activecolor);
}

</style>