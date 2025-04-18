import download from 'downloadjs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { readAsArrayBuffer } from './pdfReader';

export async function save(pdfFile, objects, name, pagesScale) {
    try {
        const pdfBuffer = await readAsArrayBuffer(pdfFile);
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const pages = pdfDoc.getPages();

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            const page = pages[pageIndex];
            const { height } = page.getSize();
            const scale = pagesScale[pageIndex] || 1;

            objects[pageIndex].forEach((object) => {
                if (object.type === 'drawing') {
                    page.drawSvgPath(object.path, {
                        borderWidth: 5,
                        scale: object.scale,
                        x: object.x,
                        y: height - object.y,
                    });
                } else if (['text', 'signature', 'number', 'email'].includes(object.type)) {
                    page.drawText(object.text, {
                        x: object.x,
                        y: height - object.y - object.size,
                        size: object.size,
                        font: timesRomanFont,
                    });
                }
            });
        }

        const pdfBytes = await pdfDoc.save();
        download(pdfBytes, name, 'application/pdf');
    } catch (e) {
        console.log('Failed to save PDF:', e);
        throw e;
    }
}