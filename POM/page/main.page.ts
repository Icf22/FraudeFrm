import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
export class MainPage extends BasePage{
    btnCapturas: Locator;
    lblFraudes: Locator;
    lblConsultaFraudes: Locator;
    btnReporteFraudes: Locator;


    constructor(page: Page){
        super(page);
        this.btnCapturas =  page.getByText('Capturas');
        this.lblFraudes = page.locator('ul.sub a[href="com.portalemisor.fraudes"]');

        this.btnReporteFraudes =  page.getByText('Reportes');
        this.lblConsultaFraudes = page.locator('ul.sub a[href="com.portalemisor.consultafraudes"]');
    }

    async capturarFraudes(){
        await this.btnCapturas.click();
        await this.lblFraudes.click();
        await this.page.waitForTimeout(4000);
    }

    async obtenerFraudes(){
       await this.btnReporteFraudes.click();
       await this.lblConsultaFraudes.click();
       //await this.page.waitForTimeout(4000);
    }

}