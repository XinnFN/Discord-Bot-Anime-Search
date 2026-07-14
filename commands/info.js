import { SlashCommandBuilder } from 'discord.js';
import { getAnimeById } from '../utils/animeApi.js';
import { createAnimeDetailEmbed, createErrorEmbed } from '../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Lihat detail lengkap anime berdasarkan ID MyAnimeList')
  .addIntegerOption(option =>
    option.setName('id')
      .setDescription('ID MyAnimeList dari anime')
      .setRequired(true)
      .setMinValue(1)
  );

export async function execute(interaction) {
  const animeId = interaction.options.getInteger('id');
  
  await interaction.deferReply();
  
  try {
    const animeData = await getAnimeById(animeId);
    const anime = animeData.data; // Extract data from response
    
    if (!anime) {
      const errorEmbed = createErrorEmbed('Anime dengan ID tersebut tidak ditemukan.');
      return await interaction.editReply({ embeds: [errorEmbed] });
    }
    
    const embed = createAnimeDetailEmbed(anime);
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error in info command:', error);
    const errorEmbed = createErrorEmbed('Terjadi kesalahan saat mengambil informasi anime. Pastikan ID yang dimasukkan benar.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
