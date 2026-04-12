package com.multipurpose.app.converter;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

@Component
public class PdfToImageConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (PDDocument pdfDocument = Loader.loadPDF(inputBytes);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDFRenderer renderer = new PDFRenderer(pdfDocument);
            int totalPages = pdfDocument.getNumberOfPages();

            if (totalPages == 1) {
                // Single page: render as single image
                BufferedImage image = renderer.renderImageWithDPI(0, 200, ImageType.RGB);
                ImageIO.write(image, "PNG", outputStream);
            } else {
                // Multiple pages: stitch them vertically
                BufferedImage[] images = new BufferedImage[totalPages];
                int totalHeight = 0;
                int maxWidth = 0;

                for (int i = 0; i < totalPages; i++) {
                    images[i] = renderer.renderImageWithDPI(i, 150, ImageType.RGB);
                    totalHeight += images[i].getHeight();
                    maxWidth = Math.max(maxWidth, images[i].getWidth());
                }

                // Add spacing between pages
                int spacing = 20;
                totalHeight += spacing * (totalPages - 1);

                BufferedImage combined = new BufferedImage(maxWidth, totalHeight, BufferedImage.TYPE_INT_RGB);
                java.awt.Graphics2D g2d = combined.createGraphics();

                // White background
                g2d.setColor(java.awt.Color.WHITE);
                g2d.fillRect(0, 0, maxWidth, totalHeight);

                int yOffset = 0;
                for (int i = 0; i < totalPages; i++) {
                    int xOffset = (maxWidth - images[i].getWidth()) / 2;
                    g2d.drawImage(images[i], xOffset, yOffset, null);
                    yOffset += images[i].getHeight() + spacing;
                }
                g2d.dispose();

                ImageIO.write(combined, "PNG", outputStream);
            }

            return outputStream.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "PDF_TO_IMAGE";
    }

    @Override
    public String getOutputExtension() {
        return ".png";
    }

    @Override
    public String getOutputMimeType() {
        return "image/png";
    }
}
