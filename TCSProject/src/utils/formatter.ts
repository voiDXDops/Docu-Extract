// Updated formatter.ts
type DocumentType = 'Aadhaar' | 'PAN' | 'Passport' | 'Driver\'s License' | 'Voter ID' | 'Other';

interface FormattedDocument {
  document_type?: string;
  name?: string;
  D_O_B?: string;
  document_number?: string;
  nationality?: string;
  issuing_authority?: string;
  phone_number?: string;
  address?: string;
  issue_date?: string;
  place_of_issue?: string;
}

export function formatDocumentData(rawData: any): FormattedDocument {
  if (!rawData) return {};

  const formattedData: FormattedDocument = {};

  // Copy and clean standard fields
  if (rawData.document_type) {
    formattedData.document_type = cleanDocumentType(rawData.document_type);
  }

  if (rawData.name) {
    formattedData.name = rawData.name.trim();
  }

  if (
    rawData.document_number ||
    rawData.aadhaar_number ||
    rawData.pan_number ||
    rawData.passport_number
  ) {
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

  // ✨ Improved DOB field checks
  const dobCandidate = rawData.D_O_B || rawData.dob || rawData.date_of_birth || rawData.birth_date || rawData['Date of Birth'];
  if (dobCandidate) {
    formattedData.D_O_B = formatDate(dobCandidate);
  }

  if (rawData.issue_date) {
    formattedData.issue_date = formatDate(rawData.issue_date);
  }

  // Extract from sections
  if (rawData.sections) {
    extractFromSections(rawData.sections, formattedData);
  }

  // Aadhaar-specific inference
  if (formattedData.document_type === 'Aadhaar' && !formattedData.issuing_authority) {
    formattedData.issuing_authority = 'Govt of India';
  }

  if (!formattedData.nationality && ['Aadhaar', 'PAN'].includes(formattedData.document_type || '')) {
    formattedData.nationality = 'Indian';
  }

  return formattedData;
}

function cleanDocumentType(docType: string): string {
  const lower = docType.toLowerCase();
  if (lower.includes('aadhaar') || lower.includes('aadhar')) return 'Aadhaar';
  if (lower.includes('pan')) return 'PAN';
  if (lower.includes('passport')) return 'Passport';
  if (lower.includes('driver') && lower.includes('license')) return 'Driver\'s License';
  if (lower.includes('voter')) return 'Voter ID';
  return docType;
}

function formatDate(dateString: string): string {
  if (!dateString) return '';

  // Convert common formats to DD-MM-YYYY
  dateString = dateString.replace(/\//g, '-').trim();

  // Match DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return dateString;

  // Try parsing
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return dateString;
}

// 🧠 Improved extractFromSections
function extractFromSections(sections: any[], formattedData: FormattedDocument): void {
  for (const section of sections) {
    const sectionName = section.section_name?.toLowerCase() || '';

    if (sectionName.includes('personal')) {
      if (section.name && !formattedData.name) {
        formattedData.name = section.name.trim();
      }

      if (section.date_of_birth && !formattedData.D_O_B) {
        formattedData.D_O_B = formatDate(section.date_of_birth);
      }
    }

    if (sectionName.includes('aadhaar')) {
      if (section.aadhaar_number && !formattedData.document_number) {
        formattedData.document_number = section.aadhaar_number.trim();
      }
      if (!formattedData.document_type) {
        formattedData.document_type = 'Aadhaar';
      }
    }

    if (Array.isArray(section.information)) {
      for (const info of section.information) {
        const field = info.field?.toLowerCase();
        const value = info.value?.trim();

        if (!field || !value) continue;

        if (field === 'address' && !formattedData.address) {
          formattedData.address = value;
        }

        if (field.includes('phone') && !formattedData.phone_number) {
          formattedData.phone_number = value;
        }

        if (
          (field.includes('dob') || field.includes('birth')) &&
          !formattedData.D_O_B
        ) {
          formattedData.D_O_B = formatDate(value);
        }

        if (field.includes('issue') && !formattedData.issue_date) {
          formattedData.issue_date = formatDate(value);
        }

        if (field.includes('place') && !formattedData.place_of_issue) {
          formattedData.place_of_issue = value;
        }
      }
    }
  }
}
