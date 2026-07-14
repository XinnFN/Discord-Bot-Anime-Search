import { SlashCommandBuilder } from 'discord.js';
import { getRecommendations } from '../utils/animeApi.js';
import { createAnimeListEmbed, createErrorEmbed } from '../utils/embedBuilder.js';
import { createPaginationButtons } from '../utils/buttonBuilder.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('recommend')
  .setDescription('Rekomendasi anime berdasarkan genre')
  .addStringOption(option =>
    option.setName('genre')
      .setDescription('Pilih genre anime')
      .setRequired(true)
      .addChoices(
        { name: 'Action', value: 'Action' },
        { name: 'Adventure', value: 'Adventure' },
        { name: 'Comedy', value: 'Comedy' },
        { name: 'Drama', value: 'Drama' },
        { name: 'Fantasy', value: 'Fantasy' },
        { name: 'Horror', value: 'Horror' },
        { name: 'Mystery', value: 'Mystery' },
        { name: 'Romance', value: 'Romance' },
        { name: 'Sci-Fi', value: 'Sci-Fi' },
        { name: 'Slice of Life', value: 'Slice of Life' },
        { name: 'Sports', value: 'Sports' },
        { name: 'Supernatural', value: 'Supernatural' },
        { name: 'Thriller', value: 'Thriller' }
      )
  )
  .addIntegerOption(option =>
    option.setName('min_score')
      .setDescription('Minimum score (1-100, default: 70)')
      .setMinValue(1)
      .setMaxValue(100)
  );

export async function execute(interaction) {
  const genre = interaction.options.getString('genre');
  const minScore = interaction.options.getInteger('min_score') || 70;
  
  await interaction.deferReply();
  
  try {
    const result = await getRecommendations(genre, minScore, 1);
    
    if (!result.data || result.data.length === 0) {
      const errorEmbed = createErrorEmbed(`Tidak ada rekomendasi anime dengan genre ${genre} dan score minimal ${minScore}.`);
      return await interaction.editReply({ embeds: [errorEmbed] });
    }
    
    const totalPages = Math.min(
      Math.ceil(result.pagination.items.total / config.itemsPerPage),
      config.maxPages
    );
    
    const embed = createAnimeListEmbed(
      result.data, 
      1, 
      totalPages, 
      `💡 Rekomendasi ${genre} (Score ≥ ${minScore})`
    );
    const paginationButtons = createPaginationButtons(1, totalPages);
    
    const response = await interaction.editReply({
      embeds: [embed],
      components: [paginationButtons]
    });
    
    // Collector untuk button interactions
    const collector = response.createMessageComponentCollector({
      time: config.buttonTimeout
    });
    
    let currentPage = 1;
    let currentTotalPages = totalPages;
    
    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return await i.reply({
          content: 'Hanya user yang melakukan command yang bisa menggunakan button ini!',
          ephemeral: true
        });
      }
      
      await i.deferUpdate();
      
      if (i.customId === 'previous') {
        currentPage = Math.max(1, currentPage - 1);
      } else if (i.customId === 'next') {
        currentPage = Math.min(currentTotalPages, currentPage + 1);
      } else if (i.customId === 'refresh') {
        // Refresh current page
      }
      
      try {
        const newResult = await getRecommendations(genre, minScore, currentPage);
        currentTotalPages = Math.min(
          Math.ceil(newResult.pagination.items.total / config.itemsPerPage),
          config.maxPages
        );
        
        const newEmbed = createAnimeListEmbed(
          newResult.data, 
          currentPage, 
          currentTotalPages, 
          `💡 Rekomendasi ${genre} (Score ≥ ${minScore})`
        );
        const newPaginationButtons = createPaginationButtons(currentPage, currentTotalPages);
        
        await i.editReply({
          embeds: [newEmbed],
          components: [newPaginationButtons]
        });
      } catch (error) {
        console.error('Error updating recommendations:', error);
        const errorEmbed = createErrorEmbed('Terjadi kesalahan saat memuat data.');
        await i.editReply({ embeds: [errorEmbed] });
      }
    });
    
    collector.on('end', async () => {
      try {
        const disabledPaginationButtons = createPaginationButtons(currentPage, currentTotalPages, true);
        await interaction.editReply({ components: [disabledPaginationButtons] });
      } catch (error) {
        // Message mungkin sudah dihapus
      }
    });
    
  } catch (error) {
    console.error('Error in recommend command:', error);
    const errorEmbed = createErrorEmbed('Terjadi kesalahan saat mencari rekomendasi.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
