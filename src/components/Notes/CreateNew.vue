
<script setup>
import { ref } from 'vue'
import AlertBasic from '../Interface/AlertBasic.vue'

const emit = defineEmits(['close', 'created'])

const title = ref('')
const text = ref('')

const closing = ref(false)

const showAlert = ref(false)
const alertTitle = ref('')
const alertDescription = ref('')

function cancel() {
    closing.value = true

    setTimeout(() => {
        emit('close')
    }, 175)
}

function createNote() {
    if (!title.value.trim()) {
        alertTitle.value = 'Missing Title'
        alertDescription.value = 'Please enter a title for your note.'
        showAlert.value = true
        return
    }

    if (!text.value.trim()) {
        alertTitle.value = 'Missing Text'
        alertDescription.value = 'Please enter some text for your note.'
        showAlert.value = true
        return
    }

    emit('created', {
        title: title.value.trim(),
        text: text.value.trim()
    })

    cancel()
}
</script>

<template>
    <div>
        <div class="bg"></div>

        <div class="CreateNote" :class="{ closing }">
            <h2>Create Note</h2>

            <p>Title</p>
            <input
                placeholder="Name this note"
                type="text"
                v-model="title"
            />

            <p>Text</p>
            <textarea
                placeholder="Write something..."
                v-model="text"
            ></textarea>

            <div class="Options">
                <button @click="cancel" style="color: red;">
                    Cancel
                </button>

                <button @click="createNote">
                    Create
                </button>
            </div>
        </div>

        <AlertBasic
            v-if="showAlert"
            :title="alertTitle"
            :description="alertDescription"
            @close="showAlert = false"
        />
    </div>
</template>

<style scoped>
* {
    user-select: none;
    -webkit-user-drag: none;
}

.CreateNote {
    position: absolute;
    width: 600px;
    height: auto;
    background: rgba(0, 0, 0, 0.3);
    box-shadow: 0px 0px 0px 1px #000000;
    backdrop-filter: blur(14px) saturate(150%);
    top: 0;
    left: 50%;
    transform: translate(-50%, 0%);
    border-radius: 0px 0px 24px 24px;
    z-index: 2500;
    padding: 20px;
    box-sizing: border-box;
    animation: slideDown 175ms linear;
}

@keyframes slideDown {
    from {
        transform: translate(-50%, -100%);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0%);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translate(-50%, 0%);
        opacity: 1;
    }

    to {
        transform: translate(-50%, -100%);
        opacity: 0;
    }
}

.CreateNote.closing {
    animation: slideUp 175ms linear;
}

h2 {
    margin: 0 0 24px;
}

p {
    color: rgba(255, 255, 255, 0.836);
    text-align: left;
    font-size: 17px;
    font-weight: 600;
    margin: 4px 0 14px;
}

input,
textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0px 4px 11.3px 2px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    color: white;
    font-size: 16px;
    box-sizing: border-box;
    padding: 10px 15px;
    margin-bottom: 20px;
    font-family: inherit;
}

input {
    height: 45px;
    border-radius: 256px;
}

textarea {
    min-height: 180px;
    resize: vertical;
    line-height: 1.5;
}

input:focus,
textarea:focus {
    outline: none;
    outline: var(--activecolor) 4px solid;
    border-bottom-color: transparent;
}

input::placeholder,
textarea::placeholder {
    color: white;
    opacity: 0.8;
}

.Options {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
}

.Options button {
    background-color: transparent;
    border: none;
    color: white;
    font-weight: 700;
    font-size: 16px;
}

.Options button:active {
    filter: brightness(40%);
}

.bg {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    z-index: 999;
}
</style>
