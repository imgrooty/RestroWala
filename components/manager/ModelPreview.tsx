'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Environment, ContactShadows } from '@react-three/drei';

interface ModelProps {
    url: string;
}

function Model({ url }: ModelProps) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

interface ModelPreviewProps {
    url: string | null;
    className?: string;
}

const ModelPreview: React.FC<ModelPreviewProps> = ({ url, className = "w-full h-[400px]" }) => {
    if (!url) {
        return (
            <div className={`${className} bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted`}>
                <p className="text-muted-foreground">No 3D model to preview</p>
            </div>
        );
    }

    return (
        <div className={`${className} bg-slate-900 rounded-xl overflow-hidden relative group shadow-2xl transition-all duration-300 hover:shadow-purple-500/20`}>
            <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6} contactShadows={{ opacity: 0.4, blur: 2 }}>
                        <Model url={url} />
                    </Stage>
                    <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} minDistance={2} maxDistance={10} />
                </Suspense>
            </Canvas>
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Drag to rotate • Scroll to zoom
            </div>
        </div>
    );
};

export default ModelPreview;
