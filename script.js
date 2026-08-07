// Ganti dengan URL API kamu
const API_BASE_URL = 'http://localhost:3000'; 

// Fungsi untuk mengambil data statistik
async function fetchBotStats() {
    try {
        // Mengambil data dari endpoint /api/stats yang menyediakan users dan groups
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Memperbarui teks pada elemen dengan animasi sederhana
        document.getElementById('user-count').textContent = data.users.toLocaleString('id-ID') + '+';
        document.getElementById('group-count').textContent = data.groups.toLocaleString('id-ID') + '+';
        
    } catch (error) {
        console.error('Gagal mengambil data API:', error);
        document.getElementById('user-count').textContent = 'N/A';
        document.getElementById('group-count').textContent = 'N/A';
        
        // Mengubah status indikator jika gagal
        const statusIndicator = document.querySelector('.status-indicator');
        statusIndicator.style.color = '#e11d48'; // Warna merah
        statusIndicator.style.backgroundColor = '#ffe4e6';
        statusIndicator.style.borderColor = '#e11d48';
        statusIndicator.innerHTML = '<span class="dot" style="background-color:#e11d48;"></span> API Offline';
    }
}

// Logika untuk Hamburger Menu (Tampilan Mobile)
document.addEventListener('DOMContentLoaded', () => {
    // Ambil data pertama kali
    fetchBotStats();
    
    // Auto-update setiap 30 detik
    setInterval(fetchBotStats, 30000);

    // Toggle menu navigasi di mobile
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Menutup menu saat salah satu link diklik (untuk mobile)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if(window.innerWidth <= 768) {
                navLinks.classList.remove('active');
            }
        });
    });
});
