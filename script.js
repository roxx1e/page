// Ganti URL ini dengan URL tempat API kamu di-host.
// Jika di localhost, biarkan seperti ini. Jika sudah di-hosting, gunakan URL domain/IP publik.
const API_BASE_URL = 'http://localhost:3000'; 

async function fetchBotStats() {
    try {
        // Mengambil data dari endpoint /api/stats
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Memperbarui tampilan di HTML
        // API mengembalikan data { users: number, groups: number, settings: object, timestamp: string }
        document.getElementById('user-count').textContent = data.users.toLocaleString('id-ID');
        document.getElementById('group-count').textContent = data.groups.toLocaleString('id-ID');
        
    } catch (error) {
        console.error('Gagal mengambil data API:', error);
        document.getElementById('user-count').textContent = 'Error';
        document.getElementById('group-count').textContent = 'Error';
        
        // Opsional: Ubah indikator status menjadi merah jika API mati
        document.querySelector('.status-badge').style.color = '#ef4444'; // Red
        document.querySelector('.status-badge').style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        document.querySelector('.indicator').style.backgroundColor = '#ef4444';
        document.querySelector('.indicator').style.boxShadow = '0 0 8px #ef4444';
        document.querySelector('.status-badge').innerHTML = '<span class="indicator"></span> API Offline';
    }
}

// Jalankan fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchBotStats();
    
    // Perbarui data secara real-time setiap 30 detik
    setInterval(fetchBotStats, 30000);
});
