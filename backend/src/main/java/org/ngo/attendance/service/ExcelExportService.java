package org.ngo.attendance.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.ngo.attendance.dto.request.AttendanceFilterRequest;
import org.ngo.attendance.dto.response.AttendanceResponse;
import org.ngo.attendance.entity.AttendanceStatus;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelExportService {

    private final AttendanceService attendanceService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    public byte[] exportAttendance(AttendanceFilterRequest filter) {
        List<AttendanceResponse> records = attendanceService.getAllForExport(filter);

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance Report");

            // ── Styles ──────────────────────────────────────────
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle presentStyle = createStatusStyle(workbook, new byte[]{(byte)198, (byte)239, (byte)206});
            CellStyle absentStyle  = createStatusStyle(workbook, new byte[]{(byte)255, (byte)199, (byte)206});
            CellStyle dataStyle    = createDataStyle(workbook);
            CellStyle dateStyle    = createDataStyle(workbook);

            // ── Title Row ────────────────────────────────────────
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Teacher Attendance Report");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 6));
            titleRow.setHeightInPoints(30);

            // ── Sub-title: record count ──────────────────────────
            Row subRow = sheet.createRow(1);
            Cell subCell = subRow.createCell(0);
            subCell.setCellValue("Total Records: " + records.size());
            subCell.setCellStyle(dataStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 6));

            // ── Blank row ────────────────────────────────────────
            sheet.createRow(2);

            // ── Header Row ───────────────────────────────────────
            String[] headers = {
                "#", "Teacher Name", "Center", "Date", "Login Time", "Status", "Location"
            };
            Row headerRow = sheet.createRow(3);
            headerRow.setHeightInPoints(20);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // ── Data Rows ────────────────────────────────────────
            int rowNum = 4;
            int serial = 1;
            for (AttendanceResponse rec : records) {
                Row row = sheet.createRow(rowNum++);

                createCell(row, 0, String.valueOf(serial++), dataStyle);
                createCell(row, 1, rec.getTeacherName(), dataStyle);
                createCell(row, 2,
                    rec.getCenterName() != null ? rec.getCenterName() : "—", dataStyle);
                createCell(row, 3,
                    rec.getAttendanceDate() != null
                        ? rec.getAttendanceDate().format(DATE_FMT) : "—", dateStyle);
                createCell(row, 4,
                    rec.getLoginTime() != null
                        ? rec.getLoginTime().format(TIME_FMT) : "—", dataStyle);

                // Status cell with color
                Cell statusCell = row.createCell(5);
                statusCell.setCellValue(rec.getStatus().name());
                statusCell.setCellStyle(
                    rec.getStatus() == AttendanceStatus.PRESENT ? presentStyle : absentStyle
                );

                String location = (rec.getLatitude() != null && rec.getLongitude() != null)
                    ? rec.getLatitude() + ", " + rec.getLongitude()
                    : "—";
                createCell(row, 6, location, dataStyle);
            }

            // ── Summary section ──────────────────────────────────
            long presentCount = records.stream()
                .filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long absentCount  = records.stream()
                .filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

            sheet.createRow(rowNum++); // blank
            Row summaryHeader = sheet.createRow(rowNum++);
            Cell sh = summaryHeader.createCell(0);
            sh.setCellValue("Summary");
            sh.setCellStyle(headerStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 6));

            Row presentRow = sheet.createRow(rowNum++);
            createCell(presentRow, 0, "Total Present", dataStyle);
            createCell(presentRow, 1, String.valueOf(presentCount), presentStyle);

            Row absentRow = sheet.createRow(rowNum++);
            createCell(absentRow, 0, "Total Absent", dataStyle);
            createCell(absentRow, 1, String.valueOf(absentCount), absentStyle);

            Row totalRow = sheet.createRow(rowNum);
            createCell(totalRow, 0, "Grand Total", headerStyle);
            createCell(totalRow, 1, String.valueOf(records.size()), headerStyle);

            // ── Column widths ────────────────────────────────────
            sheet.setColumnWidth(0, 8 * 256);    // #
            sheet.setColumnWidth(1, 25 * 256);   // Name
            sheet.setColumnWidth(2, 20 * 256);   // Center
            sheet.setColumnWidth(3, 15 * 256);   // Date
            sheet.setColumnWidth(4, 15 * 256);   // Time
            sheet.setColumnWidth(5, 12 * 256);   // Status
            sheet.setColumnWidth(6, 30 * 256);   // Location

            // ── Freeze header ────────────────────────────────────
            sheet.createFreezePane(0, 4);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Excel export failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    // ── Style Helpers ─────────────────────────────────────────────

    private CellStyle createTitleStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(style);
        return style;
    }

    private CellStyle createStatusStyle(Workbook wb, byte[] rgb) {
        XSSFWorkbook xwb = (XSSFWorkbook) wb;
        org.apache.poi.xssf.usermodel.XSSFCellStyle style = xwb.createCellStyle();
        org.apache.poi.xssf.usermodel.XSSFColor color =
            new org.apache.poi.xssf.usermodel.XSSFColor(
                new java.awt.Color(rgb[0] & 0xFF, rgb[1] & 0xFF, rgb[2] & 0xFF), null
            );
        style.setFillForegroundColor(color);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorder(style);
        return style;
    }

    private CellStyle createDataStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(style);
        return style;
    }

    private void setBorder(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }
}
