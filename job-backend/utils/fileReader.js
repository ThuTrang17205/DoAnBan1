// utils/fileReader.js
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Đọc file PDF
 * @param {String} filePath
 * @returns {Promise<String>}
 */
async function readPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer); 
    return data.text || '';
  } catch (error) {
    console.error('Error reading PDF:', error.message);
    throw new Error(`Could not read PDF file: ${error.message}`);
  }
}

/**
 * Đọc file DOCX
 * @param {String} filePath
 * @returns {Promise<String>}
 */
async function readDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error('Error reading DOCX:', error.message);
    throw new Error(`Could not read DOCX file: ${error.message}`);
  }
}

/**
 * Đọc file CV (auto detect)
 * @param {String} filePath
 * @returns {Promise<String>}
 */
async function readCV(filePath) {
  const ext = filePath.toLowerCase();
  
  if (ext.endsWith('.pdf')) {
    return await readPDF(filePath);
  }
  
  if (ext.endsWith('.docx') || ext.endsWith('.doc')) {
    return await readDOCX(filePath);
  }
  
  throw new Error(`Unsupported file format: ${ext}`);
}

module.exports = {
  readPDF,
  readDOCX,
  readCV
};