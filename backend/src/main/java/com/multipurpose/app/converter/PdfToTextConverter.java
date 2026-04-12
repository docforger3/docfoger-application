package com.multipurpose.app.converter;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class PdfToTextConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (PDDocument pdfDocument = Loader.loadPDF(inputBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setLineSeparator("\n");
            stripper.setParagraphEnd("\n\n");
            stripper.setAddMoreFormatting(true);

            String text = stripper.getText(pdfDocument);
            return text.getBytes(StandardCharsets.UTF_8);
        }
    }

    @Override
    public String getConversionType() {
        return "PDF_TO_TEXT";
    }

    @Override
    public String getOutputExtension() {
        return ".txt";
    }

    @Override
    public String getOutputMimeType() {
        return "text/plain; charset=UTF-8";
    }
}
