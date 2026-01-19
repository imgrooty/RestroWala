# QR Codes Directory

This directory stores generated QR codes for restaurant tables.

## QR Code Generation

QR codes are automatically generated when creating new tables via the API.

## File Organization

```
qr-codes/
├── table-1.png
├── table-2.png
├── table-3.png
└── ...
```

## QR Code Content

Each QR code contains a URL in the format:
```
https://yourrestaurant.com/menu?table=TABLE_ID
```

When customers scan the QR code:
1. Opens the menu page
2. Associates their session with the table
3. Allows them to place orders directly

## Printing Guidelines

- **Size**: Minimum 2x2 inches for reliable scanning
- **Resolution**: 300 DPI for print quality
- **Format**: PNG with transparent background
- **Placement**: Visible on table, protected from spills
