package com.multipurpose.app.controller;

import com.multipurpose.app.model.ConversionHistory;
import com.multipurpose.app.service.ConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ConversionController {

    private final ConversionService conversionService;

    /**
     * Convert a file to the specified format.
     * 
     * @param file           the file to convert
     * @param conversionType the conversion type (e.g., PDF_TO_WORD, WORD_TO_PDF)
     * @return the converted file as a downloadable response
     */
    @PostMapping("/convert")
    public ResponseEntity<byte[]> convert(
            @RequestParam("file") MultipartFile[] files,
            @RequestParam("conversionType") String conversionType) {

        if (files == null || files.length == 0 || files[0].isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Received conversion request: type={}, fileCount={}",
                conversionType, files.length);

        ConversionService.ConversionResult result = conversionService.convert(files, conversionType);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType(result.mimeType()))
                .contentLength(result.data().length)
                .body(result.data());
    }

    /**
     * Get the list of supported conversion types.
     */
    @GetMapping("/conversions/types")
    public ResponseEntity<List<Map<String, String>>> getSupportedTypes() {
        return ResponseEntity.ok(conversionService.getSupportedConversions());
    }

    /**
     * Get recent conversion history.
     */
    @GetMapping("/conversions")
    public ResponseEntity<List<ConversionHistory>> getHistory() {
        return ResponseEntity.ok(conversionService.getRecentHistory());
    }

    /**
     * Get conversion statistics.
     */
    @GetMapping("/conversions/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(conversionService.getStatistics());
    }
}
