package com.chuanphat.warranty.dataio;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/data-io")
@PreAuthorize("hasAnyRole('ADMIN')")
public class DataIoController {
    private final DataIoService service;

    public DataIoController(DataIoService service) {
        this.service = service;
    }

    @GetMapping("/templates")
    @PreAuthorize("hasAnyAuthority('IMPORT_DATA','MANAGE_PERMISSIONS')")
    public ResponseEntity<byte[]> template(@RequestParam String dataType, @RequestParam(defaultValue = "xlsx") String format) {
        byte[] content = service.template(dataType, format);
        return file(content, "template-" + dataType + ("csv".equalsIgnoreCase(format) ? ".csv" : ".xlsx"), contentType(format));
    }

    @PostMapping("/imports")
    @PreAuthorize("hasAnyAuthority('IMPORT_DATA','MANAGE_PERMISSIONS')")
    public DataIoDtos.ImportResult importData(@RequestParam String dataType, @RequestParam MultipartFile file, @RequestParam(defaultValue = "true") boolean dryRun) {
        return service.importData(dataType, file, dryRun);
    }

    @PostMapping("/imports/error-file")
    @PreAuthorize("hasAnyAuthority('IMPORT_DATA','MANAGE_PERMISSIONS')")
    public ResponseEntity<byte[]> errorFile(@RequestParam String dataType, @RequestParam MultipartFile file) {
        return file(service.errorFile(dataType, file), "import-errors-" + dataType + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @GetMapping("/exports")
    @PreAuthorize("hasAnyAuthority('EXPORT_REPORT','REPORT_EXPORT')")
    public ResponseEntity<byte[]> export(@RequestParam String dataType, @RequestParam(required = false) Long branchId, @RequestParam(required = false) String keyword) {
        return file(service.exportData(dataType, branchId, keyword), "export-" + dataType + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @PostMapping("/files")
    @PreAuthorize("hasAnyAuthority('UPLOAD_FILE','PRODUCT_UPDATE','WARRANTY_MANAGE','SALES_CREATE','DELETE_DOCUMENT')")
    public DataIoDtos.UploadedFileResponse upload(@RequestParam MultipartFile file, @RequestParam(defaultValue = "GENERAL") String purpose) {
        return service.upload(file, purpose);
    }

    private ResponseEntity<byte[]> file(byte[] content, String fileName, String contentType) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(fileName).build().toString())
                .contentType(MediaType.parseMediaType(contentType))
                .body(content);
    }

    private String contentType(String format) {
        return "csv".equalsIgnoreCase(format) ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
}

