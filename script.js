const API_BASE_URL = 'http://localhost:3000'; 

// 1. Logika Pengambilan Data API
async function fetchBotStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        if (!response.ok) throw new Error(`HTTP error!`);
        const data = await response.json();
        
        // Memperbarui UI dari data api.js
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

            // Hapus kelas active dari semua
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Tambahkan kelas active ke yang di klik
            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            // Tutup menu hamburger jika di mobile
            if (window.innerWidth <= 768) {
                navLinksContainer.classList.remove('active');
            }
        });
    });
}

// 3. Efek Bintang (Kawaii Background)
function createStars() {
    const container = document.getElementById('stars-container');
    const starCount = 30; // Jumlah bintang
    const characters = ['✦', '✧', '★', '☆'];

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.innerText = characters[Math.floor(Math.random() * characters.length)];
        
        // Posisi Acak
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        
        // Ukuran dan Durasi Kelap-kelip Acak
        star.style.fontSize = `${Math.random() * 1.5 + 0.5}rem`;
        star.style.animationDuration = `${Math.random() * 2 + 1}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        
        container.appendChild(star);
    }
}

// 4. Efek Sentuhan/Klik (Ripple)
function initClickEffect() {
    document.addEventListener('click', function(e) {
        const ripple = document.getElementById('click-ripple');
        // Reset animasi
        ripple.classList.remove('animate');
        
        // Atur posisi dan ukuran
        const size = 50; // Ukuran efek
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - size/2}px`;
        ripple.style.top = `${e.clientY - size/2}px`;
        
        // Paksa reflow dan jalankan animasi
        void ripple.offsetWidth; 
        ripple.classList.add('animate');
    });
}

// Inisialisasi Semua Fungsi Saat Halaman Dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchBotStats();
    setInterval(fetchBotStats, 30000); 
    
    initTabs();
    createStars();
    initClickEffect();

    // Hamburger Menu Toggle
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('active');
    });
});
