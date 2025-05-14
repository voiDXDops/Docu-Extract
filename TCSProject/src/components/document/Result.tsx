import React from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResultProps {
  data: any;
  documentPreview?: string;
  fileName?: string;
}

const Result: React.FC<ResultProps> = ({ data, documentPreview, fileName }) => {
  const copyToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadJson = () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "document"}-extracted.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download JSON");
    }
  };

  const formatJson = (json: any) => {
    if (!json) return "";

    const jsonString = JSON.stringify(json, null, 2);

    // Highlighting with HTML replacement
    return jsonString.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
            // Remove the colon from the end of the key
            match = match.substring(0, match.length - 1);
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }

        // If it's a key, add the colon back outside the span
        if (cls === "key") {
          return `<span class="${cls}">${match}</span>:`;
        }

        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {documentPreview && (
        <div className="document-preview">
          <h3 className="text-sm font-medium mb-2">Document Preview</h3>
          <div className="border rounded-lg overflow-hidden bg-white flex items-center justify-center p-2">
            <img
              src={documentPreview}
              alt="Document preview"
              className="max-h-[350px] object-contain"
            />
          </div>
          {fileName && (
            <div className="mt-1 text-xs text-muted-foreground">{fileName}</div>
          )}
        </div>
      )}

      <div className="extracted-data">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Extracted Information</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center h-7 text-xs"
            >
              <Copy size={12} className="mr-1" />
              Copy
            </Button>
            <Button
              size="sm"
              onClick={downloadJson}
              className="flex items-center h-7 text-xs"
            >
              <Download size={12} className="mr-1" />
              Save
            </Button>
          </div>
        </div>

        <pre
          className="json-display rounded-lg p-3 overflow-auto max-h-[350px] text-xs"
          dangerouslySetInnerHTML={{ __html: formatJson(data) }}
        />
      </div>
    </div>
  );
};

export default Result;
