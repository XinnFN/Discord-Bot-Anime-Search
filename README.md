# Discord Anime Bot 🎌

Bot Discord untuk mencari dan melihat informasi anime menggunakan API Jikan (MyAnimeList). Bot ini memiliki fitur pencarian anime, filter berdasarkan type (TV, Movie, OVA, etc.), dan sistem pagination.

## ✨ Fitur

- **🔍 Search Anime**: Cari anime berdasarkan judul
- **📊 Top Anime**: Lihat daftar top anime berdasarkan score
- **🎭 Genre**: Cari anime berdasarkan genre (18 genre tersedia)
- **📅 Seasonal**: Lihat jadwal anime seasonal (Winter, Spring, Summer, Fall)
- **💡 Recommend**: Rekomendasi anime berdasarkan genre dan minimum score
- **🎬 Trailer**: Lihat trailer anime dari YouTube
- **📚 Watchlist**: Kelola watchlist anime pribadi kamu
- **ℹ️ Info Detail**: Lihat informasi lengkap anime berdasarkan ID
- **🎨 Filter by Type**: Filter anime berdasarkan type (TV, Movie, OVA, Special, ONA)
- **📄 Pagination**: Navigasi halaman dengan tombol Previous/Next
- **⚡ Fast & Reliable**: Menggunakan AniList GraphQL API yang cepat dan stabil

## 🚀 Cara Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Discord Bot

1. Buat bot baru di [Discord Developer Portal](https://discord.com/developers/applications)
2. Di bagian "Bot", klik "Add Bot"
3. Copy token bot kamu
4. Di bagian "OAuth2" > "URL Generator":
   - Pilih scope: `bot` dan `applications.commands`
   - Pilih permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
   - Copy URL dan gunakan untuk invite bot ke server

### 3. Setup Environment Variables


Buat file `.env` di root folder:

```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
```

### 4. Deploy Commands

Sebelum menjalankan bot, deploy slash commands terlebih dahulu:

```bash
node deploy-commands.js
```

### 5. Jalankan Bot

```bash
npm start
```


## 📝 Commands

### `/search <query>`
Cari anime berdasarkan judul.

**Contoh:**
```
/search query:Naruto
/search query:One Piece
```

**Fitur:**
- Pagination dengan tombol Previous/Next
- Filter by type (TV, Movie, OVA, Special, ONA)
- Refresh untuk reload data
- Menampilkan 5 anime per halaman


### `/genre <genre>`
Cari anime berdasarkan genre.

**Genre tersedia:**
- Action, Adventure, Comedy, Drama
- Fantasy, Horror, Mystery, Romance
- Sci-Fi, Slice of Life, Sports, Supernatural
- Thriller, Mecha, Music, Psychological
- Ecchi, Hentai

**Contoh:**
```
/genre genre:Action
/genre genre:Romance
```

**Fitur:**
- Pagination dengan tombol Previous/Next
- Filter by type (TV, Movie, OVA, Special, ONA)
- Menampilkan 5 anime per halaman

### `/top`
Lihat daftar top anime dari MyAnimeList.

**Fitur:**
- Pagination dengan tombol Previous/Next
- Filter by type (TV, Movie, OVA, Special, ONA)
- Menampilkan ranking dan score

### `/info <id>`
Lihat detail lengkap anime berdasarkan MyAnimeList ID.

**Contoh:**
```
/info id:5114
/info id:20
```

**Informasi yang ditampilkan:**
- Judul (English & Japanese)
- Type, Episodes, Score, Status
- Aired date, Duration, Rating
- Genres, Studios
- Synopsis


## 🎮 Cara Penggunaan

1. Gunakan slash command `/search` untuk mencari anime
2. Gunakan tombol **Previous** dan **Next** untuk navigasi halaman
3. Klik tombol **Type** (TV, Movie, OVA, etc.) untuk filter berdasarkan type
4. Klik tombol **🔄** untuk refresh data
5. Gunakan `/info` dengan ID anime untuk melihat detail lengkap
6. Tombol akan expired setelah 5 menit (button akan disabled)


## 🛠️ Teknologi

- **Discord.js v14**: Library untuk Discord bot
- **AniList API**: GraphQL API untuk data anime (fast & reliable)
- **Axios**: HTTP client untuk API requests
- **Node.js**: Runtime environment

## ⚙️ Konfigurasi

Edit `config.js` untuk mengubah:
- `itemsPerPage`: Jumlah anime per halaman (default: 5)
- `maxPages`: Maksimal halaman yang bisa diakses (default: 10)
- `buttonTimeout`: Waktu timeout untuk buttons dalam milidetik (default: 300000 = 5 menit)


## 📂 Struktur Folder

```
discord-anime-bot/
├── commands/           # Slash commands
│   ├── search.js      # Command untuk search anime
│   ├── info.js        # Command untuk detail anime
│   └── top.js         # Command untuk top anime
├── utils/             # Utility functions
│   ├── animeApi.js    # API calls ke Jikan
│   ├── embedBuilder.js # Discord embed builders
│   └── buttonBuilder.js # Discord button builders
├── config.js          # Konfigurasi bot
├── index.js           # Main bot file
├── deploy-commands.js # Deploy slash commands
├── package.json       # Dependencies
├── .env.example       # Environment variables template
└── README.md          # Dokumentasi
```


## 🔒 Rate Limiting

Bot ini mengimplementasikan rate limiting untuk menghormati batasan API Jikan:
- Minimal 1 detik delay antara setiap request
- Otomatis menunggu sebelum melakukan request berikutnya

## 🐛 Troubleshooting

### Bot tidak merespon slash commands
- Pastikan sudah menjalankan `node deploy-commands.js`
- Tunggu beberapa menit (slash commands butuh waktu untuk propagate)
- Pastikan bot memiliki permission yang cukup di server

### Error saat mencari anime
- Cek koneksi internet
- Jikan API mungkin sedang down atau maintenance
- Cek rate limiting (tunggu 1 detik antara requests)


## 📄 License

MIT License

## 🙏 Credits

- [AniList](https://anilist.co/) - Anime database & GraphQL API
- [Discord.js](https://discord.js.org/) - Discord bot library

---

Dibuat dengan ❤️ untuk komunitas anime


---

## 🆕 Fitur Baru

### `/seasonal [season] [year]`
Lihat jadwal anime seasonal (Winter, Spring, Summer, Fall).

**Contoh:**
```
/seasonal
/seasonal season:Winter year:2025
/seasonal season:Spring
```

### `/recommend <genre> [min_score]`
Rekomendasi anime berdasarkan genre dan minimum score.

**Contoh:**
```
/recommend genre:Action min_score:80
/recommend genre:Romance
```

### `/trailer <id>`
Lihat trailer anime dari YouTube.

**Contoh:**
```
/trailer id:1
/trailer id:21
```

### `/watchlist`
Kelola watchlist anime pribadi kamu.

**Subcommands:**
```
/watchlist add id:1      - Tambah anime ke watchlist
/watchlist remove id:1   - Hapus anime dari watchlist
/watchlist list          - Lihat watchlist kamu
/watchlist clear         - Hapus semua anime
```

**Fitur Watchlist:**
- ✅ Simpan anime favorit kamu
- ✅ Pagination untuk watchlist panjang
- ✅ Data tersimpan lokal di file JSON
- ✅ Per-user watchlist (setiap user punya watchlist sendiri)

---
VIBE CODE
