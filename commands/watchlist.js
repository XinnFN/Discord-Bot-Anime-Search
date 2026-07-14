import { SlashCommandBuilder } from 'discord.js';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../utils/watchlistDb.js';
import { getAnimeById } from '../utils/animeApi.js';
import { createWatchlistEmbed, createErrorEmbed } from '../utils/embedBuilder.js';
import { createPaginationButtons } from '../utils/buttonBuilder.js';
import { EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('watchlist')
  .setDescription('Kelola watchlist anime kamu')
  .addSubcommand(subcommand =>
    subcommand
      .setName('add')
      .setDescription('Tambah anime ke watchlist')
      .addIntegerOption(option =>
        option.setName('id')
          .setDescription('ID anime dari AniList')
          .setRequired(true)
          .setMinValue(1)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('remove')
      .setDescription('Hapus anime dari watchlist')
      .addIntegerOption(option =>
        option.setName('id')
          .setDescription('ID anime dari AniList')
          .setRequired(true)
          .setMinValue(1)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('Lihat watchlist kamu')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('clear')
      .setDescription('Hapus semua anime dari watchlist')
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const userId = interaction.user.id;
  
  await interaction.deferReply();
  
  try {
    if (subcommand === 'add') {
      const animeId = interaction.options.getInteger('id');
      
      // Get anime info first
      const animeData = await getAnimeById(animeId);
      const anime = animeData.data;
      
      if (!anime) {
        const errorEmbed = createErrorEmbed('Anime dengan ID tersebut tidak ditemukan.');
        return await interaction.editReply({ embeds: [errorEmbed] });
      }
      
      const added = addToWatchlist(userId, {
        id: anime.mal_id,
        title: anime.title,
        image: anime.images.jpg.large_image_url,
        score: anime.score,
        status: anime.status,
        type: anime.type
      });
      
      if (added) {
        const embed = new EmbedBuilder()
          .setColor('#4CAF50')
          .setTitle('✅ Ditambahkan ke Watchlist!')
          .setDescription(`**${anime.title}** berhasil ditambahkan ke watchlist kamu.`)
          .setThumbnail(anime.images.jpg.large_image_url)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      } else {
        const errorEmbed = createErrorEmbed('Anime ini sudah ada di watchlist kamu.');
        await interaction.editReply({ embeds: [errorEmbed] });
      }
      
    } else if (subcommand === 'remove') {
      const animeId = interaction.options.getInteger('id');
      const removed = removeFromWatchlist(userId, animeId);
      
      if (removed) {
        const embed = new EmbedBuilder()
          .setColor('#FF5252')
          .setTitle('🗑️ Dihapus dari Watchlist')
          .setDescription(`Anime dengan ID **${animeId}** berhasil dihapus dari watchlist.`)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      } else {
        const errorEmbed = createErrorEmbed('Anime tidak ditemukan di watchlist kamu.');
        await interaction.editReply({ embeds: [errorEmbed] });
      }
      
    } else if (subcommand === 'list') {
      const watchlist = getWatchlist(userId);
      
      if (watchlist.length === 0) {
        const errorEmbed = createErrorEmbed('Watchlist kamu masih kosong. Gunakan `/watchlist add` untuk menambah anime.');
        return await interaction.editReply({ embeds: [errorEmbed] });
      }
      
      const itemsPerPage = 5;
      const totalPages = Math.ceil(watchlist.length / itemsPerPage);
      const currentPage = 1;
      
      const embed = createWatchlistEmbed(watchlist, currentPage, totalPages, interaction.user.username);
      const paginationButtons = createPaginationButtons(currentPage, totalPages);
      
      const response = await interaction.editReply({
        embeds: [embed],
        components: totalPages > 1 ? [paginationButtons] : []
      });
      
      if (totalPages > 1) {
        const collector = response.createMessageComponentCollector({
          time: 300000 // 5 minutes
        });
        
        let page = currentPage;
        
        collector.on('collect', async i => {
          if (i.user.id !== interaction.user.id) {
            return await i.reply({
              content: 'Hanya user yang melakukan command yang bisa menggunakan button ini!',
              ephemeral: true
            });
          }
          
          await i.deferUpdate();
          
          if (i.customId === 'previous') {
            page = Math.max(1, page - 1);
          } else if (i.customId === 'next') {
            page = Math.min(totalPages, page + 1);
          }
          
          const newEmbed = createWatchlistEmbed(watchlist, page, totalPages, interaction.user.username);
          const newPaginationButtons = createPaginationButtons(page, totalPages);
          
          await i.editReply({
            embeds: [newEmbed],
            components: [newPaginationButtons]
          });
        });
        
        collector.on('end', async () => {
          try {
            const disabledButtons = createPaginationButtons(page, totalPages, true);
            await interaction.editReply({ components: [disabledButtons] });
          } catch (error) {
            // Message mungkin sudah dihapus
          }
        });
      }
      
    } else if (subcommand === 'clear') {
      const watchlist = getWatchlist(userId);
      
      if (watchlist.length === 0) {
        const errorEmbed = createErrorEmbed('Watchlist kamu sudah kosong.');
        return await interaction.editReply({ embeds: [errorEmbed] });
      }
      
      // Clear all
      watchlist.forEach(anime => removeFromWatchlist(userId, anime.id));
      
      const embed = new EmbedBuilder()
        .setColor('#FF9800')
        .setTitle('🗑️ Watchlist Dikosongkan')
        .setDescription('Semua anime berhasil dihapus dari watchlist kamu.')
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
    
  } catch (error) {
    console.error('Error in watchlist command:', error);
    const errorEmbed = createErrorEmbed('Terjadi kesalahan saat mengelola watchlist.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
