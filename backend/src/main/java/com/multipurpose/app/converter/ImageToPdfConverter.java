package com.multipurpose.app.converter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
public class ImageToPdfConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (PDDocument pdfDoc = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDImageXObject image = PDImageXObject.createFromByteArray(pdfDoc, inputBytes, originalFileName);

            // Calculate page size to fit the image
            float imgWidth = image.getWidth();
            float imgHeight = image.getHeight();

            // Use A4 as base, scale image to fit
            float pageWidth = PDRectangle.A4.getWidth();
            float pageHeight = PDRectangle.A4.getHeight();
            float margin = 30f;

            float availableWidth = pageWidth - 2 * margin;
            float availableHeight = pageHeight - 2 * margin;

            float scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
            if (scale > 1) scale = 1; // Don't upscale

            float scaledWidth = imgWidth * scale;
            float scaledHeight = imgHeight * scale;

            // Center the image on the page
            float xOffset = margin + (availableWidth - scaledWidth) / 2;
            float yOffset = margin + (availableHeight - scaledHeight) / 2;

            PDPage page = new PDPage(PDRectangle.A4);
            pdfDoc.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(pdfDoc, page)) {
                contentStream.drawImage(image, xOffset, yOffset, scaledWidth, scaledHeight);
            }

            pdfDoc.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "IMAGE_TO_PDF";
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
