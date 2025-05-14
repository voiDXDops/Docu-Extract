
// Document types we can detect
type DocumentType = 'Aadhaar' | 'PAN' | 'Passport' | 'Driver\'s License' | 'Voter ID' | 'Other';

// Interface for our standardized document output
interface FormattedDocument {
  document_type?: string;
  name?: string;
  D_O_B?: string; // Date of Birth in DD-MM-YYYY format
  document_number?: string;
  nationality?: string;
  issuing_authority?: string;
  phone_number?: string;
  address?: string;
  issue_date?: string; // In DD-MM-YYYY format
  place_of_issue?: string;
}

export function formatDocumentData(rawData: any): FormattedDocument {
  // Check if the data is already in the expected format
  if (!rawData) return {};

  const formattedData: FormattedDocument = {};

  // Copy and clean standard fields
  if (rawData.document_type) {
    formattedData.document_type = cleanDocumentType(rawData.document_type);
  }

  if (rawData.name) {
    formattedData.name = rawData.name.trim();
  }

  if (rawData.document_number || 
      rawData.aadhaar_number || 
      rawData.pan_number || 
      rawData.passport_number) {
    formattedData.document_number = 
      rawData.document_number || 
      rawData.aadhaar_number || 
      rawData.pan_number || 
      rawData.passport_number;
  }

  if (rawData.nationality) {
    formattedData.nationality = rawData.nationality.trim();
  }

  if (rawData.issuing_authority) {
    formattedData.issuing_authority = rawData.issuing_authority.trim();
  }

  if (rawData.phone_number) {
    formattedData.phone_number = rawData.phone_number.trim();
  }

  if (rawData.address) {
    formattedData.address = rawData.address.trim();
  }

  if (rawData.place_of_issue) {
    formattedData.place_of_issue = rawData.place_of_issue.trim();
  }

  // Format dates properly
  if (rawData.D_O_B || rawData.D_O_B || rawData.date_of_birth) {
    formattedData.D_O_B = formatDate(rawData.D_O_B || rawData.date_of_birth);
  }

  if (rawData.issue_date) {
    formattedData.issue_date = formatDate(rawData.issue_date);
  }

  // Use nested sections if present (for complex responses)
  if (rawData.sections) {
    extractFromSections(rawData.sections, formattedData);
  }

  // Handle Aadhaar-specific fields
  if (formattedData.document_type === 'Aadhaar' && !formattedData.issuing_authority) {
    formattedData.issuing_authority = 'Govt of India';
  }

  if (!formattedData.nationality && (
      formattedData.document_type === 'Aadhaar' || 
      formattedData.document_type === 'PAN')) {
    formattedData.nationality = 'Indian';
  }

  return formattedData;
}

function cleanDocumentType(docType: string): string {
  // Normalize document types
  const lowerDocType = docType.toLowerCase().trim();
  
  if (lowerDocType.includes('aadhaar') || lowerDocType.includes('aadhar')) {
    return 'Aadhaar';
  } else if (lowerDocType.includes('pan')) {
    return 'PAN';
  } else if (lowerDocType.includes('passport')) {
    return 'Passport';
  } else if (lowerDocType.includes('driver') && lowerDocType.includes('license')) {
    return 'Driver\'s License';
  } else if (lowerDocType.includes('voter')) {
    return 'Voter ID';
  } else {
    return docType; // Return as-is if we don't recognize it
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // Already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // Handle DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString.replace(/\//g, '-');
  }
  
  // Try to parse using Date
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // Format to DD-MM-YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // If parsing fails, return original
    console.error("Date parsing error:", e);
  }
  
  return dateString;
}

function extractFromSections(sections: any[], formattedData: FormattedDocument): void {
  for (const section of sections) {
    // Extract from personal information section
    if (section.section_name?.toLowerCase().includes('personal')) {
      if (section.name && !formattedData.name) {
        formattedData.name = section.name.trim();
      }
      
      if (section.date_of_birth && !formattedData.D_O_B) {
        formattedData.D_O_B = formatDate(section.date_of_birth);
      }
    }
    
    // Extract from Aadhaar information section
    if (section.section_name?.toLowerCase().includes('aadhaar')) {
      if (section.aadhaar_number && !formattedData.document_number) {
        formattedData.document_number = section.aadhaar_number.trim();
      }
      
      if (!formattedData.document_type) {
        formattedData.document_type = 'Aadhaar';
      }
    }
    
    // Extract address information
    if (section.information) {
      for (const info of section.information) {
        if (info.field?.toLowerCase() === 'address' && info.value && !formattedData.address) {
          formattedData.address = info.value.trim();
        }
        
        if (info.field?.toLowerCase().includes('phone') && info.value && !formattedData.phone_number) {
          formattedData.phone_number = info.value.trim();
        }
      }
    }
    
    // Extract dates
    if (section.section_name?.toLowerCase().includes('date')) {
      if (section.issue_date && !formattedData.issue_date) {
        formattedData.issue_date = formatDate(section.issue_date);
      }
    }
  }
}
