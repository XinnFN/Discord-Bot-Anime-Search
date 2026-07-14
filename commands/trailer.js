import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAnimeTrailer } from '../utils/animeApi.js';
import { createErrorEmbed } from '../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('trailer')
  .setDescription('Cari trailer anime')
  .addIntegerOption(option =>
    option.setName('id')
      .setDescription('ID anime dari AniList')
      .setRequired(true)
      .setMinValue(1)
  );

export async function execute(interaction) {
  const animeId = interaction.options.getInteger('id');
  
  await interaction.deferReply();
  
  try {
    const anime = await getAnimeTrailer(animeId);
    
    if (!anime || !anime.trailer) {
      const errorEmbed = createErrorEmbed('Trailer tidak ditemukan untuk anime ini.');
      return await interaction.editReply({ embeds: [errorEmbed] });
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`🎬 ${anime.title}`)
      .setURL(anime.siteUrl)
      .setDescription(anime.trailer.site === 'youtube' 
        ? `[▶️ Tonton Trailer di YouTube](https://www.youtube.com/watch?v=${anime.trailer.id})`
        : 'Trailer tersedia')
      .setThumbnail(anime.coverImage);
    
    if (anime.trailer.thumbnail) {
      embed.setImage(anime.trailer.thumbnail);
    }
    
    if (anime.averageScore) {
      embed.addFields({ 
        name: '⭐ Score', 
        value: `${(anime.averageScore / 10).toFixed(1)}/10`, 
        inline: true 
      });
    }
    
    if (anime.format) {
      embed.addFields({ 
        name: '📺 Type', 
        value: anime.format, 
        inline: true 
      });
    }
    
    if (anime.status) {
      embed.addFields({ 
        name: '📊 Status', 
        value: anime.status, 
        inline: true 
      });
    }
    
    embed.setFooter({ text: `ID: ${animeId}` });
    embed.setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error in trailer command:', error);
    const errorEmbed = createErrorEmbed('Terjadi kesalahan saat mengambil trailer.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
