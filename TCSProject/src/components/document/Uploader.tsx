
import React, { useState, useRef } from 'react';
import { Upload, FileImage, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface UploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const Uploader: React.FC<UploaderProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    const fileType = file.type;
    
    if (!fileType.includes('image') && !fileType.includes('pdf')) {
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };
  
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  return (
    <div className="w-full flex flex-col items-center">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 w-full flex flex-col items-center justify-center cursor-pointer ${
          dragActive ? 'border-primary bg-secondary/40' : 'border-border bg-secondary/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          accept="image/*,application/pdf"
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          
          <h3 className="text-lg font-medium mb-2">Upload ID Document</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop or click to browse
          </p>
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-5">
            <div className="flex items-center">
              <FileImage className="h-3 w-3 mr-1" />
              <span>Images</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              <span>PDF</span>
            </div>
          </div>
          
          <Button size="sm" className="bg-primary text-white px-4">
            Select File
          </Button>
        </div>
      </div>
      
      {selectedFile && (
        <div className="mt-3 text-sm text-muted-foreground">
          Selected: {selectedFile.name}
        </div>
      )}
    </div>
  );
};

export default Uploader;
