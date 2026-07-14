import { SlashCommandBuilder } from 'discord.js';
import { getSeasonalAnime } from '../utils/animeApi.js';
import { createSeasonalAnimeEmbed, createErrorEmbed } from '../utils/embedBuilder.js';
import { createPaginationButtons } from '../utils/buttonBuilder.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('seasonal')
  .setDescription('Lihat jadwal anime seasonal')
  .addStringOption(option =>
    option.setName('season')
      .setDescription('Pilih season')
      .addChoices(
        { name: 'Winter (Jan-Mar)', value: 'WINTER' },
        { name: 'Spring (Apr-Jun)', value: 'SPRING' },
        { name: 'Summer (Jul-Sep)', value: 'SUMMER' },
        { name: 'Fall (Oct-Dec)', value: 'FALL' }
      )
  )
  .addIntegerOption(option =>
    option.setName('year')
      .setDescription('Tahun (default: tahun sekarang)')
      .setMinValue(1940)
      .setMaxValue(2030)
  );

export async function execute(interaction) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Auto-detect season jika tidak dipilih
  let season = interaction.options.getString('season');
  if (!season) {
    if (currentMonth >= 1 && currentMonth <= 3) season = 'WINTER';
    else if (currentMonth >= 4 && currentMonth <= 6) season = 'SPRING';
    else if (currentMonth >= 7 && currentMonth <= 9) season = 'SUMMER';
    else season = 'FALL';
  }
  
  const year = interaction.options.getInteger('year') || currentYear;
  
  await interaction.deferReply();
  
  try {
    const result = await getSeasonalAnime(season, year, 1);
    
    if (!result.data || result.data.length === 0) {
      const errorEmbed = createErrorEmbed(`Tidak ada anime untuk ${season} ${year}.`);
      return await interaction.editReply({ embeds: [errorEmbed] });
    }
    
    const totalPages = Math.min(
      Math.ceil(result.pagination.items.total / config.itemsPerPage),
      config.maxPages
    );
    
    const embed = createSeasonalAnimeEmbed(result.data, 1, totalPages, season, year);
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
        const newResult = await getSeasonalAnime(season, year, currentPage);
        currentTotalPages = Math.min(
          Math.ceil(newResult.pagination.items.total / config.itemsPerPage),
          config.maxPages
        );
        
        const newEmbed = createSeasonalAnimeEmbed(newResult.data, currentPage, currentTotalPages, season, year);
        const newPaginationButtons = createPaginationButtons(currentPage, currentTotalPages);
        
        await i.editReply({
          embeds: [newEmbed],
          components: [newPaginationButtons]
        });
      } catch (error) {
        console.error('Error updating seasonal anime:', error);
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
    console.error('Error in seasonal command:', error);
    const errorEmbed = createErrorEmbed('Terjadi kesalahan saat mengambil data seasonal anime.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
