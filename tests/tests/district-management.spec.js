const { test, expect } = require('@playwright/test');
const AuthPage = require('../pages/AuthPage');
const DashboardPage = require('../pages/DashboardPage');
const AddressPage = require('../pages/AddressPage');
const DistrictModal = require('../modals/DistrictModal');
const districtNames = require('../fixtures/district-names');

let addressPage, districtModal;

test.beforeEach(async ({ page }) => {
  await test.step('Авторизация и переход в раздел "Адреса проживающих"', async () => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);

    await authPage.login();
    await dashboardPage.openAddressSection();

    addressPage = new AddressPage(page);
    districtModal = new DistrictModal(page);
  });
});

test.afterEach(async ({ page }) => {
  await test.step('Закрытие открытых модальных окон', async () => {
    const cancelButton = page.getByRole('button', { name: 'Отмена' });
    if ((await cancelButton.count()) > 0) {
      await cancelButton.click();
    }
  });
});

test('Открытие диалогового окна добавления нового района', async ({ page }) => {
  await test.step('Нажимаем кнопку "Добавить запись"', async () => {
    await addressPage.clickAddButton();
  });

  await test.step('Выбираем "Район" из выпадающего списка', async () => {
    await addressPage.selectDistrictFromDropdown();
  });

  await test.step('Проверяем элементы модального окна', async () => {
    await expect(districtModal.nameInput).toBeVisible();
    await expect(districtModal.numberInput).toBeVisible();

    const nameValue = await districtModal.nameInput.inputValue();
    const numberValue = await districtModal.numberInput.inputValue();

    expect(nameValue).toBe('');
    expect(numberValue).toBeTruthy();

    await expect(districtModal.createButton).toBeVisible();
    await expect(districtModal.cancelButton).toBeVisible();
  });

  await test.step('Делаем скриншот открытого окна', async () => {
    await page.screenshot({
      path: 'tests/tests/screenshots/01-окно-добавления-района-открыто.png',
      fullPage: false,
    });
  });
});

test('Валидация: сообщения об ошибках для пустых обязательных полей', async ({ page }) => {
  await test.step('Открываем форму создания района', async () => {
    await addressPage.clickAddButton();
    await addressPage.selectDistrictFromDropdown();
  });

  await test.step('Очищаем поле номера', async () => {
    const currentNumber = await districtModal.numberInput.inputValue();
    if (currentNumber) {
      await districtModal.numberInput.clear();
    }
  });

  await test.step('Проверяем сообщения об ошибках', async () => {
    const isValidated = await districtModal.validateRequiredFieldErrors();
    expect(isValidated).toBe(true);
  });

  await test.step('Делаем скриншот с ошибками', async () => {
    await page.screenshot({
      path: 'tests/tests/screenshots/02-ошибки-пустые-обязательные-поля.png',
    });
  });
});

test('Успешное создание нового района с валидными данными', async ({ page }) => {
  let districtName;

  await test.step('Создаём новый район через Page Object', async () => {
    const result = await addressPage.createDistrict();
    districtName = result.name;
    console.log(`Создан район "${districtName}" с номером ${result.autoNumber}`);
  });

  await test.step('Проверяем отображение района в таблице', async () => {
    const districtRow = addressPage.getDistrictRow(districtName);
    await expect(districtRow).toBeVisible();
  });

  await test.step('Делаем скриншот созданного района', async () => {
    await page.screenshot({
      path: `tests/tests/screenshots/03-район-создан-${districtName}.png`,
      fullPage: false,
    });
  });
});

test('Редактирование названия существующего района', async ({ page }) => {
  let oldName, newName;

  await test.step('Создаём район для редактирования', async () => {
    const result = await addressPage.createDistrict();
    oldName = result.name;
  });

  await test.step('Делаем скриншот созданного района', async () => {
    await page.screenshot({
      path: `tests/tests/screenshots/04-для-редактирования-${oldName}.png`,
      fullPage: false,
    });
  });

  await test.step('Открываем форму редактирования', async () => {
    await addressPage.clickEditButton(oldName);
    await expect(districtModal.nameInput).toHaveValue(oldName);
  });

  await test.step('Изменяем название района', async () => {
    newName = districtNames.generateEdited();
    await districtModal.fillName(newName);
    await districtModal.clickSave();
    await districtModal.waitForClosed();
  });

  await test.step('Проверяем изменения в таблице', async () => {
    await expect(addressPage.getDistrictCell(oldName)).not.toBeVisible();
    await addressPage.waitForDistrictInTable(newName);
  });

  await test.step('Делаем скриншот после редактирования', async () => {
    await page.screenshot({
      path: `tests/tests/screenshots/05-после-редактирования-${newName}.png`,
      fullPage: false,
    });
  });
});

test('Удаление района с подтверждением в окне', async ({ page }) => {
  let districtName;

  await test.step('Создаём район для удаления', async () => {
    districtName = districtNames.generateForDeletion();
    await addressPage.createDistrict(districtName);
  });

  await test.step('Делаем скриншот созданного района', async () => {
    await page.screenshot({ path: 'tests/tests/screenshots/06-создан-для-удаления.png' });
  });

  await test.step('Выбираем район для удаления', async () => {
    await addressPage.selectDistrictCheckbox(districtName);
  });

  await test.step('Нажимаем кнопку удаления', async () => {
    await addressPage.clickDeleteSelectedButton();
  });

  await test.step('Подтверждаем удаление', async () => {
    await addressPage.confirmDeletion();
  });

  await test.step('Проверяем исчезновение района', async () => {
    await expect(addressPage.getDistrictCell(districtName)).not.toBeVisible();
  });

  await test.step('Делаем скриншот после удаления', async () => {
    await page.screenshot({ path: 'tests/tests/screenshots/07-после-удаления.png' });
  });
});

test('Отмена удаления района через окно подтверждения', async ({ page }) => {
  let districtName;

  await test.step('Создаём район для теста отмены', async () => {
    districtName = districtNames.generateForDeletion();
    await addressPage.createDistrict(districtName);
  });

  await test.step('Делаем скриншот созданного района', async () => {
    await page.screenshot({
      path: 'tests/tests/screenshots/08-создан-для-отмены-удаления.png',
    });
  });

  await test.step('Выбираем район и открываем окно удаления', async () => {
    await addressPage.selectDistrictCheckbox(districtName);
    await addressPage.clickDeleteSelectedButton();
  });

  await test.step('Нажимаем "Нет" в окне подтверждения', async () => {
    await addressPage.cancelDeletion();
  });

  await test.step('Проверяем, что окно закрылось', async () => {
    const confirmDialog = page.locator('[data-test-id="stack-yes-no"]');
    await expect(confirmDialog).not.toBeVisible();
  });

  await test.step('Проверяем, что район остался в таблице', async () => {
    await expect(addressPage.getDistrictCell(districtName)).toBeVisible();
  });

  await test.step('Делаем скриншот после отмены', async () => {
    await page.screenshot({
      path: `tests/tests/screenshots/09-после-отмены-удаления.png`,
    });
  });
});

test('Валидация: ошибка при вводе нецелого номера в поле "Номер в списке"', async ({ page }) => {
  await test.step('Открываем форму создания района', async () => {
    await addressPage.clickAddButton();
    await addressPage.selectDistrictFromDropdown();
  });

  await test.step('Заполняем название района', async () => {
    const districtName = districtNames.generateForInvalidNumber();
    await districtModal.fillName(districtName);
  });

  await test.step('Вводим нецелый номер (8.5)', async () => {
    await districtModal.clearNumber();
    await districtModal.fillNumber('8.5');
  });

  await test.step('Пытаемся сохранить', async () => {
    await districtModal.clickCreate();
  });

  await test.step('Проверяем сообщение об ошибке', async () => {
    const errorText = await districtModal.getToastError();
    expect(errorText).toContain('Нельзя привести Real к Int64');
    console.log(`Получена ошибка: ${errorText}`);
  });

  await test.step('Делаем скриншот ошибки', async () => {
    await page.screenshot({
      path: 'tests/tests/screenshots/10-ошибка-нецелый-номер.png',
    });
  });
});
