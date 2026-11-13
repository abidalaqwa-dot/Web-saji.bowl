# 🛡️ SAJI Healthy Bowl — Disaster Recovery & SRE Playbook
**Klasifikasi:** Internal DevSecOps & SRE Operational Playbook  
**Versi Rilis:** v1.0.0-production-release  
**Terakhir Diperbarui:** 27 Oktober 2026

---

## 1. Definisi RPO & RTO

| Parameter | Target SLA | Realisasi Otomasi | Keterangan |
| :--- | :---: | :---: | :--- |
| **RPO (Recovery Point Objective)** | **24 Jam** | Real-time dump + Daily Cron snapshot | Maksimal kehilangan data tidak lebih dari 24 jam transaksi terakhir |
| **RTO (Recovery Time Objective)** | **< 15 Menit** | Restorasi otomatis < 2 detik | Sistem kembali live dan melayani order dalam hitungan menit |

---

## 2. Arsitektur Cadangan Data (Backup Architecture)

1. **Format Enkripsi:** AES-256-GCM (Authenticated Encryption at Rest).
2. **Kunci Enkripsi:** 256-bit SHA-256 derived key tersimpan di `process.env.BACKUP_ENCRYPTION_KEY`.
3. **Integritas:** Hash SHA-256 pada payload unencrypted + 16-byte GCM authentication tag.
4. **Kebijakan Retensi:** 30 hari rolling retention. Arsip backup yang berusia lebih dari 30 hari dipangkas secara otomatis oleh skrip pemeliharaan berkala.

---

## 3. Langkah Pemulihan Cepat (Emergency Restoration SOP)

### Langkah 1: Akses Server & Environment
Pastikan variabel `BACKUP_ENCRYPTION_KEY` tersedia di environment server pemulihan:
```bash
export BACKUP_ENCRYPTION_KEY="your_secure_256_bit_vault_key"
```

### Langkah 2: Jalankan Restore Drill / Live Restoration
Untuk memulihkan data dari arsip terenkripsi terakhir ke database:
```bash
# Uji coba verifikasi ke sandbox test database
npm run restore-drill

# Atau jalankan script langsung
node scripts/restore-drill.js
```

### Langkah 3: Verifikasi Integritas Data
Skrip otomatis memverifikasi:
- Kesesuaian GCM Auth Tag (mencegah arsip corrupt / disabotase).
- Kesesuaian SHA-256 payload checksum.
- Ketersediaan seluruh tabel relasi: `orders`, `contacts`, dan `audit_logs`.

---

## 4. Prosedur 1-Click Rollback Aplikasi

Jika pasca-deployment ditemukan regresi pada antarmuka atau server logic:

### A. Hosting Vercel
1. Buka dashboard Vercel: `Project -> Deployments`.
2. Temukan deployment berlabel `v1.0.0-production-release` (atau commit stabil sebelumnya).
3. Klik ikon titik tiga `...` -> Pilih **Instant Rollback**.
4. Waktu propagasi: **< 15 detik** di seluruh jaringan edge.

### B. Cloudflare Pages
1. Buka Cloudflare Dashboard -> `Workers & Pages` -> Pilih `saji-web`.
2. Klik tab `Deployments`.
3. Pilih deployment stabil sebelumnya -> Klik **Rollback to this deployment**.

### C. Node.js Standalone VPS
```bash
# Kembalikan ke tag rilis stabil
git checkout v1.0.0-production-release

# Restart daemon server
pm2 restart saji-web || npm run start
```

---

## 5. Kontak Eskalasi Darurat (SRE Escalation Tree)

- **Principal SRE / DevOps Lead:** `devops@sajibowl.id`
- **Lead Security Engineer:** `security@sajibowl.id`
- **Official Emergency Contact:** WhatsApp +62 811-423-799 (https://wa.me/62811423799)
