const DistrictModal = require('../modals/DistrictModal');
const districtNames = require('../fixtures/district-names');

class AddressPage {
  constructor(page) {
    this.page = page;
    this.districtModal = new DistrictModal(page);

    this.addButton = page.getByRole('button', { name: 'Добавить запись' });
    this.tableWrapper = page.locator('.v-data-table__wrapper');

    this.districtMenuItem = page.getByRole('menuitem', { name: 'Район', exact: true });

    this.deleteSelectedButton = page.getByRole('button', { name: 'Удалить выбранные записи' });
    this.confirmDialog = page.locator('[data-test-id="stack-yes-no"]');
    this.confirmYesButton = this.confirmDialog.getByRole('button', { name: 'Да' });
    this.confirmNoButton = this.confirmDialog.getByRole('button', { name: 'Нет' });
  }

  async clickAddButton() {
    await this.addButton.click();
  }

  async selectDistrictFromDropdown() {
    await this.districtMenuItem.click();
  }

  async isTableVisible() {
    return await this.tableWrapper.isVisible();
  }

  getDistrictCell(districtName) {
    return this.page.getByRole('cell', { name: districtName });
  }

  getDistrictRow(districtName) {
    return this.getDistrictCell(districtName).locator('..');
  }

  async waitForDistrictInTable(districtName, timeout = 10000) {
    const cell = this.getDistrictCell(districtName);
    await cell.waitFor({ state: 'visible', timeout });
  }

  getEditButtonForDistrict(districtName) {
    const row = this.getDistrictRow(districtName);
    return row.locator('[data-cy="btn-edit"]');
  }

  async clickEditButton(districtName) {
    const editButton = this.getEditButtonForDistrict(districtName);
    await editButton.click();
  }

  async createDistrict(name) {
    const districtName = name || districtNames.generateForCreation();

    await this.clickAddButton();
    await this.selectDistrictFromDropdown();
    await this.districtModal.fillName(districtName);
    const autoNumber = await this.districtModal.getAutoNumber();

    await this.districtModal.clickCreate();
    await this.districtModal.waitForClosed();
    await this.waitForDistrictInTable(districtName);

    return { name: districtName, autoNumber };
  }

  async selectDistrictCheckbox(districtName) {
    const row = this.getDistrictRow(districtName);
    const checkboxWrapper = row.locator('.v-input--selection-controls__input');
    await checkboxWrapper.click();
  }

  async clickDeleteSelectedButton() {
    await this.deleteSelectedButton.click();
  }

  async confirmDeletion() {
    await this.confirmDialog.waitFor({ state: 'visible' });
    await this.confirmYesButton.click();
  }

  async cancelDeletion() {
    await this.confirmDialog.waitFor({ state: 'visible' });
    await this.confirmNoButton.click();
    await this.confirmDialog.waitFor({ state: 'hidden' });
  }
}

module.exports = AddressPage;
