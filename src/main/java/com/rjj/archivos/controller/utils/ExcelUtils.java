package com.rjj.archivos.controller.utils;

import org.apache.poi.ss.usermodel.*;
import java.io.InputStream;

public class ExcelUtils {
public static double extraerTotalNomina(InputStream is) {
    try (Workbook workbook = WorkbookFactory.create(is)) {
        Sheet sheet = workbook.getSheetAt(0);
        // El evaluador es el que resuelve las fórmulas (sumas, restas, etc.)
        FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell != null && cell.getCellType() == CellType.STRING) {
                    String texto = cell.getStringCellValue().trim();
                    
                    // busca la palabra total en el excel
                    if (texto.equalsIgnoreCase("TOTAL")) {
                        
                        // Buscamos en las siguientes 2 celdas a la derecha
                        for (int i = 1; i <= 2; i++) {
                            Cell valorCell = row.getCell(cell.getColumnIndex() + i);
                            if (valorCell != null) {
                                // Evaluamos la celda (si es fórmula, saca el resultado)
                                CellValue cellValue = evaluator.evaluate(valorCell);
                                
                                if (cellValue != null && cellValue.getCellType() == CellType.NUMERIC) {
                                    return cellValue.getNumberValue();
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (Exception e) {
        System.err.println("Error al evaluar la fórmula del Excel: " + e.getMessage());
    }
    return 0.0;
}
}