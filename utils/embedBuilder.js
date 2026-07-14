import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export function createAnimeListEmbed(animeList, page, totalPages, query, type = null) {
  const embed = new EmbedBuilder()
    .setColor('#2E51A2')
    .setTitle(`${config.emojis.search} Hasil Pencarian: "${query}"`)
    .setFooter({ text: `${config.emojis.page} Halaman ${page}/${totalPages}` })
    .setTimestamp();
  
  if (type) {
    embed.setDescription(`**Type:** ${type.toUpperCase()}`);
  }
  
  if (animeList.length === 0) {
    embed.setDescription('Tidak ada anime yang ditemukan.');
    return embed;
  }
  
  animeList.forEach((anime, index) => {
    const score = anime.score ? `${config.emojis.star} ${anime.score}/10` : 'N/A';
    const episodes = anime.episodes ? `${anime.episodes} episode` : 'Unknown';
    const status = anime.status || 'Unknown';
    const type = anime.type || 'Unknown';
    
    embed.addFields({
      name: `${(page - 1) * config.itemsPerPage + index + 1}. ${anime.title}`,
      value: `**Type:** ${type} | **Episodes:** ${episodes}\n` +
             `**Status:** ${status} | **Score:** ${score}\n` +
             `**ID:** ${anime.mal_id}`,
      inline: false
    });
  });
  
  return embed;
}

export function createAnimeDetailEmbed(anime) {
  const embed = new EmbedBuilder()
    .setColor('#2E51A2')
    .setTitle(anime.title)
    .setURL(anime.url)
    .setTimestamp();
  
  if (anime.title_english) {
    embed.addFields({ name: 'English Title', value: anime.title_english, inline: false });
  }
  
  if (anime.title_japanese) {
    embed.addFields({ name: 'Japanese Title', value: anime.title_japanese, inline: false });
  }
  
  const score = anime.score ? `${config.emojis.star} ${anime.score}/10` : 'N/A';
  const episodes = anime.episodes ? `${anime.episodes} episodes` : 'Unknown';
  const status = anime.status || 'Unknown';
  const type = anime.type || 'Unknown';
  
  embed.addFields(
    { name: 'Type', value: type, inline: true },
    { name: 'Episodes', value: episodes, inline: true },
    { name: 'Score', value: score, inline: true },
    { name: 'Status', value: status, inline: true }
  );
  
  if (anime.aired?.string) {
    embed.addFields({ name: 'Aired', value: anime.aired.string, inline: true });
  }
  
  if (anime.duration) {
    embed.addFields({ name: 'Duration', value: anime.duration, inline: true });
  }
  
  if (anime.rating) {
    embed.addFields({ name: 'Rating', value: anime.rating, inline: false });
  }
  
  if (anime.genres && anime.genres.length > 0) {
    const genres = anime.genres.map(g => g.name).join(', ');
    embed.addFields({ name: 'Genres', value: genres, inline: false });
  }
  
  if (anime.studios && anime.studios.length > 0) {
    const studios = anime.studios.map(s => s.name).join(', ');
    embed.addFields({ name: 'Studios', value: studios, inline: false });
  }
  
  if (anime.synopsis) {
    const synopsis = anime.synopsis.length > 1024 
      ? anime.synopsis.substring(0, 1021) + '...' 
      : anime.synopsis;
    embed.addFields({ name: 'Synopsis', value: synopsis, inline: false });
  }
  
  if (anime.images?.jpg?.large_image_url) {
    embed.setThumbnail(anime.images.jpg.large_image_url);
  }
  
  return embed;
}

export function createTopAnimeEmbed(animeList, page, totalPages, type = null) {
  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle(`🏆 Top Anime${type ? ` (${type.toUpperCase()})` : ''}`)
    .setFooter({ text: `${config.emojis.page} Halaman ${page}/${totalPages}` })
    .setTimestamp();
  
  if (animeList.length === 0) {
    embed.setDescription('Tidak ada data anime.');
    return embed;
  }
  
  animeList.forEach((anime, index) => {
    const rank = (page - 1) * config.itemsPerPage + index + 1;
    const score = anime.score ? `${config.emojis.star} ${anime.score}/10` : 'N/A';
    const episodes = anime.episodes ? `${anime.episodes} episode` : 'Unknown';
    
    embed.addFields({
      name: `#${rank} ${anime.title}`,
      value: `**Type:** ${anime.type || 'Unknown'} | **Episodes:** ${episodes}\n` +
             `**Score:** ${score} | **ID:** ${anime.mal_id}`,
      inline: false
    });
  });
  
  return embed;
}

export function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}


export function createSeasonalAnimeEmbed(animeList, page, totalPages, season, year) {
  const embed = new EmbedBuilder()
    .setColor('#00BCD4')
    .setTitle(`📅 ${season} ${year} Anime`)
    .setFooter({ text: `${config.emojis.page} Halaman ${page}/${totalPages}` })
    .setTimestamp();
  
  if (animeList.length === 0) {
    embed.setDescription('Tidak ada anime yang ditemukan.');
    return embed;
  }
  
  animeList.forEach((anime, index) => {
    const score = anime.score ? `${config.emojis.star} ${anime.score}/10` : 'N/A';
    const episodes = anime.episodes ? `${anime.episodes} episode` : 'TBA';
    const status = anime.status || 'Unknown';
    const type = anime.type || 'Unknown';
    const startDate = anime.startDate 
      ? `${anime.startDate.day || '?'}/${anime.startDate.month || '?'}/${anime.startDate.year || '?'}`
      : 'TBA';
    
    embed.addFields({
      name: `${(page - 1) * config.itemsPerPage + index + 1}. ${anime.title}`,
      value: `**Type:** ${type} | **Episodes:** ${episodes}\n` +
             `**Status:** ${status} | **Score:** ${score}\n` +
             `**Start Date:** ${startDate} | **ID:** ${anime.mal_id}`,
      inline: false
    });
  });
  
  return embed;
}

export function createWatchlistEmbed(watchlist, page, totalPages, username) {
  const itemsPerPage = 5;
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageItems = watchlist.slice(startIdx, endIdx);
  
  const embed = new EmbedBuilder()
    .setColor('#9C27B0')
    .setTitle(`📚 Watchlist ${username}`)
    .setDescription(`Total: ${watchlist.length} anime`)
    .setFooter({ text: `📄 Halaman ${page}/${totalPages}` })
    .setTimestamp();
  
  pageItems.forEach((anime, index) => {
    const score = anime.score ? `⭐ ${anime.score}/10` : 'N/A';
    const status = anime.status || 'Unknown';
    const type = anime.type || 'Unknown';
    const addedDate = new Date(anime.addedAt).toLocaleDateString('id-ID');
    
    embed.addFields({
      name: `${startIdx + index + 1}. ${anime.title}`,
      value: `**Type:** ${type} | **Status:** ${status}\n` +
             `**Score:** ${score} | **Added:** ${addedDate}\n` +
             `**ID:** ${anime.id}`,
      inline: false
    });
  });
  
  return embed;
}
