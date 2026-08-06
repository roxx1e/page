// Function to switch tabs programmatically
function switchTab(targetId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const targetBtn = document.querySelector(`.tab-btn[data-target="${targetId}"]`);
    const targetPage = document.getElementById(targetId);

    if (targetBtn && targetPage) {
        targetBtn.classList.add('active');
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Tab navigation event listener
document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
        const target = b.getAttribute('data-target');
        switchTab(target);

        const navbar = document.getElementById('navbar');
        if (navbar.classList.contains('show')) {
            navbar.classList.remove('show');
        }
    });
});

// Mobile menu toggle button
const menuBtn = document.getElementById('menuBtn');
const navbar = document.getElementById('navbar');
if (menuBtn && navbar) {
    menuBtn.addEventListener('click', () => {
        navbar.classList.toggle('show');
    });
}

// Automatic Rotating Character Dialogues Every 2 Seconds
const characterBubble = document.getElementById('characterBubble');

const greetings = [
    "✨ Welcome to Lenathea!",
    "🚀 Ready to use our platform?",
    "💙 Have a wonderful day!",
    "⚡ Fast, Secure & Free API!",
    "🤖 Check our WhatsApp Bot!"
];

let currentIndex = 0;

function updateDialogue() {
    if (characterBubble) {
        characterBubble.textContent = greetings[currentIndex];
        currentIndex = (currentIndex + 1) % greetings.length;
    }
}

// Change dialogue every 2 seconds automatically
setInterval(updateDialogue, 2000);
