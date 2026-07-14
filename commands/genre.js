import { SlashCommandBuilder } from 'discord.js';
import { getAnimeByGenre } from '../utils/animeApi.js';
import { createAnimeListEmbed, createErrorEmbed } from '../utils/embedBuilder.js';
import { createPaginationButtons, createTypeFilterButtons } from '../utils/buttonBuilder.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('genre')
  .setDescription('Cari anime berdasarkan genre')
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
        { name: 'Thriller', value: 'Thriller' },
        { name: 'Mecha', value: 'Mecha' },
        { name: 'Music', value: 'Music' },
        { name: 'Psychological', value: 'Psychological' },
        { name: 'Ecchi', value: 'Ecchi' },
        { name: 'Hentai', value: 'Hentai' }
      )
  );

export async function execute(interaction) {
  const genre = interaction.options.getString('genre');
  
  await interaction.deferReply();
  
  try {
    const result = await getAnimeByGenre(genre, 1);
    
    if (!result.data || result.data.length === 0) {
      const errorEmbed = createErrorEmbed(`Tidak ada anime dengan genre ${genre}.`);
      return await interaction.editReply({ embeds: [errorEmbed] });
    }
    
    const totalPages = Math.min(
      Math.ceil(result.pagination.items.total / config.itemsPerPage),
      config.maxPages
    );
    
    const embed = createAnimeListEmbed(result.data, 1, totalPages, `Genre: ${genre}`);
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
        const newResult = await getAnimeByGenre(genre, currentPage, currentType);
        currentTotalPages = Math.min(
          Math.ceil(newResult.pagination.items.total / config.itemsPerPage),
          config.maxPages
        );
        
        const newEmbed = createAnimeListEmbed(
          newResult.data, 
          currentPage, 
          currentTotalPages, 
          `Genre: ${genre}${currentType ? ` (${currentType.toUpperCase()})` : ''}`
        );
        const newPaginationButtons = createPaginationButtons(currentPage, currentTotalPages);
        const newTypeFilterButtons = createTypeFilterButtons(currentType);
        
        await i.editReply({
          embeds: [newEmbed],
          components: [newPaginationButtons, ...newTypeFilterButtons]
        });
      } catch (error) {
        console.error('Error updating genre results:', error);
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
    console.error('Error in genre command:', error);
    const errorEmbed = createErrorEmbed('Terjadi kesalahan saat mencari anime. Silakan coba lagi.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
