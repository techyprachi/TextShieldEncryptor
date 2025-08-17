// --- Matrix Background Animation ---
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Using only 0 and 1 for the classic binary look
const alphabet = '01';

const fontSize = 16;
const columns = canvas.width / fontSize;

const rainDrops = [];

for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
}

const drawMatrix = () => {
    // Adjusted opacity for better visibility of foreground content
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0'; // Green text
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
};

setInterval(drawMatrix, 30);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Recalculate columns on resize
    const newColumns = canvas.width / fontSize;
    for (let x = 0; x < newColumns; x++) {
        if (!rainDrops[x]) {
            rainDrops[x] = 1;
        }
    }
});


// DOM element references
const mainTitle = document.getElementById('main-title');
const tagline = document.getElementById('tagline');
const algorithmSelect = document.getElementById('algorithm');
const symmetricKeySection = document.getElementById('symmetric-key-section');
const rsaKeySection = document.getElementById('rsa-key-section');
const symmetricKeyInput = document.getElementById('symmetric-key');
const publicKeyTextarea = document.getElementById('public-key');
const privateKeyTextarea = document.getElementById('private-key');
const plainTextInput = document.getElementById('plain-text');
const cipherTextInput = document.getElementById('cipher-text');
const encryptBtn = document.getElementById('encrypt-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const generateRsaKeysBtn = document.getElementById('generate-rsa-keys');
const messageBox = document.getElementById('message-box');

// --- Animation Logic ---
function typeEffect(element, text, speed, callback) {
    let i = 0;
    element.innerHTML = "";
    element.classList.add('typing-cursor');
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.remove('typing-cursor');
            if (callback) callback();
        }
    }
    type();
}

let processInterval;
function startProcessingAnimation() {
    const frames = ['[ ■□□□□ ]', '[ ■■□□□ ]', '[ ■■■□□ ]', '[ ■■■■□ ]', '[ ■■■■■ ]'];
    let frameIndex = 0;
    cipherTextInput.value = frames[frameIndex];
    processInterval = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        cipherTextInput.value = frames[frameIndex];
    }, 150);
}

function stopProcessingAnimation() {
    clearInterval(processInterval);
}

// --- UI Logic ---
function toggleAlgorithmUI() {
    const selectedAlgorithm = algorithmSelect.value;
    if (selectedAlgorithm === 'rsa') {
        symmetricKeySection.classList.add('hidden');
        rsaKeySection.classList.remove('hidden');
    } else {
        symmetricKeySection.classList.remove('hidden');
        rsaKeySection.classList.add('hidden');
    }
}

function showMessage(message, isError = false) {
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'bg-red-500/80', 'bg-green-500/80');
    messageBox.classList.add(isError ? 'bg-red-500/80' : 'bg-green-500/80');
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 3000);
}

// --- Event Listeners ---
window.onload = () => {
    typeEffect(mainTitle, 'TextShield', 100, () => {
        typeEffect(tagline, 'Locking Your Text, Guarding Your Privacy.', 50);
    });
};

algorithmSelect.addEventListener('change', toggleAlgorithmUI);
generateRsaKeysBtn.addEventListener('click', () => {
    const crypt = new JSEncrypt({ default_key_size: 2048 });
    publicKeyTextarea.value = crypt.getPublicKey();
    privateKeyTextarea.value = crypt.getPrivateKey();
    showMessage('New RSA key pair generated!', false);
});

encryptBtn.addEventListener('click', () => {
    if (!plainTextInput.value) {
        showMessage('ERROR: Input data field is empty.', true);
        return;
    }
    startProcessingAnimation();

    setTimeout(() => {
        stopProcessingAnimation();
        let encryptedText = '';
        try {
            const algorithm = algorithmSelect.value;
            const plainText = plainTextInput.value;
            if (algorithm === 'aes') {
                const key = symmetricKeyInput.value;
                if (!key) { throw new Error('Secret key required for AES.'); }
                encryptedText = CryptoJS.AES.encrypt(plainText, key).toString();
            } else if (algorithm === 'des') {
                const key = symmetricKeyInput.value;
                if (!key) { throw new Error('Secret key required for DES.'); }
                encryptedText = CryptoJS.DES.encrypt(plainText, key).toString();
            } else if (algorithm === 'rsa') {
                const publicKey = publicKeyTextarea.value;
                if (!publicKey) { throw new Error('Public key required for RSA.'); }
                const crypt = new JSEncrypt();
                crypt.setPublicKey(publicKey);
                encryptedText = crypt.encrypt(plainText);
                if (!encryptedText) {
                    throw new Error("RSA encryption failed. Public key format may be invalid.");
                }
            }
            cipherTextInput.value = encryptedText;
            showMessage('Encryption successful!', false);
        } catch (error) {
            console.error("Encryption Error:", error);
            showMessage(`Encryption failed: ${error.message}`, true);
            cipherTextInput.value = '';
        }
    }, 1000);
});

decryptBtn.addEventListener('click', () => {
    if (!plainTextInput.value) {
        showMessage('ERROR: Input data field is empty for decryption.', true);
        return;
    }
    startProcessingAnimation();

    setTimeout(() => {
        stopProcessingAnimation();
        let decryptedText = '';
        try {
            const algorithm = algorithmSelect.value;
            const cipherText = plainTextInput.value;
            if (algorithm === 'aes') {
                const key = symmetricKeyInput.value;
                if (!key) { throw new Error('Secret key required for AES.'); }
                const bytes = CryptoJS.AES.decrypt(cipherText, key);
                decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            } else if (algorithm === 'des') {
                const key = symmetricKeyInput.value;
                if (!key) { throw new Error('Secret key required for DES.'); }
                const bytes = CryptoJS.DES.decrypt(cipherText, key);
                decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            } else if (algorithm === 'rsa') {
                const privateKey = privateKeyTextarea.value;
                if (!privateKey) { throw new Error('Private key required for RSA.'); }
                const crypt = new JSEncrypt();
                crypt.setPrivateKey(privateKey);
                decryptedText = crypt.decrypt(cipherText);
                 if (!decryptedText) {
                    throw new Error("RSA decryption failed. Check private key or ciphertext.");
                }
            }

            if (!decryptedText) {
                throw new Error("Decryption failed. Key is likely incorrect.");
            }
            cipherTextInput.value = decryptedText;
            showMessage('Decryption successful!', false);
        } catch (error) {
            console.error("Decryption Error:", error);
            showMessage(`Decryption failed: ${error.message}`, true);
            cipherTextInput.value = '';
        }
    }, 1000);
});

toggleAlgorithmUI();
