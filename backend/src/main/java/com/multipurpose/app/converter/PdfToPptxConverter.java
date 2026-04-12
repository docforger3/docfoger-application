package com.multipurpose.app.converter;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.poi.sl.usermodel.PictureData;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFPictureData;
import org.apache.poi.xslf.usermodel.XSLFPictureShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.Dimension;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

@Component
public class PdfToPptxConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (PDDocument document = Loader.loadPDF(inputBytes);
             XMLSlideShow ppt = new XMLSlideShow();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDFRenderer pdfRenderer = new PDFRenderer(document);
            int pageCount = document.getNumberOfPages();
            
            // Assume the first page size is representative for the PPTX canvas size
            if (pageCount > 0) {
                BufferedImage firstPageImage = pdfRenderer.renderImageWithDPI(0, 72, ImageType.RGB);
                ppt.setPageSize(new Dimension(firstPageImage.getWidth(), firstPageImage.getHeight()));
            }

            for (int page = 0; page < pageCount; page++) {
                // Render at 150 DPI for a good balance of quality and size
                BufferedImage bim = pdfRenderer.renderImageWithDPI(page, 150, ImageType.RGB);
                
                ByteArrayOutputStream imgOut = new ByteArrayOutputStream();
                ImageIO.write(bim, "PNG", imgOut);
                
                XSLFPictureData pictureData = ppt.addPicture(imgOut.toByteArray(), PictureData.PictureType.PNG);
                XSLFSlide slide = ppt.createSlide();
                
                XSLFPictureShape pictureShape = slide.createPicture(pictureData);
                
                // Scale picture to fit the slide perfectly
                pictureShape.setAnchor(new Rectangle2D.Double(0, 0, ppt.getPageSize().getWidth(), ppt.getPageSize().getHeight()));
            }

            ppt.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "PDF_TO_PPTX";
    }

    @Override
    public String getOutputExtension() {
        return ".pptx";
    }

    @Override
    public String getOutputMimeType() {
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
}
