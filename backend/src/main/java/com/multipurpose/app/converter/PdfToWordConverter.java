package com.multipurpose.app.converter;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Component
public class PdfToWordConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (PDDocument pdfDocument = Loader.loadPDF(inputBytes);
             XWPFDocument wordDocument = new XWPFDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDFTextStripper stripper = new PDFTextStripper();
            int totalPages = pdfDocument.getNumberOfPages();

            for (int page = 1; page <= totalPages; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String pageText = stripper.getText(pdfDocument);

                // Add page header
                if (totalPages > 1) {
                    XWPFParagraph headerPara = wordDocument.createParagraph();
                    XWPFRun headerRun = headerPara.createRun();
                    headerRun.setBold(true);
                    headerRun.setFontSize(10);
                    headerRun.setColor("888888");
                    headerRun.setText("— Page " + page + " —");
                    headerRun.addBreak();
                }

                // Split by lines and create paragraphs
                String[] lines = pageText.split("\\r?\\n");
                for (String line : lines) {
                    XWPFParagraph paragraph = wordDocument.createParagraph();
                    XWPFRun run = paragraph.createRun();
                    run.setFontFamily("Calibri");
                    run.setFontSize(11);
                    run.setText(line);
                }

                // Add page break between pages (except last)
                if (page < totalPages) {
                    XWPFParagraph breakPara = wordDocument.createParagraph();
                    breakPara.setPageBreak(true);
                }
            }

            wordDocument.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "PDF_TO_WORD";
    }

    @Override
    public String getOutputExtension() {
        return ".docx";
    }

    @Override
    public String getOutputMimeType() {
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
}
