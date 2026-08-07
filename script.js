// 1. Logika Tab System
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

// 2. Efek Sentuhan/Klik (Ripple)
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

// 3. Animasi Mengetik (Typewriter) pada Chat Bubble
function initTypingEffect() {
    const textElement = document.getElementById('chat-bubble-text');
    if (!textElement) return;

    const messages = [
        "✨ Selamat datang kak",
        "Halo, Perkenalkan Nama Aku Lea",
        "Aku Adalah WhatsApp Bot Pintar Yang Bisa Membantu",
        "Kalau Mau Coba Fitur Atau Berinteraksi Denganku Klik Tombol Di Bawah Ya <3"
    ];

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentMessage = messages[messageIndex];

        // Sedang menghapus
        if (isDeleting) {
            charIndex--;
            textElement.textContent = currentMessage.substring(0, charIndex);
        } 
        
        // Sedang mengetik
        else {
            charIndex++;
            textElement.textContent = currentMessage.substring(0, charIndex);
        }

        // Kecepatan mengetik / menghapus
        let typeSpeed = isDeleting ? 30 : 60;

        // Jika selesai mengetik
        if (!isDeleting && charIndex === currentMessage.length) {

            // Kalau sudah pesan terakhir, berhenti di sini
            if (messageIndex === messages.length - 1) {
                const cursor = document.querySelector('.typing-cursor');

                if (cursor) {
                    cursor.style.animation = 'blinkCursor 1s infinite';
                }

                return;
            }

            // Tunggu sebelum mulai menghapus
            typeSpeed = 1800;
            isDeleting = true;
        }

        // Jika selesai menghapus
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            messageIndex++;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // Mulai animasi setelah 1 detik
    setTimeout(type, 1000);
    }

// 4. Interaksi Karakter Menjadi Lebih Hidup & Dinamis
function initCharacterInteraction() {
    const container = document.getElementById('character-container');
    const heart = document.getElementById('heart-effect');

    if (!container || !heart) return;

    container.addEventListener('click', () => {
        container.classList.add('clicked');
        heart.classList.add('show');

        setTimeout(() => {
            container.classList.remove('clicked');
        }, 300);

        setTimeout(() => {
            heart.classList.remove('show');
        }, 800);
    });
}

// 5. Logika Floating Music Player (Toggle Panel & Play/Pause)
function initMusicPlayer() {
    const audio = document.getElementById('bgm-audio');
    const fabBtn = document.getElementById('music-fab-btn');
    const panel = document.getElementById('music-panel');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const icon = document.getElementById('music-icon');
    const status = document.getElementById('music-status');
    const disc = document.getElementById('music-disc');

    if (!audio || !fabBtn || !panel) return;

    let isPlaying = false;

    fabBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !fabBtn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });

    toggleBtn.addEventListener('click', () => {
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
    initTabs();
    initClickEffect();
    initTypingEffect();
    initCharacterInteraction();
    initMusicPlayer();

    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });
    }
});
