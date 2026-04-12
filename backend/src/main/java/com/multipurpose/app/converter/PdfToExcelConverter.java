package com.multipurpose.app.converter;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
public class PdfToExcelConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (PDDocument pdfDocument = Loader.loadPDF(inputBytes);
             Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDFTextStripper stripper = new PDFTextStripper();
            int totalPages = pdfDocument.getNumberOfPages();

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            for (int page = 1; page <= totalPages; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String pageText = stripper.getText(pdfDocument);

                Sheet sheet = workbook.createSheet("Page " + page);
                String[] lines = pageText.split("\\r?\\n");

                // Add header row
                Row headerRow = sheet.createRow(0);
                Cell headerCell = headerRow.createCell(0);
                headerCell.setCellValue("Content from Page " + page);
                headerCell.setCellStyle(headerStyle);

                int rowNum = 1;
                for (String line : lines) {
                    if (!line.trim().isEmpty()) {
                        Row row = sheet.createRow(rowNum++);

                        // Try to split by common delimiters (tab, |, multiple spaces)
                        String[] cells;
                        if (line.contains("\t")) {
                            cells = line.split("\t");
                        } else if (line.contains("|")) {
                            cells = line.split("\\|");
                        } else if (line.matches(".*\\s{3,}.*")) {
                            cells = line.split("\\s{3,}");
                        } else {
                            cells = new String[]{line};
                        }

                        for (int col = 0; col < cells.length; col++) {
                            Cell cell = row.createCell(col);
                            String value = cells[col].trim();

                            // Try to parse as number
                            try {
                                double numValue = Double.parseDouble(value);
                                cell.setCellValue(numValue);
                            } catch (NumberFormatException e) {
                                cell.setCellValue(value);
                            }
                        }
                    }
                }

                // Auto-size columns
                for (int col = 0; col < 10; col++) {
                    sheet.autoSizeColumn(col);
                }
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "PDF_TO_EXCEL";
    }

    @Override
    public String getOutputExtension() {
        return ".xlsx";
    }

    @Override
    public String getOutputMimeType() {
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
}
