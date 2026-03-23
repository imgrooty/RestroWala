/**
 * AR Menu Viewer Component
 * 
 * 3D model viewer with AR capabilities using @google/model-viewer
 * - AR mode for supported devices (iOS Safari, Android Chrome)
 * - 2D fallback for unsupported devices
 * - Loading states
 * - Fullscreen support
 */

'use client';

import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ARMenuViewerProps {
  modelUrl: string;
  modelFormat?: string;
  itemName: string;
  fallbackImage?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ARMenuViewer({
  modelUrl,
  _modelFormat = 'glb',
  itemName,
  fallbackImage,
  isOpen,
  onClose,
}: ARMenuViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);

  useEffect(() => {
    // Check if AR is supported
    const checkARSupport = () => {
      if (typeof window === 'undefined') return false;
      
      // Check for iOS AR Quick Look
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      // Check for Android ARCore
      const isAndroid = /Android/.test(navigator.userAgent);
      // Check for WebXR
      const hasWebXR = 'xr' in navigator;
      
      return isIOS || (isAndroid && hasWebXR) || hasWebXR;
    };

    setIsARSupported(checkARSupport());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen, modelUrl]);

  const handleModelLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleModelError = () => {
    setIsLoading(false);
    setError('Failed to load 3D model');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const element = document.getElementById('model-viewer-container');
      if (element?.requestFullscreen) {
        element.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span>{itemName}</span>
            <div className="flex items-center gap-2">
              {isARSupported && (
                <Badge variant="secondary" className="text-xs">
                  AR Available
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div
          id="model-viewer-container"
          className="relative w-full bg-black/5 rounded-lg overflow-hidden"
          style={{ height: '70vh', minHeight: '400px' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading 3D model...</p>
              </div>
            </div>
          )}

          {error && fallbackImage ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={fallbackImage}
                alt={itemName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground">Failed to load 3D model</p>
            </div>
          ) : (
            <model-viewer
              src={modelUrl}
              alt={itemName}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="auto"
              ar-placement="floor"
              camera-controls
              auto-rotate
              rotation-per-second="30deg"
              interaction-policy="allow-when-focused"
              shadow-intensity="1"
              exposure="1"
              environment-image="neutral"
              style={{
                width: '100%',
                height: '100%',
              }}
              onLoad={handleModelLoad}
              onError={handleModelError}
            >
              {fallbackImage && (
                <img
                  slot="poster"
                  src={fallbackImage}
                  alt={itemName}
                  className="w-full h-full object-cover"
                />
              )}
            </model-viewer>
          )}

          {isARSupported && !error && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <Button
                onClick={() => {
                  const modelViewer = document.querySelector('model-viewer') as any;
                  if (modelViewer && typeof modelViewer.activateAR === 'function') {
                    modelViewer.activateAR();
                  }
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                View in AR
              </Button>
            </div>
          )}
        </div>

        {!isARSupported && (
          <div className="px-6 pb-4">
            <p className="text-xs text-muted-foreground text-center">
              AR is not supported on this device. You can still interact with the 3D model.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
