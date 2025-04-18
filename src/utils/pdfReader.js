import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.min.js';

export function readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

export async function readAsPDF(file) {
    try {
        const arrayBuffer = await readAsArrayBuffer(file);
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        return pdf;
    } catch (error) {
        console.error('Error reading PDF:', error);
        throw error;
    }
}

export async function extractTextFromPDF(pdf) {
    const numPages = pdf.numPages;
    const textByPage = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        textByPage.push(pageText);
    }

    return textByPage;
}