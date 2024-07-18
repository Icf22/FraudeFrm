import { Frame, Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { RUTAS } from "../data/constantes";
import * as XLSX from 'xlsx';

export class ReporteFraude extends BasePage {
    txtFiltroReferencia: Locator;
    btnBuscar: Locator;
    iframeSelector: string;

    constructor(page: Page) {
        super(page);
        this.txtFiltroReferencia = page.locator('#vFILTROREFERENCIA');
        this.btnBuscar = page.locator('#BUSCAR');
        this.iframeSelector = '#RESULTADOFRAUDES';
    }

    async consultarFraudes() {
        try {
            const filePath = RUTAS.fraudesPorRegistrar;
            const workbook = XLSX.readFile(filePath);
            const worksheet = workbook.Sheets['fraudes_registrar'];

            const lastRow = XLSX.utils.sheet_to_json(worksheet).length + 1;

            for (let i = 2; i <= lastRow; i++) {
                try {
                    let referencia = worksheet['A' + i]?.w || '';
                    console.log('📋 Validando la referencia ', referencia, '...');

                    if (referencia) {
                        await this.page.waitForTimeout(2000);
                        await this.txtFiltroReferencia.fill(referencia);
                        await this.btnBuscar.waitFor();
                        await this.btnBuscar.click();
                        await this.page.waitForTimeout(4000);
                        await this.page.waitForLoadState('networkidle');
                        await this.page.waitForLoadState('domcontentloaded');

                        const iframeElement = await this.page.waitForSelector(this.iframeSelector);
                        const frame: Frame | null = await iframeElement.contentFrame();
                        if (frame) {
                            await frame.waitForSelector('#span_vC_STA_DESCRIPCION_0001');

                            const textoFraude = await frame.locator('#span_vC_STA_DESCRIPCION_0001').textContent();
                            if (textoFraude?.includes('FRAUDE REGISTRADO')) {
                                console.log(`✅ La referencia ${referencia} se encuentra registrada.\n`);
                            } else {
                                const textoSinResultados = await frame.locator('#TEXTBLOCK1').textContent();
                                if (textoSinResultados?.includes('Sin resultados, verifique su información.')) {
                                    console.log(`❌La referencia ${referencia} no se encuentra registrada.`);
                                }
                            }
                        } else {
                            console.error('No se pudo acceder al contenido del iframe');
                        }
                    }

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
}