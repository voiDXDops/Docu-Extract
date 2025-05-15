
interface GenerateContentRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }>;
  }>;
  generationConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
  };
}

export async function callGeminiAPI(
  base64Data: string, 
  mimeType: string, 
  apiKey: string
): Promise<any> {
  try {
    // Using gemini-2.0-flash-lite for free tier with higher rate limits
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
    
    const requestBody: GenerateContentRequest = {
      contents: [
        {
          parts: [
            {
              text: `You are an intelligent document parser.

Extract ONLY the most important identity information from this document text and return it strictly in a valid JSON format.

Look for the following fields (include only if available):

- document_type: Type of ID (e.g., Aadhaar, PAN, Passport, Driver's License)
- name: Full name exactly as shown on the document
- Date of Birth: Must be in DD-MM-YYYY format. Look for patterns like DOB, D.O.B., Date of Birth, Birth Date, or Born.
- document_number: The unique ID like Aadhaar number, PAN number, Passport number, etc.
- nationality: Person's nationality (e.g., Indian)
- issuing_authority: Issuing authority's name (e.g., UIDAI, Government of India, RTO)
- phone_number: Any mobile or contact number listed
- address: Full postal address
- issue_date: Date of issue in DD-MM-YYYY format (look for keywords like 'Date of Issue', 'Issued On', etc.)
- place_of_issue: Place or city of issuance

⚠️ Only extract and return fields that are clearly present in the input.
⚠️ Do NOT return any general text, disclaimers, explanations, or comments.
⚠️ Final output must be in this format:

{
  "document_type": "...",
  "name": "...",
  "Date of Birth": "...",
  "document_number": "...",
  "nationality": "...",
  "issuing_authority": "...",
  "phone_number": "...",
  "address": "...",
  "issue_date": "...",
  "place_of_issue": "..."
}
`,
            },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Check if it's a rate limit error
      if (response.status === 429 || 
          (errorData?.error?.message && 
           errorData.error.message.toLowerCase().includes("rate"))) {
        throw new Error("API rate limit exceeded. Please try again later.");
      }
      
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return parseGeminiResponse(data);
  } catch (error) {
    throw error;
  }
}

function parseGeminiResponse(response: any): any {
  try {
    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format");
    }

    const text = response.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response text
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) ||
                      text.match(/{[\s\S]*}/);
                      
    let jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    // Clean up the string to ensure it's valid JSON
    jsonStr = jsonStr.replace(/^```json\n|^```\n|```$/g, '');
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    
    // If we can't parse as JSON, return the raw text as a fallback
    if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { 
        raw_text: response.candidates[0].content.parts[0].text,
        parsing_error: "Could not parse as JSON. Returning raw text." 
      };
    }
    
    throw new Error("Failed to parse the API response");
  }
}
