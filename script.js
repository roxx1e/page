const API_BASE_URL = 'http://localhost:3000'; 
const SERVER_STATUS_API = 'https://api.leaa.site/server-status';

// 1. Logika Pengambilan Data API Bot & Server
async function fetchBotStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        if (!response.ok) throw new Error(`HTTP error!`);
        const data = await response.json();
        
        const userEl = document.getElementById('user-count');
        const groupEl = document.getElementById('group-count');
        if(userEl) userEl.setAttribute('data-target', data.users || 1500);
        if(groupEl) groupEl.setAttribute('data-target', data.groups || 750);
    } catch (error) {
        console.error('API Error:', error);
        const userEl = document.getElementById('user-count');
        const groupEl = document.getElementById('group-count');
        if(userEl) userEl.setAttribute('data-target', 1840);
        if(groupEl) groupEl.setAttribute('data-target', 920);
    }
}

// Fetch Server Status API
async function fetchServerStatus() {
    try {
        const res = await fetch(SERVER_STATUS_API);
        const json = await res.json();
        
        if (json.success && json.os) {
            const uptimeSec = Math.floor(json.os.uptime);
            document.getElementById('server-uptime').textContent = `${uptimeSec}s`;
            
            const usedMB = Math.round(json.os.usedMemory / (1024 * 1024));
            document.getElementById('server-ram').textContent = `${usedMB} MB`;
        }
    } catch (err) {
        console.error('Server Status API Error:', err);
        document.getElementById('server-uptime').textContent = '44s';
        document.getElementById('server-ram').textContent = '271 MB';
    }
}

// Animasi Angka Menghitung Sendiri (Counter Animation)
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace('+', '');
            const increment = target / 30; 

            if (count < target) {
                counter.innerText = Math.ceil(count + increment) + '+';
                setTimeout(updateCount, 40);
            } else {
                counter.innerText = target.toLocaleString('id-ID') + '+';
            }
        };
        updateCount();
    });
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

            if (targetId === 'stats') {
                initCounterAnimation();
            }

            if (window.innerWidth <= 768) {
                navLinksContainer.classList.remove('active');
            }
        });
    });
}

// 3. Efek Sentuhan/Klik (Ripple)
function initClickEffect() {
    document.addEventListener('click', function(e) {
        const ripple = document.getElementById('click-ripple');
        if (!ripple) return;
        
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

// 4. Animasi Mengetik (Typewriter) pada Chat Bubble
function initTypingEffect() {
    const textElement = document.getElementById('chat-bubble-text');
    if (!textElement) return;

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
                const cursor = document.querySelector('.typing-cursor');
                if(cursor) cursor.style.animation = 'blinkCursor 1s infinite';
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

// 5. Interaksi Karakter Menjadi Lebih Hidup (Klikunculkan Hati & Reaksi)
function initCharacterInteraction() {
    const container = document.getElementById('character-container');
    const heart = document.getElementById('heart-effect');

    if (!container || !heart) return;

    container.addEventListener('click', () => {
        container.classList.add('clicked');
        heart.classList.add('show');

        setTimeout(() => {
            container.classList.remove('clicked');
        }, 200);

        setTimeout(() => {
            heart.classList.remove('show');
        }, 800);
    });
}

// 6. Logika Pemutar Musik (Music Player)
function initMusicPlayer() {
    const audio = document.getElementById('bgm-audio');
    const btn = document.getElementById('music-toggle-btn');
    const icon = document.getElementById('music-icon');
    const status = document.getElementById('music-status');
    const disc = document.getElementById('music-disc');

    if (!audio || !btn) return;

    let isPlaying = false;

    btn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            icon.textContent = '▶';
            status.textContent = 'Musik dijeda ⏸';
            disc.classList.remove('playing');
            isPlaying = false;
        } else {
            audio.play().then(() => {
                icon.textContent = '❚❚';
                status.textContent = 'Sedang diputar 🎶';
                disc.classList.add('playing');
                isPlaying = true;
            }).catch(e => {
                console.log("Audio play error:", e);
                status.textContent = 'Gagal memutar audio ❌';
            });
        }
    });
}

// Inisialisasi Saat Halaman Dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchBotStats();
    fetchServerStatus();
    setInterval(fetchBotStats, 30000); 
    setInterval(fetchServerStatus, 15000);
    
    initTabs();
    initClickEffect();
    initTypingEffect();
    initCounterAnimation();
    initCharacterInteraction();
    initMusicPlayer();

    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });
    }
});
