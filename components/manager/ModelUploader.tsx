'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, CheckCircle2, Box, Info, Loader2 } from 'lucide-react';
import ModelPreview from './ModelPreview';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

interface ModelUploaderProps {
    onUploadComplete: (url: string, metadata: any) => void;
    initialUrl?: string;
    maxSizeMB?: number;
}

const ModelUploader: React.FC<ModelUploaderProps> = ({
    onUploadComplete,
    initialUrl = null,
    maxSizeMB = 10,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
    const [metadata, setMetadata] = useState<any>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = useCallback(async (file: File) => {
        if (!file) return;

        // Validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast({
                title: "File too large",
                description: `Max size is ${maxSizeMB}MB`,
                variant: "destructive",
            });
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension !== 'glb' && extension !== 'gltf') {
            toast({
                title: "Invalid file type",
                description: "Please upload a GLB or glTF file",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Shimmer simulated progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
            }, 300);

            const response = await fetch('/api/upload/model', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setUploadProgress(100);
            setPreviewUrl(data.url);
            setMetadata(data.metadata);
            onUploadComplete(data.url, data.metadata);

            toast({
                title: "Model Uploaded",
                description: "3D model has been processed and optimized.",
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Upload Failed",
                description: "An error occurred during upload. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    }, [maxSizeMB, onUploadComplete]);

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

    const clearModel = () => {
        setPreviewUrl(null);
        setMetadata(null);
        onUploadComplete('', null);
    };

    return (
        <div className="space-y-6">
            {!previewUrl && (
                <label
                    className={`
            relative group flex flex-col items-center justify-center w-full h-64 
            border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
            ${dragActive
                            ? 'border-purple-500 bg-purple-500/5'
                            : 'border-muted-foreground/20 hover:border-purple-500/50 hover:bg-slate-50'
                        }
          `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center space-y-4 w-full px-12">
                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                            <p className="text-sm font-medium">Processing & Optimizing...</p>
                            <Progress value={uploadProgress} className="h-2 w-full max-w-xs" />
                        </div>
                    ) : (
                        <>
                            <div className="bg-purple-100 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-lg font-semibold">Click or drag 3D model</p>
                                <p className="text-sm text-muted-foreground mt-1">GLB or glTF formats only (Max {maxSizeMB}MB)</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".glb,.gltf"
                                onChange={handleChange}
                            />
                        </>
                    )}
                </label>
            )}

            {previewUrl && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-medium">Model Ready</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearModel} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <X className="w-4 h-4 mr-2" />
                            Remove
                        </Button>
                    </div>

                    <ModelPreview url={previewUrl} />

                    {metadata && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                                <Box className="w-5 h-5 text-purple-600 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">File Size</p>
                                    <p className="font-semibold">{(metadata.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                                <Info className="w-5 h-5 text-purple-600 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Optimization</p>
                                    <p className="font-semibold text-green-600">{metadata.isCompressed ? 'Compressed' : 'Original'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModelUploader;
