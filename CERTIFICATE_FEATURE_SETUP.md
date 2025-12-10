# Certificate Generation Feature - Setup Guide

## Overview
This feature allows School Admins and Teachers to generate PDF certificates for students by populating fields in an existing PDF template.

## Installation Steps

### 1. Install Required Dependencies

```bash
# Install TCPDF (required for PDF generation with Arabic support)
composer require tecnickcom/tcpdf

# The following are already installed:
# - setasign/fpdi
# - setasign/tfpdf
```

### 2. Configure Field Mapping

The field mapping configuration is located at `config/certificate_fields.json`. This file defines the coordinates and styling for each field on the certificate template.

**Default Field Map:**
- `student_name`: Student's full name
- `student_id`: Student ID number
- `membership_number`: Membership number
- `course_name`: Course/subject name
- `subject`: Subject (optional)
- `grade`: Grade (optional)
- `date` / `issue_date`: Issue date
- `signature`: Signature text
- `issued_by`: Name of issuer
- `certificate_number`: Unique certificate number

**To customize field positions:**
1. Open the PDF template in a PDF editor
2. Note the X, Y coordinates for each field
3. Update `config/certificate_fields.json` with the correct coordinates
4. Adjust `font_size` and `align` (left, center, right) as needed

### 3. Certificate Template

The default template is located at `public/Certificate.pdf`. You can:
- Replace this file with your own template
- Specify a custom template path when generating certificates via the API

### 4. Storage Setup

Certificates are stored in `storage/app/certificates/{year}/`. Ensure the storage directory is writable:

```bash
php artisan storage:link
chmod -R 775 storage/app/certificates
```

## Usage

### For School Admins

1. Navigate to **الشهادات** (Certificates) in the sidebar
2. Search/filter students as needed
3. Click **إنشاء شهادة** (Generate Certificate) for a student
4. Fill in the certificate details:
   - Course name (required)
   - Subject (optional)
   - Grade (optional)
   - Date format (choose from: Y-m-d, d-m-Y, short, or long Arabic format)
5. Click **معاينة** (Preview) to review data
6. Click **إنشاء وتحميل** (Generate and Download) to create and download the certificate

### For Teachers

1. Navigate to **الشهادات** (Certificates) in the sidebar
2. View list of your students (students with projects you created)
3. Click **إنشاء شهادة** (Generate Certificate) for a student
4. Fill in certificate details (you can modify allowed fields)
5. Preview and generate the certificate

## API Endpoint

### Generate Certificate

**POST** `/api/certificates/generate`

**Request Body:**
```json
{
    "student_id": 123,
    "overrides": {
        "student_name": "محمد أحمد",
        "course_name": "دورة البرمجة",
        "subject": "JavaScript",
        "grade": "A+",
        "issued_by": "اسم المعلم"
    },
    "template_path": "/path/to/template.pdf", // Optional
    "date_format": "Y-m-d" // Options: Y-m-d, d-m-Y, short, long
}
```

**Response:**
```json
{
    "success": true,
    "certificate": {
        "id": 1,
        "certificate_number": "CERT-2025-0123",
        "file_path": "certificates/2025/cert_xxx.pdf",
        "download_url": "/certificates/1/download"
    }
}
```

### Download Certificate

**GET** `/certificates/{id}/download`

Downloads the generated certificate PDF file.

## Permissions

- **School Admin**: Can generate certificates for all students in their school
- **Teacher**: Can generate certificates only for students who have projects created by them
- **Admin**: Can generate certificates for any student

## Field Mapping Configuration

Edit `config/certificate_fields.json` to adjust field positions:

```json
{
    "student_name": {
        "x": 150,
        "y": 320,
        "font_size": 18,
        "align": "center",
        "font_family": "DejaVuSans"
    }
}
```

**Parameters:**
- `x`: X coordinate in millimeters
- `y`: Y coordinate in millimeters
- `font_size`: Font size in points
- `align`: Text alignment (left, center, right)
- `font_family`: Font family (DejaVuSans supports Arabic)

## Arabic/RTL Support

The system uses TCPDF with DejaVu Sans font which supports Arabic characters. The certificate service automatically handles:
- RTL text alignment
- Arabic date formatting (when using "long" format)
- Proper Arabic text rendering

## Troubleshooting

### Error: "TCPDF library is required"
**Solution:** Run `composer require tecnickcom/tcpdf`

### Error: "Certificate template not found"
**Solution:** Ensure `public/Certificate.pdf` exists or provide a custom template path

### Text not appearing correctly
**Solution:** 
1. Check field coordinates in `config/certificate_fields.json`
2. Verify the PDF template dimensions match (A4 landscape)
3. Ensure font supports Arabic characters

### Storage permission errors
**Solution:** 
```bash
chmod -R 775 storage/app/certificates
chown -R www-data:www-data storage/app/certificates
```

## File Structure

```
app/
├── Http/Controllers/
│   ├── CertificateController.php          # Main API controller
│   ├── School/SchoolCertificateController.php
│   └── Teacher/TeacherCertificateController.php
├── Services/
│   └── CertificateService.php            # PDF generation service
config/
└── certificate_fields.json                # Field mapping configuration
resources/js/Pages/
├── School/Certificates/
│   └── Index.jsx                          # School admin interface
└── Teacher/Certificates/
    └── Index.jsx                          # Teacher interface
routes/
└── web.php                                # Routes (updated)
```

## Notes

- Certificates are stored in `storage/app/certificates/{year}/` organized by year
- Each certificate gets a unique certificate number: `CERT-{YEAR}-{STUDENT_ID}`
- The system automatically creates the storage directory structure
- Generated certificates are linked to the student and issuer in the database

