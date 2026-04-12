package com.multipurpose.app.service;

import com.multipurpose.app.converter.DocumentConverter;
import com.multipurpose.app.model.ConversionHistory;
import com.multipurpose.app.repository.ConversionHistoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;

@Service
@Slf4j
public class ConversionService {

    private final Map<String, DocumentConverter> converterMap;
    private final ConversionHistoryRepository historyRepository;

    public ConversionService(List<DocumentConverter> converters,
                             ConversionHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
        this.converterMap = converters.stream()
                .collect(Collectors.toMap(
                        DocumentConverter::getConversionType,
                        converter -> converter
                ));
        log.info("Registered {} document converters: {}", converterMap.size(), converterMap.keySet());
    }

    /**
     * Convert files to the specified target format.
     */
    public ConversionResult convert(MultipartFile[] files, String conversionType) {
        String type = conversionType.toUpperCase();

        if ("MERGE_PDF".equals(type)) {
            return performMerge(files);
        }

        MultipartFile file = files[0];
        DocumentConverter converter = converterMap.get(type);
        if (converter == null) {
            throw new IllegalArgumentException(
                    "Unsupported conversion type: " + conversionType +
                    ". Supported types: " + converterMap.keySet()
            );
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) originalFileName = "unknown";

        String baseName = originalFileName.contains(".")
                ? originalFileName.substring(0, originalFileName.lastIndexOf('.'))
                : originalFileName;
        String convertedFileName = baseName + converter.getOutputExtension();

        try {
            log.info("Starting conversion: {} -> {} (type: {})",
                    originalFileName, convertedFileName, conversionType);

            byte[] inputBytes = file.getBytes();
            byte[] outputBytes = converter.convert(inputBytes, originalFileName);

            // Log successful conversion
            saveHistory(originalFileName, convertedFileName, conversionType,
                    file.getSize(), "SUCCESS", null);

            log.info("Conversion successful: {} ({} bytes -> {} bytes)",
                    conversionType, inputBytes.length, outputBytes.length);

            return new ConversionResult(
                    outputBytes,
                    convertedFileName,
                    converter.getOutputMimeType()
            );

        } catch (Exception e) {
            log.error("Conversion failed: {} - {}", conversionType, e.getMessage(), e);

            // Log failed conversion
            saveHistory(originalFileName, convertedFileName, conversionType,
                    file.getSize(), "FAILED", e.getMessage());

            throw new RuntimeException("Conversion failed: " + e.getMessage(), e);
        }
    }

    private ConversionResult performMerge(MultipartFile[] files) {
        long totalSize = 0;
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDFMergerUtility merger = new PDFMergerUtility();
            merger.setDestinationStream(out);

            for (MultipartFile file : files) {
                totalSize += file.getSize();
                merger.addSource(new RandomAccessReadBuffer(file.getBytes()));
            }

            merger.mergeDocuments(org.apache.pdfbox.io.IOUtils.createMemoryOnlyStreamCache());

            byte[] outputBytes = out.toByteArray();
            String outputName = "merged_" + System.currentTimeMillis() + ".pdf";

            saveHistory("Multiple Files (" + files.length + ")", outputName, "MERGE_PDF",
                    totalSize, "SUCCESS", null);

            return new ConversionResult(outputBytes, outputName, "application/pdf");
        } catch (Exception e) {
            log.error("Merge PDF failed: {}", e.getMessage(), e);
            saveHistory("Multiple Files (" + files.length + ")", "unknown.pdf", "MERGE_PDF",
                    totalSize, "FAILED", e.getMessage());
            throw new RuntimeException("Merge PDF failed: " + e.getMessage(), e);
        }
    }

    /**
     * Get supported conversion types.
     */
    public List<Map<String, String>> getSupportedConversions() {
        List<Map<String, String>> supported = converterMap.values().stream()
                .map(c -> {
                    Map<String, String> info = new LinkedHashMap<>();
                    info.put("type", c.getConversionType());
                    info.put("outputExtension", c.getOutputExtension());
                    info.put("outputMimeType", c.getOutputMimeType());
                    return info;
                })
                .collect(Collectors.toList());

        // Add explicit MERGE_PDF as it isn't in converterMap interfaces explicitly
        Map<String, String> merge = new LinkedHashMap<>();
        merge.put("type", "MERGE_PDF");
        merge.put("outputExtension", ".pdf");
        merge.put("outputMimeType", "application/pdf");
        supported.add(merge);

        return supported;
    }

    /**
     * Get recent conversion history.
     */
    public List<ConversionHistory> getRecentHistory() {
        return historyRepository.findTop20ByOrderByCreatedAtDesc();
    }

    /**
     * Get conversion statistics.
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalConversions", historyRepository.count());
        stats.put("successfulConversions", historyRepository.countByStatus("SUCCESS"));
        stats.put("failedConversions", historyRepository.countByStatus("FAILED"));

        // Conversion type breakdown
        List<Object[]> typeCounts = historyRepository.countByConversionTypeGrouped();
        Map<String, Long> typeBreakdown = new LinkedHashMap<>();
        for (Object[] row : typeCounts) {
            typeBreakdown.put((String) row[0], (Long) row[1]);
        }
        stats.put("conversionsByType", typeBreakdown);

        return stats;
    }

    private void saveHistory(String originalName, String convertedName,
                             String conversionType, long fileSize,
                             String status, String errorMessage) {
        try {
            ConversionHistory history = ConversionHistory.builder()
                    .originalFileName(originalName)
                    .convertedFileName(convertedName)
                    .conversionType(conversionType)
                    .fileSize(fileSize)
                    .status(status)
                    .errorMessage(errorMessage)
                    .build();
            historyRepository.save(history);
        } catch (Exception e) {
            log.warn("Failed to save conversion history: {}", e.getMessage());
        }
    }

    /**
     * Result wrapper for conversions.
     */
    public record ConversionResult(byte[] data, String fileName, String mimeType) {}
}
