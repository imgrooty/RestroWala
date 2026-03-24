declare module 'gltf-pipeline' {
  export function processGlb(
    glb: Buffer,
    options?: {
      dracoOptions?: {
        compressionLevel?: number;
      };
      binary?: boolean;
    }
  ): Promise<{ glb: Buffer }>;
}
