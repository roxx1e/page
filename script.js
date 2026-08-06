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
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        switchTab(target);

        // Hide mobile menu if open
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

// Interactive Character Bubble Greeting Messages
const character = document.getElementById('character');
const characterBubble = document.getElementById('characterBubble');

const greetings = [
    "✨ Welcome to Lenathea!",
    "🚀 Ready to use our API?",
    "💙 Have a great day!",
    "🤖 Check out our WhatsApp Bot!",
    "⚡ Powered & Fast!"
];

if (character && characterBubble) {
    character.addEventListener('click', () => {
        const randomMsg = greetings[Math.floor(Math.random() * greetings.length)];
        characterBubble.textContent = randomMsg;
        characterBubble.classList.add('show');

        setTimeout(() => {
            characterBubble.classList.remove('show');
        }, 2500);
    });
                         }
