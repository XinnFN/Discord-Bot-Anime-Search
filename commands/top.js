import { SlashCommandBuilder } from 'discord.js';
import { getTopAnime } from '../utils/animeApi.js';
import { createTopAnimeEmbed, createErrorEmbed } from '../utils/embedBuilder.js';
import { createPaginationButtons, createTypeFilterButtons } from '../utils/buttonBuilder.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('top')
  .setDescription('Lihat daftar top anime');

export async function execute(interaction) {
  await interaction.deferReply();
  
  try {
    console.log('[TOP] Fetching top anime...');
    const result = await getTopAnime(1);
    console.log(`[TOP] Hasil ditemukan:`, result.data?.length || 0);
    
    if (!result.data || result.data.length === 0) {
      const errorEmbed = createErrorEmbed('Tidak ada data anime.');
      return await interaction.editReply({ embeds: [errorEmbed] });
    }
    
    const totalPages = Math.min(
      Math.ceil(result.pagination.items.total / config.itemsPerPage),
      config.maxPages
    );
    
    const embed = createTopAnimeEmbed(result.data, 1, totalPages);
    const paginationButtons = createPaginationButtons(1, totalPages);
    const typeFilterButtons = createTypeFilterButtons(null);
    
    const response = await interaction.editReply({
      embeds: [embed],
      components: [paginationButtons, ...typeFilterButtons]
    });
    
    // Collector untuk button interactions
    const collector = response.createMessageComponentCollector({
      time: config.buttonTimeout
    });
    
    let currentPage = 1;
    let currentType = null;
    let currentTotalPages = totalPages;
    
    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return await i.reply({
          content: 'Hanya user yang melakukan command yang bisa menggunakan button ini!',
          ephemeral: true
        });
      }
      
      await i.deferUpdate();
      
      // Handle type filter buttons
      if (i.customId.startsWith('type_')) {
        const typeValue = i.customId.replace('type_', '');
        currentType = typeValue === 'all' ? null : typeValue;
        currentPage = 1;
      }
      // Handle pagination buttons
      else if (i.customId === 'previous') {
        currentPage = Math.max(1, currentPage - 1);
      } else if (i.customId === 'next') {
        currentPage = Math.min(currentTotalPages, currentPage + 1);
      } else if (i.customId === 'refresh') {
        // Refresh current page
      }
      
      try {
        const newResult = await getTopAnime(currentPage, currentType);
        currentTotalPages = Math.min(
          Math.ceil(newResult.pagination.items.total / config.itemsPerPage),
          config.maxPages
        );
        
        const newEmbed = createTopAnimeEmbed(newResult.data, currentPage, currentTotalPages, currentType);
        const newPaginationButtons = createPaginationButtons(currentPage, currentTotalPages);
        const newTypeFilterButtons = createTypeFilterButtons(currentType);
        
        await i.editReply({
          embeds: [newEmbed],
          components: [newPaginationButtons, ...newTypeFilterButtons]
        });
      } catch (error) {
        console.error('Error updating top anime:', error);
        const errorEmbed = createErrorEmbed('Terjadi kesalahan saat memuat data.');
        await i.editReply({ embeds: [errorEmbed] });
      }
    });
    
    collector.on('end', async () => {
      try {
        const disabledPaginationButtons = createPaginationButtons(currentPage, currentTotalPages, true);
        const disabledTypeFilterButtons = createTypeFilterButtons(currentType, true);
        
        await interaction.editReply({
          components: [disabledPaginationButtons, ...disabledTypeFilterButtons]
        });
      } catch (error) {
        // Message mungkin sudah dihapus
      }
    });
    
  } catch (error) {
    console.error('Error in top command:', error.message);
    console.error('Stack:', error.stack);
    
    let errorMessage = 'Terjadi kesalahan saat mengambil data top anime.';
    
    if (error.response?.status === 504 || error.code === 'ETIMEDOUT') {
      errorMessage = '⏱️ API MyAnimeList sedang lambat atau overload.\n\n' +
        'Silakan coba lagi dalam beberapa menit.\n' +
        '💡 Cek status API: https://status.jikan.moe/';
    }
    
    const errorEmbed = createErrorEmbed(errorMessage);
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
