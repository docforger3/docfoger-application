package com.multipurpose.app.converter;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

@Component
public class HtmlToPdfConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        String htmlContent = new String(inputBytes, StandardCharsets.UTF_8);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            // Using fast mode to ignore complex CSS positioning if not needed and maximize speed
            builder.useFastMode();
            
            // Pass the HTML as string
            builder.withHtmlContent(htmlContent, "/");
            builder.toStream(out);
            builder.run();

            return out.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "HTML_TO_PDF";
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
