package com.multipurpose.app.converter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Component
public class PptxToPdfConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (ByteArrayInputStream is = new ByteArrayInputStream(inputBytes);
             XMLSlideShow ppt = new XMLSlideShow(is);
             PDDocument pdf = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Dimension pgsize = ppt.getPageSize();
            float width = (float) pgsize.getWidth();
            float height = (float) pgsize.getHeight();

            for (XSLFSlide slide : ppt.getSlides()) {
                // Render slide to an image off-screen
                BufferedImage img = new BufferedImage((int)width, (int)height, BufferedImage.TYPE_INT_RGB);
                Graphics2D graphics = img.createGraphics();
                
                // Set best quality rendering hints
                graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
                graphics.setRenderingHint(RenderingHints.KEY_FRACTIONALMETRICS, RenderingHints.VALUE_FRACTIONALMETRICS_ON);
                
                graphics.setPaint(Color.white);
                graphics.fill(new java.awt.geom.Rectangle2D.Float(0, 0, width, height));

                // Draw PowerPoint slide onto Graphics2D
                slide.draw(graphics);

                // Add to PDF
                PDPage page = new PDPage(new PDRectangle(width, height));
                pdf.addPage(page);

                PDImageXObject pdImage = LosslessFactory.createFromImage(pdf, img);

                try (PDPageContentStream contentStream = new PDPageContentStream(pdf, page)) {
                    contentStream.drawImage(pdImage, 0, 0, width, height);
                }
            }

            pdf.save(out);
            return out.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "PPTX_TO_PDF";
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
