import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';
import Button from './Button';
import { processImage } from '../utils/imageUtils';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processAndEmit(file);
    }
  };

  const processAndEmit = async (file: File) => {
    setIsProcessing(true);
    try {
      const base64 = await processImage(file);
      onImageSelected(base64);
    } catch (error) {
      console.error("Error processing image", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processAndEmit(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <ImageIcon className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">Upload your room photo</h3>
            <p className="text-slate-500 text-sm">Drag and drop or select a file to begin staging</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              icon={<Upload className="w-4 h-4" />}
            >
              Select Photo
            </Button>

            {/* Hidden Input for camera on mobile */}
            <input 
               type="file"
               accept="image/*"
               capture="environment"
               id="cameraInput"
               className="hidden"
               onChange={handleFileChange}
            />
            <Button 
              variant="outline" 
              icon={<Camera className="w-4 h-4" />}
              onClick={() => document.getElementById('cameraInput')?.click()}
            >
              Take Photo
            </Button>
          </div>
          
          {isProcessing && <p className="text-sm text-blue-600 font-medium animate-pulse">Processing image...</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;