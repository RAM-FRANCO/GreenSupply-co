import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { format } from 'date-fns';

interface Column {
    header: string;
    dataKey: string;
}

interface ExportToPdfOptions {
    title: string;
    columns: Column[];
    data: Record<string, unknown>[];
    filename?: string;
}

export const exportToPdf = ({ title, columns, data, filename }: ExportToPdfOptions) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo Text: GreenSupply (Bold) IMS (Green, Normal)
    const logoPart1 = "GreenSupply ";
    const logoPart2 = "IMS";

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const width1 = doc.getTextWidth(logoPart1);

    doc.setFont("helvetica", "normal");
    const width2 = doc.getTextWidth(logoPart2);

    const totalWidth = width1 + width2;
    const startX = (pageWidth - totalWidth) / 2;

    // Draw "GreenSupply"
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Black
    doc.text(logoPart1, startX, 20);

    // Draw "IMS"
    doc.setFont("helvetica", "normal");
    doc.setTextColor(46, 125, 50); // Green
    doc.text(logoPart2, startX + width1, 20);

    // Report Title (Centered)
    doc.setTextColor(0, 0, 0); // Black
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 30);

    // Add Date (Centered)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100); // Gray
    const dateText = `Generated on: ${format(new Date(), 'PPpp')}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, (pageWidth - dateWidth) / 2, 36);

    // Add Table
    autoTable(doc, {
        startY: 45,
        head: [columns.map((col) => col.header)],
        body: data.map((row) => columns.map((col) => String(row[col.dataKey]))),
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50] }, // Green color to match theme
    } as UserOptions);

    // Save
    doc.save(filename || `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
