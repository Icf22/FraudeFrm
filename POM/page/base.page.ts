import { Locator, Page } from "@playwright/test";
import { url, credentials } from "../data/constantes"

export class BasePage {
    page: Page;
    lblUser: Locator;
    lblPassword: Locator;
    btnEnter: Locator;
    
    constructor(page: Page) {
        this.page = page;
        //this.lblUser = page.getByRole('textbox', { name: 'vUSUARIO_CLAVE' });
        this.lblUser = page.locator('#vUSUARIO_CLAVE');
        this.lblPassword = page.locator('#vUSUARIO_PASSWORD');
        this.btnEnter = page.locator('#ENTER');
    }

    async iniciarSesion() {
        await this.page.goto(url.Fraude_bancoppel);
        //await this.lblUser.waitFor();
        await this.lblUser.fill(credentials.user_bancoppel);
        await this.lblPassword.fill(credentials.pass_bancoppel);
        await this.btnEnter.click();
    }

}