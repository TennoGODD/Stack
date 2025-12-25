module.exports = {
  generateForCreation: () => `Новый район ${Date.now()}`,

  generateForEdit: () => `Для редактирования ${Date.now()}`,

  generateEdited: () => `Отредактированный ${Date.now()}`,

  generateForDeletion: () => `Для удаления ${Date.now()}`,

  generate: (prefix = 'Район') => `${prefix} ${Date.now()}`,

  generateForInvalidNumber: () => `С нецелым номером ${Date.now()}`,
};
