# Discord Anime Bot 🎌

A Discord bot for searching and viewing anime information using the Jikan API (MyAnimeList). This bot features anime searching, filtering by type (TV, Movie, OVA, etc.), and a pagination system.

## ✨ Features

- **🔍 Search Anime**: Search for anime by title
- **📊 Top Anime**: View a list of top anime based on scores
- **🎭 Genre**: Search for anime by genre (18 available genres)
- **📅 Seasonal**: View seasonal anime schedules (Winter, Spring, Summer, Fall)
- **💡 Recommend**: Get anime recommendations based on genre and minimum score
- **🎬 Trailer**: Watch anime trailers from YouTube
- **📚 Watchlist**: Manage your personal anime watchlist
- **ℹ️ Detailed Info**: View comprehensive anime information by ID
- **🎨 Filter by Type**: Filter anime by type (TV, Movie, OVA, Special, ONA)
- **📄 Pagination**: Navigate pages using Previous/Next buttons
- **⚡ Fast & Reliable**: Powered by the fast and stable AniList GraphQL API

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install

```

### 2. Setup Discord Bot

1. Create a new bot on the [Discord Developer Portal](https://discord.com/developers/applications)
2. Go to the "Bot" section and click "Add Bot"
3. Copy your bot token
4. Under "OAuth2" > "URL Generator":
* Select scopes: `bot` and `applications.commands`
* Select permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
* Copy the generated URL and use it to invite the bot to your server



### 3. Setup Environment Variables

Create an `.env` file in the root folder:

```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here

```

### 4. Deploy Commands

Before running the bot, deploy the slash commands first:

```bash
node deploy-commands.js

```

### 5. Run the Bot

```bash
npm start

```

## 📝 Commands

### `/search <query>`

Search for anime by title.

**Example:**

```
/search query:Naruto
/search query:One Piece

```

**Features:**

* Pagination with Previous/Next buttons
* Filter by type (TV, Movie, OVA, Special, ONA)
* Refresh button to reload data
* Displays 5 anime per page

### `/genre <genre>`

Search for anime by genre.

**Available Genres:**

* Action, Adventure, Comedy, Drama
* Fantasy, Horror, Mystery, Romance
* Sci-Fi, Slice of Life, Sports, Supernatural
* Thriller, Mecha, Music, Psychological
* Ecchi, Hentai

**Example:**

```
/genre genre:Action
/genre genre:Romance

```

**Features:**

* Pagination with Previous/Next buttons
* Filter by type (TV, Movie, OVA, Special, ONA)
* Displays 5 anime per page

### `/top`

View the top anime list from MyAnimeList.

**Features:**

* Pagination with Previous/Next buttons
* Filter by type (TV, Movie, OVA, Special, ONA)
* Displays rankings and scores

### `/info <id>`

View comprehensive anime details by MyAnimeList ID.

**Example:**

```
/info id:5114
/info id:20

```

**Displayed Information:**

* Title (English & Japanese)
* Type, Episodes, Score, Status
* Aired date, Duration, Rating
* Genres, Studios
* Synopsis

## 🎮 How to Use

1. Use the `/search` slash command to search for an anime.
2. Use the **Previous** and **Next** buttons to navigate through pages.
3. Click the **Type** buttons (TV, Movie, OVA, etc.) to filter by anime type.
4. Click the **🔄** button to refresh the data.
5. Use `/info` with the anime ID to view full details.
6. Buttons will expire after 5 minutes (they will become disabled).

## 🛠️ Technologies Used

* **Discord.js v14**: Library for interacting with the Discord API
* **AniList API**: GraphQL API for anime data (fast & reliable)
* **Axios**: HTTP client for API requests
* **Node.js**: Runtime environment

## ⚙️ Configuration

Edit `config.js` to customize:

* `itemsPerPage`: Number of anime per page (default: 5)
* `maxPages`: Maximum accessible pages (default: 10)
* `buttonTimeout`: Timeout duration for buttons in milliseconds (default: 300000 = 5 minutes)

## 📂 Folder Structure

```
discord-anime-bot/
├── commands/            # Slash commands
│   ├── search.js        # Command to search anime
│   ├── info.js          # Command for anime details
│   └── top.js           # Command for top anime
├── utils/               # Utility functions
│   ├── animeApi.js      # API calls to Jikan
│   ├── embedBuilder.js  # Discord embed builders
│   └── buttonBuilder.js # Discord button builders
├── config.js            # Bot configuration
├── index.js             # Main bot file
├── deploy-commands.js   # Deploy slash commands script
├── package.json         # Project dependencies
├── .env.example         # Environment variables template
└── README.md            # Project documentation

```

## 🔒 Rate Limiting

This bot implements rate limiting to respect Jikan API limits:

* Minimum 1-second delay between requests
* Automatically waits before making the next request

## 🐛 Troubleshooting

### Bot is not responding to slash commands

* Ensure you have ran `node deploy-commands.js`
* Wait a few minutes (slash commands take some time to propagate across Discord)
* Ensure the bot has sufficient permissions in your server

### Error when searching for anime

* Check your internet connection
* The Jikan API might be down or undergoing maintenance
* Check rate limits (wait 1 second between requests)

## 📄 License

MIT License

## 🙏 Credits

* [AniList](https://anilist.co/) - Anime database & GraphQL API
* [Discord.js](https://discord.js.org/) - Discord bot library

---

Made with ❤️ for the anime community

---

## 🆕 New Features

### `/seasonal [season] [year]`

View seasonal anime schedules (Winter, Spring, Summer, Fall).

**Example:**

```
/seasonal
/seasonal season:Winter year:2025
/seasonal season:Spring

```

### `/recommend <genre> [min_score]`

Get anime recommendations based on genre and minimum score.

**Example:**

```
/recommend genre:Action min_score:80
/recommend genre:Romance

```

### `/trailer <id>`

Watch anime trailers from YouTube.

**Example:**

```
/trailer id:1
/trailer id:21

```

### `/watchlist`

Manage your personal anime watchlist.

**Subcommands:**

```
/watchlist add id:1      - Add anime to your watchlist
/watchlist remove id:1   - Remove anime from your watchlist
/watchlist list          - View your watchlist
/watchlist clear         - Clear your entire watchlist

```

**Watchlist Features:**

* ✅ Save your favorite anime
* ✅ Pagination for long watchlists
* ✅ Data is stored locally in a JSON file
* ✅ Per-user watchlist (each user has their own independent watchlist)

---

VIBE CODE

```

```
