
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
              text: `Extract the most relevant and important information from this identification document. 
Provide ONLY the following fields in a JSON format (include only if available in the document):
- document_type: Type of ID (Aadhaar, PAN, Passport, Driver's License, etc.)
- name: Full name as per the document
- D.O.B: Date of birth in DD-MM-YYYY format
- document_number: The unique identifier (Aadhaar number, PAN number, Passport number, etc.)
- nationality: Person's nationality
- issuing_authority: Authority that issued the document
- phone_number: Phone number if available
- address: Complete address in a clear format
- issue_date: Date when document was issued (DD-MM-YYYY format)
- place_of_issue: Location where document was issued
Do NOT include disclaimers, policies, or any general text. ONLY return the structured JSON with the essential identity information.`,
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
