package com.multipurpose.app.converter;

/**
 * Interface for all document converters.
 * Each converter handles a specific conversion type (e.g., PDF to Word).
 */
public interface DocumentConverter {

    /**
     * Convert the input file bytes to the target format.
     *
     * @param inputBytes the raw bytes of the input file
     * @param originalFileName the original file name (for extension detection)
     * @return the converted file bytes
     * @throws Exception if conversion fails
     */
    byte[] convert(byte[] inputBytes, String originalFileName) throws Exception;

    /**
     * Get the conversion type identifier (e.g., "PDF_TO_WORD").
     */
    String getConversionType();

    /**
     * Get the output file extension (e.g., ".docx").
     */
    String getOutputExtension();

    /**
     * Get the MIME type for the output file.
     */
    String getOutputMimeType();
}
