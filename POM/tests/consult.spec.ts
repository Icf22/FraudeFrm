import {test} from "@playwright/test";
import {ReporteFraude} from "../page/reporteFraude.page";
import {BasePage} from "../page/base.page"
import { MainPage } from "../page/main.page";


test.use({ignoreHTTPSErrors: true});
test('obtenerFraudesRegistrados', async ({page}) => {
    const basePage = new BasePage(page);
    const mainPage = new MainPage(page);
    const reporteFraude = new ReporteFraude(page);
    await basePage.iniciarSesion();
    await mainPage.obtenerFraudes();
    await reporteFraude.consultarFraudes();
 })
 