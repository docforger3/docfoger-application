package com.multipurpose.app.converter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

@Component
public class TextToPdfConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        String text = new String(inputBytes, StandardCharsets.UTF_8);

        try (PDDocument pdfDoc = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            float fontSize = 11f;
            float leading = 1.5f * fontSize;
            float margin = 50f;

            PDPage currentPage = new PDPage(PDRectangle.A4);
            pdfDoc.addPage(currentPage);

            float pageWidth = currentPage.getMediaBox().getWidth() - 2 * margin;
            float yPosition = currentPage.getMediaBox().getHeight() - margin;

            PDPageContentStream contentStream = new PDPageContentStream(pdfDoc, currentPage);
            contentStream.beginText();
            contentStream.setFont(font, fontSize);
            contentStream.newLineAtOffset(margin, yPosition);

            String[] lines = text.split("\\r?\\n");

            for (String line : lines) {
                // Handle empty lines
                if (line.trim().isEmpty()) {
                    contentStream.newLineAtOffset(0, -leading);
                    yPosition -= leading;

                    if (yPosition < margin) {
                        contentStream.endText();
                        contentStream.close();
                        currentPage = new PDPage(PDRectangle.A4);
                        pdfDoc.addPage(currentPage);
                        yPosition = currentPage.getMediaBox().getHeight() - margin;
                        contentStream = new PDPageContentStream(pdfDoc, currentPage);
                        contentStream.beginText();
                        contentStream.setFont(font, fontSize);
                        contentStream.newLineAtOffset(margin, yPosition);
                    }
                    continue;
                }

                // Word wrap
                String[] words = line.split(" ");
                StringBuilder currentLine = new StringBuilder();

                for (String word : words) {
                    // Replace special characters that can't be encoded in WinAnsi
                    word = sanitizeText(word);
                    String testLine = currentLine.length() == 0 ? word : currentLine + " " + word;
                    float textWidth = font.getStringWidth(testLine) / 1000 * fontSize;

                    if (textWidth > pageWidth && currentLine.length() > 0) {
                        contentStream.showText(currentLine.toString());
                        contentStream.newLineAtOffset(0, -leading);
                        yPosition -= leading;

                        if (yPosition < margin) {
                            contentStream.endText();
                            contentStream.close();
                            currentPage = new PDPage(PDRectangle.A4);
                            pdfDoc.addPage(currentPage);
                            yPosition = currentPage.getMediaBox().getHeight() - margin;
                            contentStream = new PDPageContentStream(pdfDoc, currentPage);
                            contentStream.beginText();
                            contentStream.setFont(font, fontSize);
                            contentStream.newLineAtOffset(margin, yPosition);
                        }

                        currentLine = new StringBuilder(word);
                    } else {
                        currentLine = new StringBuilder(testLine);
                    }
                }

                if (currentLine.length() > 0) {
                    contentStream.showText(currentLine.toString());
                }
                contentStream.newLineAtOffset(0, -leading);
                yPosition -= leading;

                if (yPosition < margin) {
                    contentStream.endText();
                    contentStream.close();
                    currentPage = new PDPage(PDRectangle.A4);
                    pdfDoc.addPage(currentPage);
                    yPosition = currentPage.getMediaBox().getHeight() - margin;
                    contentStream = new PDPageContentStream(pdfDoc, currentPage);
                    contentStream.beginText();
                    contentStream.setFont(font, fontSize);
                    contentStream.newLineAtOffset(margin, yPosition);
                }
            }

            contentStream.endText();
            contentStream.close();

            pdfDoc.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    private String sanitizeText(String text) {
        // Replace characters not supported in WinAnsiEncoding
        return text
                .replace("\u2018", "'")
                .replace("\u2019", "'")
                .replace("\u201C", "\"")
                .replace("\u201D", "\"")
                .replace("\u2013", "-")
                .replace("\u2014", "--")
                .replace("\u2026", "...")
                .replace("\u00A0", " ");
    }

    @Override
    public String getConversionType() {
        return "TEXT_TO_PDF";
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
