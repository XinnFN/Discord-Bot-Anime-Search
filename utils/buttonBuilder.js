import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createPaginationButtons(currentPage, totalPages, disabled = false) {
  const row = new ActionRowBuilder();
  
  // Button Previous
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('◀️ Previous')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled || currentPage <= 1)
  );
  
  // Button Page Info
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('page_info')
      .setLabel(`${currentPage}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );
  
  // Button Next
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Next ▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled || currentPage >= totalPages)
  );
  
  // Button Refresh
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('refresh')
      .setLabel('🔄')
      .setStyle(ButtonStyle.Success)
      .setDisabled(disabled)
  );
  
  return row;
}

export function createTypeFilterButtons(selectedType = null, disabled = false) {
  const row1 = new ActionRowBuilder();
  const row2 = new ActionRowBuilder();
  
  const types = [
    { id: 'tv', label: 'TV' },
    { id: 'movie', label: 'Movie' },
    { id: 'ova', label: 'OVA' },
    { id: 'special', label: 'Special' },
    { id: 'ona', label: 'ONA' }
  ];
  
  types.forEach((type, index) => {
    const button = new ButtonBuilder()
      .setCustomId(`type_${type.id}`)
      .setLabel(type.label)
      .setStyle(selectedType === type.id ? ButtonStyle.Success : ButtonStyle.Secondary)
      .setDisabled(disabled);
    
    if (index < 3) {
      row1.addComponents(button);
    } else {
      row2.addComponents(button);
    }
  });
  
  // Button untuk clear filter
  row2.addComponents(
    new ButtonBuilder()
      .setCustomId('type_all')
      .setLabel('All')
      .setStyle(selectedType === null ? ButtonStyle.Success : ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
  
  return [row1, row2];
}
