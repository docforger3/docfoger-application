package com.multipurpose.app.converter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Component
public class ExcelToPdfConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(inputBytes));
             PDDocument pdfDoc = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            float fontSize = 10f;
            float leading = 1.4f * fontSize;
            float margin = 40f;

            for (int sheetIdx = 0; sheetIdx < workbook.getNumberOfSheets(); sheetIdx++) {
                Sheet sheet = workbook.getSheetAt(sheetIdx);

                PDPage page = new PDPage(PDRectangle.A4);
                pdfDoc.addPage(page);

                float yPosition = page.getMediaBox().getHeight() - margin;

                PDPageContentStream contentStream = new PDPageContentStream(pdfDoc, page);

                // Sheet title
                contentStream.beginText();
                contentStream.setFont(boldFont, 14f);
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Sheet: " + sheet.getSheetName());
                contentStream.endText();
                yPosition -= 30f;

                // Process rows
                DataFormatter formatter = new DataFormatter();

                for (Row row : sheet) {
                    StringBuilder rowText = new StringBuilder();
                    for (Cell cell : row) {
                        String cellValue = formatter.formatCellValue(cell);
                        if (rowText.length() > 0) rowText.append("    |    ");
                        rowText.append(cellValue);
                    }

                    if (yPosition < margin + 20) {
                        contentStream.close();
                        page = new PDPage(PDRectangle.A4);
                        pdfDoc.addPage(page);
                        yPosition = page.getMediaBox().getHeight() - margin;
                        contentStream = new PDPageContentStream(pdfDoc, page);
                    }

                    contentStream.beginText();
                    contentStream.setFont(row.getRowNum() == 0 ? boldFont : font, fontSize);
                    contentStream.newLineAtOffset(margin, yPosition);

                    // Truncate long lines to fit page width
                    String text = rowText.toString();
                    float maxWidth = page.getMediaBox().getWidth() - 2 * margin;
                    float textWidth = font.getStringWidth(text) / 1000 * fontSize;
                    if (textWidth > maxWidth) {
                        int maxChars = (int) (text.length() * maxWidth / textWidth);
                        text = text.substring(0, Math.min(maxChars, text.length())) + "...";
                    }

                    contentStream.showText(text);
                    contentStream.endText();
                    yPosition -= leading;
                }

                contentStream.close();
            }

            pdfDoc.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "EXCEL_TO_PDF";
    }

    @Override
    public String getOutputExtension() {
        return ".pdf";
    }

    @Override
    public String getOutputMimeType() {
        return "application/pdf";
    }
}
