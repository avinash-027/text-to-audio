// SPEECH SYNTHESIS: Web Speech API

// Init SpeechSynthAPI
const synth = speechSynthesis;

const html = document.querySelector('html');
const Waveform = document.querySelector('#waveform');
const form0 = document.getElementsByTagName("form")[0];
const form1 = document.getElementsByTagName("form")[1];
const textInput = document.querySelector("#text-input");
const voiceSelect = document.querySelector("#voice-select");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector("#rate-value");
const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector("#pitch-value");
const stopAudio = document.querySelector(".stop-audio");
const theme = document.querySelector('#theme');
const alertContainer = document.querySelector("#alert-container");
const readingTextContainer = document.querySelector("#reading-text-container");
const readingText = document.querySelector("#reading-text");

function showAlert(message, type = 'success') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    alertContainer.appendChild(wrapper);
    // Optional: Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(wrapper.querySelector('.alert'));
        alert.close();
    }, 2000);
}

// VOICES LIST
let voices = [];
const fillVoices = () => {
    voices = synth.getVoices();
    voiceSelect.innerHTML = ''; // Clear existing options

    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.setAttribute("data-lang", voice.lang);
        option.setAttribute("data-name", voice.name);
        voiceSelect.appendChild(option);
    });
};

// Initialize voices on page load and when voices change
fillVoices();
synth.onvoiceschanged = fillVoices;

// SPEAK / PLAY
const speak = () => {
    if (synth.speaking) {
        showAlert('Already speaking...', 'info');
        return;
    }

    if (textInput.value.trim() !== '') {
        Waveform.style.display = "block";
        readingTextContainer.style.display = "block";
        stopAudio.style.display = "block";
        readingText.innerHTML = `<div class="spinner-border text-body-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
            </div>`;

        const speakText = new SpeechSynthesisUtterance(textInput.value);

        // Split the input text into lines or paragraphs (based on your preference)
        const paragraphs = textInput.value.trim().split(/\n+/); // Splits by newlines (for paragraphs)
        readingText.textContent = "Reading...";

        // Update the current paragraph/line during speech progress
        speakText.onboundary = (event) => {
            const boundaryIndex = event.charIndex;

            // Find which paragraph or line is being spoken based on charIndex
            let currentParagraphIndex = paragraphs.findIndex((paragraph, index) => {
                const startIndex = paragraphs.slice(0, index).join('\n').length; // Total length of previous paragraphs
                const endIndex = startIndex + paragraph.length;
                return boundaryIndex >= startIndex && boundaryIndex < endIndex;
            });
            // readingText.innerHTML = '';
            // Update the displayed paragraph/line in the container
            readingText.textContent = paragraphs[currentParagraphIndex] || "Reading...";
        };

        // After SpeechEnd
        speakText.onend = () => {
            showAlert('Speech has finished successfully.', 'success');
            Waveform.style.display = "none";
            stopAudio.style.display = "none";
            readingTextContainer.style.display = "none";
            pitch.disabled = false;
            rate.disabled = false;
        };

        // On SpeechError
        speakText.onerror = (event) => {
            if (event.error !== "interrupted")
                console.error("Speech Synthesis error: ", event.error);
        };

        // SELECTED Voice
        const selectedVoice = voiceSelect.selectedOptions[0].getAttribute('data-name');
        voices.forEach(voice => {
            if (voice.name === selectedVoice) {
                speakText.voice = voice;
            }
        });

        // SET pitch and rate
        speakText.rate = rate.value;
        speakText.pitch = pitch.value;
        pitch.disabled = true;
        rate.disabled = true;  // disables the rate input control

        // SPEAK
        synth.speak(speakText);
    } else {
        showAlert('Please enter some text to speak.', 'warning');
    }
};

// AUDIO START BTN
form0.addEventListener('submit', e => {
    e.preventDefault();
    speak();
    textInput.blur();
});

// Rate Value CHANGE
rate.addEventListener('input', () => rateValue.textContent = `${rate.value} x`);

// Pitch Value CHANGE
pitch.addEventListener('input', () => pitchValue.textContent = `${pitch.value} Hz`);

// Voice Select CHANGE
voiceSelect.addEventListener('change', () => {
    // Just cancel current speech — don't auto-play
    if (synth.speaking) {
        synth.cancel();
        Waveform.style.display = "none";
        stopAudio.style.display = "none";
        readingTextContainer.style.display = "none";
        showAlert('Speech stopped. Voice changed. Press play.', 'info');
    }
});

// STOP
stopAudio.addEventListener('click', () => {
    synth.cancel();
    Waveform.style.display = "none";
    stopAudio.style.display = "none";
    readingTextContainer.style.display = "none";
});
window.addEventListener("beforeunload", () => {
    if (synth.speaking) {
        synth.cancel();
        Waveform.style.display = "none";
        stopAudio.style.display = "none";
        readingTextContainer.style.display = "none";
    }
})

// THEME
document.querySelectorAll('#theme .dropdown-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        html.setAttribute("data-bs-core", theme);
    });
});

// MODE
document.querySelector("#light-dark-mode")
    .addEventListener("click", () => {
        html.getAttribute("data-bs-theme") === "dark"
            ? html.setAttribute("data-bs-theme", "light")
            : html.setAttribute("data-bs-theme", "dark");
    });
