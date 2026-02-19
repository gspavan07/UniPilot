import csv from "csv-parser";
import fs from "fs";
import xlsx from "xlsx";
import logger from "./logger.js";

/**
 * File Importer Utility
 * Parses CSV and Excel files into JSON objects
 */
class Importer {
  /**
   * Parse CSV file
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Array>} - Array of objects
   */
  static async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error) => {
          logger.error("CSV Parsing Error:", error);
          reject(error);
        });
    });
  }

  /**
   * Parse Excel file
   * @param {string} filePath - Path to the Excel file
   * @returns {Promise<Array>} - Array of objects
   */
  static async parseExcel(filePath) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      return xlsx.utils.sheet_to_json(sheet);
    } catch (error) {
      logger.error("Excel Parsing Error:", error);
      throw error;
    }
  }

  /**
   * Parse file based on extension
   * @param {string} filePath - Path to the file
   * @returns {Promise<Array>} - Array of objects
   */
  static async parse(filePath) {
    const extension = filePath.split(".").pop().toLowerCase();

    if (extension === "csv") {
      return this.parseCSV(filePath);
    } else if (extension === "xlsx" || extension === "xls") {
      return this.parseExcel(filePath);
    } else {
      throw new Error("Unsupported file format. Please use CSV or Excel.");
    }
  }
}

export default Importer;
