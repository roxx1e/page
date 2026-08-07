const API_BASE_URL = 'http://localhost:3000'; 

// 1. Logika Pengambilan Data API
async function fetchBotStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        if (!response.ok) throw new Error(`HTTP error!`);
        const data = await response.json();
        
        // Memperbarui UI dari data api.js[cite: 2]
        document.getElementById('user-count').textContent = data.users.toLocaleString('id-ID') + '+';
        document.getElementById('group-count').textContent = data.groups.toLocaleString('id-ID') + '+';
    } catch (error) {
        console.error('API Error:', error);
        document.getElementById('user-count').textContent = 'N/A';
        document.getElementById('group-count').textContent = 'N/A';
        
        const indicator = document.querySelector('.status-indicator');
        if (indicator) {
            indicator.style.color = '#ff4757';
            indicator.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
            indicator.style.borderColor = '#ff4757';
            indicator.innerHTML = '<span class="dot" style="background-color:#ff4757;"></span> API Offline';
        }
    }
}

// 2. Logika Tab System
function initTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const navLinksContainer = document.getElementById('nav-links');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            if (window.innerWidth <= 768) {
                navLinksContainer.classList.remove('active');
            }
        });
    });
}

// 3. Efek Bintang (Kawaii Background)

// 4. Efek Sentuhan/Klik (Ripple)
function initClickEffect() {
    document.addEventListener('click', function(e) {
        const ripple = document.getElementById('click-ripple');
        ripple.classList.remove('animate');
        
        const size = 50;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - size/2}px`;
        ripple.style.top = `${e.clientY - size/2}px`;
        
        void ripple.offsetWidth; 
        ripple.classList.add('animate');
    });
}

// 5. Animasi Mengetik (Typewriter) pada Chat Bubble dengan Auto-Resizing
function initTypingEffect() {
    const textElement = document.getElementById('chat-bubble-text');
    const messages = [
        "✨ Selamat datang di web Lea!",
        "Halo, Aku Lea! 👋 Asisten WhatsApp pintar yang siap membantu mengelola grup dan membalas pesanmu secara otomatis!"
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentMessage = messages[messageIndex];
        
        if (isDeleting) {
            textElement.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 30 : 60;

        if (!isDeleting && charIndex === currentMessage.length) {
            if (messageIndex === 0) {
                typeSpeed = 2000;
                isDeleting = true;
            } else {
                document.querySelector('.typing-cursor').style.animation = 'blinkCursor 1s infinite';
                return; 
            }
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            messageIndex++;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    setTimeout(type, 1000);
}

// Inisialisasi Saat Halaman Dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchBotStats();
    setInterval(fetchBotStats, 30000); 
    
    initTabs();
    createStars();
    initClickEffect();
    initTypingEffect();

    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('active');
    });
});
