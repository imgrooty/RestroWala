# 3D Models Directory

This directory stores 3D model files for menu items with AR/VR capabilities.

## Supported Formats

- **GLB** (GL Transmission Format Binary) - Recommended
- **GLTF** (GL Transmission Format)

## File Organization

```
models/
├── appetizers/
│   ├── spring-rolls.glb
│   └── samosas.glb
├── main-course/
│   ├── biryani.glb
│   └── pizza.glb
├── desserts/
│   ├── ice-cream.glb
│   └── cake.glb
└── beverages/
    ├── coffee.glb
    └── juice.glb
```

## Best Practices

1. **File Size**: Keep models under 10MB for optimal loading
2. **Naming**: Use lowercase with hyphens (e.g., `chicken-tikka.glb`)
3. **Optimization**: Use tools like gltf-pipeline to compress models
4. **Textures**: Embed textures in GLB files when possible
5. **Testing**: Test AR view on mobile devices before deployment

## Model Creation Tools

- Blender (Free, Open Source)
- SketchFab
- Adobe Dimension
- Cinema 4D

## Conversion Tools

- gltf-pipeline (npm package)
- Blender (Export to GLTF/GLB)
- Online converters (e.g., glTF Viewer)
