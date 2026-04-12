package com.multipurpose.app.converter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
public class WordToPdfConverter implements DocumentConverter {

    private PDPageContentStream startNewPage(PDDocument pdfDoc, PDPage page, PDType1Font font, float fontSize, float margin) throws Exception {
        PDPageContentStream cs = new PDPageContentStream(pdfDoc, page);
        // Fill white background to avoid black page
        cs.setNonStrokingColor(Color.WHITE);
        cs.addRect(0, 0, page.getMediaBox().getWidth(), page.getMediaBox().getHeight());
        cs.fill();
        // Set text color to black
        cs.setNonStrokingColor(Color.BLACK);
        cs.beginText();
        cs.setFont(font, fontSize);
        cs.newLineAtOffset(margin, page.getMediaBox().getHeight() - margin);
        return cs;
    }

    private String sanitizeText(String text) {
        if (text == null) return "";
        return text
                .replace("\u2018", "'")
                .replace("\u2019", "'")
                .replace("\u201C", "\"")
                .replace("\u201D", "\"")
                .replace("\u2013", "-")
                .replace("\u2014", "--")
                .replace("\u2026", "...")
                .replace("\u00A0", " ")
                .replace("\t", "    ");
    }

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (XWPFDocument wordDoc = new XWPFDocument(new ByteArrayInputStream(inputBytes));
             PDDocument pdfDoc = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            float fontSize = 11f;
            float leading = 1.5f * fontSize;
            float margin = 50f;

            PDPage currentPage = new PDPage(PDRectangle.A4);
            pdfDoc.addPage(currentPage);

            float pageWidth = currentPage.getMediaBox().getWidth() - 2 * margin;
            float yPosition = currentPage.getMediaBox().getHeight() - margin;

            PDPageContentStream contentStream = startNewPage(pdfDoc, currentPage, font, fontSize, margin);

            List<XWPFParagraph> paragraphs = wordDoc.getParagraphs();

            for (XWPFParagraph para : paragraphs) {
                String text = sanitizeText(para.getText());

                // Check if we need a new page
                yPosition -= leading;
                if (yPosition < margin) {
                    contentStream.endText();
                    contentStream.close();

                    currentPage = new PDPage(PDRectangle.A4);
                    pdfDoc.addPage(currentPage);
                    yPosition = currentPage.getMediaBox().getHeight() - margin;

                    contentStream = startNewPage(pdfDoc, currentPage, font, fontSize, margin);
                }

                // Handle bold text
                boolean isBold = !para.getRuns().isEmpty() && para.getRuns().stream().anyMatch(r -> r.isBold());
                PDType1Font currentFont = isBold ? boldFont : font;
                contentStream.setFont(currentFont, fontSize);

                // Skip empty paragraphs (just add spacing)
                if (text.trim().isEmpty()) {
                    contentStream.newLineAtOffset(0, -leading);
                    continue;
                }

                // Word wrap
                String[] words = text.split(" ");
                StringBuilder line = new StringBuilder();

                for (String word : words) {
                    if (word.isEmpty()) continue;

                    String testLine = line.length() == 0 ? word : line + " " + word;
                    float textWidth = currentFont.getStringWidth(testLine) / 1000 * fontSize;

                    if (textWidth > pageWidth && line.length() > 0) {
                        contentStream.showText(line.toString());
                        contentStream.newLineAtOffset(0, -leading);
                        yPosition -= leading;

                        if (yPosition < margin) {
                            contentStream.endText();
                            contentStream.close();

                            currentPage = new PDPage(PDRectangle.A4);
                            pdfDoc.addPage(currentPage);
                            yPosition = currentPage.getMediaBox().getHeight() - margin;

                            contentStream = startNewPage(pdfDoc, currentPage, currentFont, fontSize, margin);
                        }

                        line = new StringBuilder(word);
                    } else {
                        line = new StringBuilder(testLine);
                    }
                }

                if (line.length() > 0) {
                    contentStream.showText(line.toString());
                }
                contentStream.newLineAtOffset(0, -leading);
            }

            contentStream.endText();
            contentStream.close();

            pdfDoc.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "WORD_TO_PDF";
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
