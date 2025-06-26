import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import path from 'path';

export const getExcelData = async (req: Request, res: Response) => {
    try {
        // Read the Excel file from assets folder
        const excelPath = path.join(__dirname, '../../../assets/FeetFirstData.xlsx');
        const workbook = XLSX.readFile(excelPath);
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error reading Excel file:', error);
        res.status(500).json({
            success: false,
            message: 'Error reading Excel file'
        });
    }
};