const env = require('../helpers/env');

class AuthPage {
  constructor(page) {
    this.page = page;
    this.loginInput = page.getByRole('textbox', { name: 'Логин' });
    this.passwordInput = page.getByRole('textbox', { name: 'Пароль' });
    this.submitButton = page.getByRole('button', { name: 'Войти' });
    this.confirmButton = page.getByRole('button', { name: 'Да' });
  }

  async login() {
    await this.page.goto(env.baseURL);
    try {
      await this.loginInput.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      await this.page.reload();
      await this.loginInput.waitFor({ state: 'visible', timeout: 5000 });
    }
    await this.loginInput.fill(env.login);
    await this.passwordInput.fill(env.password);
    await this.submitButton.click();

    try {
      await this.confirmButton.waitFor({ state: 'visible', timeout: 2000 });
      await this.confirmButton.click();
    } catch (error) {}
  }
}

module.exports = AuthPage;
