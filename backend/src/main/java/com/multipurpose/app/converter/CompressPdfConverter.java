package com.multipurpose.app.converter;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdfwriter.compress.CompressParameters;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
public class CompressPdfConverter implements DocumentConverter {

    @Override
    public byte[] convert(byte[] inputBytes, String originalFileName) throws Exception {
        try (PDDocument document = Loader.loadPDF(inputBytes);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Save the document with compression parameters
            // This attempts to compress object streams and internal elements significantly
            document.save(out, CompressParameters.DEFAULT_COMPRESSION);

            return out.toByteArray();
        }
    }

    @Override
    public String getConversionType() {
        return "COMPRESS_PDF";
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
