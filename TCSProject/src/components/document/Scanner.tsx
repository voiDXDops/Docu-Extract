import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Uploader from "@/components/document/Uploader";
import Result from "@/components/document/Result";
import { extractDocumentInfo } from "@/utils/extraction";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { ring2 } from "ldrs";
ring2.register();

const Scanner = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  useEffect(() => {
    // Create document preview URL when a file is selected
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setDocumentPreview(objectUrl);

      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExtractedData(null);
  };
  const handleExtract = async () => {
    if (!selectedFile) {
      toast.error("Please select a document first");
      return;
    }
    setIsProcessing(true);
    try {
      const data = await extractDocumentInfo(selectedFile);
      setExtractedData(data);
    } catch (error: any) {
      console.error("Extraction error:", error);
      // Toast errors are already handled in the extraction function
    } finally {
      setIsProcessing(false);
    }
  };
  const handleUploadDifferent = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setDocumentPreview(null);
  };
  const supportedDocuments = [
    "Aadhaar Cards",
    "PAN Cards",
    "Passports",
    "Driver's Licenses",
    "Voter ID Cards",
    "Other ID Documents",
  ];
  return (
    <div className="min-h-screen bg-[#F9FAFC] py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-primary">
              <Shield size={18} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                DocuEXTRACT
              </h1>
              <p className="text-xs text-muted-foreground">
                Automated personal data retrieval system from documents
              </p>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <Card className="p-4 mb-6">
          {!extractedData ? (
            <div>
              <Uploader
                onFileSelect={handleFileSelect}
                isLoading={isProcessing}
              />

              {selectedFile && !isProcessing && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={handleExtract}
                    size="sm"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Extract Information"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-3">
                <Button
                  variant="outline"
                  onClick={handleUploadDifferent}
                  className="text-xs h-8"
                  size="sm"
                >
                  ← Upload different document
                </Button>
              </div>

              <Result
                data={extractedData}
                documentPreview={documentPreview || undefined}
                fileName={selectedFile?.name}
              />
            </>
          )}
        </Card>

        {/* Supported Documents */}
        {!extractedData && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Supported Documents:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {supportedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></div>
                  <span className="text-xs text-muted-foreground">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>Your documents are processed securely on your device.</p>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="text-center">
            {/* <div className="inline-block h-8 w-8 border-3 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div> */}

            <l-ring-2
              size="30"
              stroke="4"
              stroke-length="0.25"
              bg-opacity="0.1"
              speed="0.8"
              color="black"
            ></l-ring-2>
            <p className="text-md font-medium mt-[10px]">Analyzing document</p>
            <p className="text-xs text-muted-foreground mt-1">
              This may take a moment
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Scanner;
