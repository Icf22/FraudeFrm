import { Frame, Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { RUTAS } from "../data/constantes";
import * as XLSX from 'xlsx';

export class FraudePage extends BasePage {
    txtReferencia: Locator;
    btnBuscar: Locator;
    lblCuenta: Locator;
    msgResultado: Locator;
    lblFechaFraude: Locator;
    selectFraude: string;
    selectIndCC: string;
    btnGrabar: Locator;
    growlMessage: string;
    txtComentarios: string;
    iframeSelector: string;

    constructor(page: Page) {
        super(page);
        this.txtReferencia = page.locator('#vCF_REFERENCIA');
        this.btnBuscar = page.locator('#BUSCAR');
        this.lblCuenta = page.locator('//span[@id="span_vNUM_CUENTA_MC_0001"]');
        this.txtComentarios = '#vVCOMENTARIOS';
        this.lblFechaFraude = page.locator('#vVL_FECHA_FRAUDE');
        this.selectFraude = '#vVL_TIP_FRA';
        this.selectIndCC = '#vVL_IND_CC';
        this.btnGrabar = page.locator('#GRABAR');
        this.growlMessage = '#growls-cc .growl-message';
        this.iframeSelector = '#RESULTADOFRAUDES';
    }

    async findReferencia() {
        try {
            const filePath = RUTAS.fraudesPorRegistrar;
            const workbook = XLSX.readFile(filePath);
            const worksheet = workbook.Sheets['fraudes_registrar'];

            const lastRow = XLSX.utils.sheet_to_json(worksheet).length + 1;

            for (let i = 2; i <= lastRow; i++) {
                try {
                    let referencia = worksheet['A' + i]?.w || '';
                    let fecha = worksheet['B' + 2]?.w || '';
                    console.log('referencia: ', referencia);
                    console.log('Fecha ', fecha);

                    if (referencia) {
                        await this.txtReferencia.fill(referencia);
                        await this.btnBuscar.click();

                        const iframeElement = await this.page.waitForSelector(this.iframeSelector);
                        const frame: Frame | null = await iframeElement.contentFrame();
                        if (frame) {
                            await frame.waitForSelector('#span_vNUM_CUENTA_MC_0001');
                            await frame.click('#span_vNUM_CUENTA_MC_0001');
                        } else {
                            console.error('No se pudo acceder al contenido del iframe');
                        }
                    }
                    await this.fillFraude(fecha, i);

                } catch (error) {
                    console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                    console.error("Error en la fila " + i + ":", error);
                }
            }
        } catch (error) {
            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
            console.error("Error al cargar el archivo de Excel", error);
        }
    }

    async fillFraude(fecha: string, i: number) {
        // Función para maximizar la ventana
        // const maximizeWindow = async () => {
        //     // Obtener el tamaño de la pantalla completa
        //     const { width, height } = await this.page.evaluate(() => {
        //         return { width: window.innerWidth, height: window.innerHeight };
        //     });
        //     // Establecer el tamaño de la ventana al tamaño de la pantalla completa
        //     await this.page.setViewportSize({ width, height });
        // };
        // // Maximizar la ventana antes de comenzar la operación
        // await maximizeWindow();

        const iframeElement = await this.page.waitForSelector(this.iframeSelector);
        const frame: Frame | null = await iframeElement.contentFrame();
        if (frame) {
            await this.page.waitForTimeout(1000);
            await this.page.waitForLoadState('domcontentloaded');
            await frame.waitForSelector(this.txtComentarios);
            await frame.fill('#vVL_FECHA_FRAUDE', fecha);
            await frame.fill(this.txtComentarios, 'Registro número: ' + i);

            console.log('entre al método fillFraude');
            await this.selectRandomFraudeOption(frame);
            await this.selectRandomIndCCOption(frame);
            console.log('Terminé de llenar los datos');
            await frame.click('#GRABAR');
            console.log('Le di click al botón grabar')
            await this.captureGrowlMessage(frame);
            console.log('termine el método que captura la pantalla')
            await this.page.waitForTimeout(1000);
            await this.page.reload();
        } else {
            console.error('No se pudo acceder al contenido del iframe');
        }
    }

    async selectRandomFraudeOption(frame: Frame) {
        await this.page.waitForTimeout(2000);
        const selectFraude = frame.locator(this.selectFraude);
        const options = await selectFraude.locator('option').all();
        const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
        const randomOption = options[randomIndex];

        const optionValue = await randomOption.getAttribute('value');
        if (optionValue) {
            await selectFraude.selectOption(optionValue);
        }
    }

    async selectRandomIndCCOption(frame: Frame) {
        await this.page.waitForTimeout(2000);
        const selectIndCC = frame.locator(this.selectIndCC);
        const options = await selectIndCC.locator('option').all();
        const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
        const randomOption = options[randomIndex];

        const optionValue = await randomOption.getAttribute('value');
        if (optionValue) {
            await selectIndCC.selectOption(optionValue);
        }
    }

    async captureGrowlMessage(frame: Frame) {
        const growlMessage = frame.locator(this.growlMessage);
        await growlMessage.waitFor({ state: 'visible' });

        const messageText = await growlMessage.textContent();
        const match = messageText?.match(/FOLIO NÚMERO: (\d+)/);
        if (match && match[1]) {
            const folioNumber = match[1];
            const screenshotPath = `./resources/fraude_folio_${folioNumber}.png`;

            const element = this.page.locator(this.iframeSelector);
            await element.screenshot({ path: screenshotPath });
            console.log(`Screenshot saved to ${screenshotPath}`);
        } else {
            console.error('No se pudo extraer el número de folio del mensaje.');
        }
    }
}
