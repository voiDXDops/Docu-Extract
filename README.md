# 📄 DocuExtract – Automated Identity Document Information Extraction

**DocuExtract** is a lightweight, web-based application that extracts meaningful personal information from identity documents (like Aadhaar, PAN, Passport, etc.) using **Google's Gemini 2.0 Flash Lite API**.

This tool accepts both image and PDF documents, extracts key data using AI, and presents it in a clean, structured JSON format ready for use in digital workflows.

---

## 🚀 Features

- Upload identity documents (images or PDFs)
- Extracts personal details with high accuracy
- Uses **Gemini 2.0 Flash Lite** for faster response times, higher token limits, and better rate limits
- Clean JSON output for easy integration
- Minimal, user-friendly interface
- Client-side document handling with secure API calls

---

## 🧠 Powered By

- **Gemini 2.0 Flash Lite**: Offers higher RPM (requests per minute) and extended token support, ideal for document parsing.
- **Frontend Stack**: React, TypeScript
- **Credits**: Developed by **Jishu Sengupta** & **Himadri Purkait**

---

## 📄 Document Extraction Process

### 1. Upload Document
- User uploads or drags a file into the interface.
- Accepted formats: **PDF** or **image files**.
- File is stored in the `selectedFile` state (within the `Scanner` component).
- A preview is shown using `URL.createObjectURL()`.

### 2. Extract Information
- User clicks "Extract Information".
- App shows a loading spinner: **"Analyzing document..."**.
- Calls `extractDocumentInfo` from `extraction.ts`.

### 3. Behind-the-Scenes Processing
- Checks for a valid **Gemini API key** from environment variables.
- Converts the document to **Base64** using the FileReader API.
- Sends it to **Gemini API (gemini-2.0-flash-lite)**.
- Includes a tailored prompt to extract identity information.

### 4. AI Processing
- Gemini AI analyzes the image or PDF content.
- Extracts key data and returns a **JSON response**.
- The response is parsed and validated.

### 5. Data Formatting
Handled by `formatDocumentData`:
- Detects and labels document type.
- Formats dates into `DD-MM-YYYY`.
- Handles nested fields (e.g., passport address, Aadhaar sections).
- Adds default values where required.

### 6. Result Display
- Left panel: Document preview.
- Right panel: Formatted JSON output.
- Options to:
  - Copy JSON to clipboard
  - Download JSON as a file
  - Upload another document

### 7. Error Handling
- Graceful handling of:
  - API key missing
  - Rate limits
  - Invalid files
- Errors shown via toast messages.
- Loading state cleared after all cases.

---

## 🔒 Security & Privacy
- Files are processed securely in-browser.
- Only the base64 data is sent to the **Gemini API**.
- No files are stored or sent elsewhere.

---

## 📦 Setup (Coming Soon)

> Instructions for deploying locally or on platforms like Replit will be added.

---

## 📝 License

This project is for educational/demo purposes. Always respect privacy when handling real identity documents.
