
import { callGeminiAPI } from './api';
import { toast } from 'sonner';
import { formatDocumentData } from './formatter';

export async function extractDocumentInfo(file: File): Promise<any> {
  try {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_APP_API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing. Please check your environment variables.");
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Call the Gemini API
    const rawExtractedData = await callGeminiAPI(
      base64Data, 
      file.type,
      apiKey
    );
    
    // Format the extracted data to match the required structure
    const formattedData = formatDocumentData(rawExtractedData);
    
    return formattedData;
  } catch (error: any) {
    if (error.message.includes("rate limit")) {
      toast.error("API rate limit exceeded. Please try again later.");
    } else {
      toast.error(error.message || "Failed to extract document information");
    }
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}
