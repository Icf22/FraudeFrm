import {test} from "@playwright/test";
import {FraudePage} from "../page/fraude.page";
import {BasePage} from "../page/base.page"
import { MainPage } from "../page/main.page";


test.use({ignoreHTTPSErrors: true});
test('fillReferences', async ({page}) => {
    const basePage = new BasePage(page);
    const mainPage = new MainPage(page);
    const fraudePage = new FraudePage(page);
    await basePage.iniciarSesion();
    await mainPage.capturarFraudes();
    await fraudePage.findReferencia();
 })
 