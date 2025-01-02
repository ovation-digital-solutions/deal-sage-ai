interface PropertyData {
  address: string;
  purchase_price: number;
  current_value: number;
  purchase_date: Date;
  notes?: string;
  [key: string]: string | number | Date | undefined;
}

export async function parseCSV(csvText: string) {
  // Split the CSV into lines
  const lines = csvText.split('\n');
  
  // Get headers from first line
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Parse each line into an object
  const properties = lines.slice(1)
    .filter(line => line.trim()) // Remove empty lines
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      const property: PropertyData = {
        address: '',
        purchase_price: 0,
        current_value: 0,
        purchase_date: new Date(),
      };
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Convert price strings to numbers
        if (header.includes('price') || header.includes('value')) {
          property[header] = parseFloat(value.replace(/[$,]/g, ''));
        }
        // Convert date strings to Date objects
        else if (header.includes('date')) {
          property[header] = new Date(value);
        }
        // Handle other string values
        else {
          property[header] = value;
        }
      });
      
      return property;
    });

  return properties;
}
