class DashboardPage {
  constructor(page) {
    this.page = page;
    this.addressFundMenu = page.locator('[data-test-id="Адресный фонд"]');
    this.livingAddressesSubmenu = page.locator('[data-test-id="Адреса проживающих"]');
  }

  async openAddressSection() {
    await this.addressFundMenu.click();
    await this.page.waitForURL('**/acc_menu');
    await this.livingAddressesSubmenu.click();
    await this.page.waitForURL('**/accounts');
  }
}

module.exports = DashboardPage;
