class DistrictModal {
  constructor(page) {
    this.page = page;

    this.nameInput = page.locator('[data-test-id="Название района"]');
    this.numberInput = page.locator('[data-test-id="Номер в списке"]');

    this.nameError = page.getByText('Поле не может быть пустым').first();
    this.numberError = page.getByText('Поле не может быть пустым').nth(1);

    this.createButton = page.getByRole('button', { name: 'Внести' });
    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });

    this.actionsPanel = page.locator('div.v-card__actions');
  }

  async isVisible() {
    return await this.nameInput.isVisible();
  }

  async fillName(name) {
    await this.nameInput.fill(name);
  }

  async fillNumber(number) {
    await this.numberInput.click();
    await this.numberInput.clear();
    await this.numberInput.type(number, { delay: 50 });
  }

  async getAutoNumber() {
    return await this.numberInput.inputValue();
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async clickSave() {
    await this.actionsPanel.click();
    await this.saveButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async getNameError() {
    return await this.nameError.textContent();
  }

  async getNumberError() {
    return await this.numberError.textContent();
  }

  async waitForClosed() {
    await this.nameInput.waitFor({ state: 'hidden' });
  }
  async clearNumber() {
    await this.numberInput.clear();
  }

  async getToastError() {
    const toast = this.page
      .getByRole('status')
      .filter({ hasText: 'При выполнении операции произошла ошибка!' });
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    return await toast.textContent();
  }

  async validateRequiredFieldErrors() {
    await this.nameError.waitFor({ state: 'visible', timeout: 5000 });
    await this.numberError.waitFor({ state: 'visible', timeout: 5000 });

    const nameErrorText = await this.nameError.textContent();
    const numberErrorText = await this.numberError.textContent();

    const hasNameError =
      nameErrorText.includes('не может быть пустым') || nameErrorText.includes('Обязательное поле');
    const hasNumberError =
      numberErrorText.includes('не может быть пустым') ||
      numberErrorText.includes('Обязательное поле');

    return hasNameError && hasNumberError;
  }
}

module.exports = DistrictModal;
