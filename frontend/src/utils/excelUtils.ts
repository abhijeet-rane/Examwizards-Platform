import * as XLSX from 'xlsx';

/**
 * Parses an Excel file and returns a list of emails from the first column.
 * @param file The uploaded file (File object)
 * @returns Promise<string[]>
 */
export async function parseEmailsFromExcel(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<{ email: string }>(worksheet, { header: 1 });
      // Flatten and filter for valid emails in the first column
      const emails = (json as string[][])
        .map(row => (row && row[0] ? row[0].toString().trim() : ''))
        .filter(email => /.+@.+\..+/.test(email));
      resolve(emails);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
