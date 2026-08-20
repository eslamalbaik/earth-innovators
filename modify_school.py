import re

with open("resources/js/Pages/School/Certificate/Show.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add import if not present
if "CertificateCard" not in content:
    content = content.replace(
        "import { downloadElementAsImage, printElementAsImage, shareElementAsImage } from '@/utils/downloadElementAsImage';",
        "import { downloadElementAsImage, printElementAsImage, shareElementAsImage } from '@/utils/downloadElementAsImage';\nimport CertificateCard from '@/Components/Certificate/CertificateCard';"
    )

# Replace mobile block
mobile_pattern = re.compile(r"<div ref=\{certificateRef\} className=\"certificate-print bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 relative\">.*?</div>\s*</div>\s*</div>", re.DOTALL)
mobile_replacement = """
                                <CertificateCard 
                                    ref={certificateRef}
                                    user={user}
                                    role="school"
                                    barcode={certificate?.barcode}
                                    issueDate={certificate?.issue_date_formatted || new Date().toLocaleDateString('en-GB')}
                                />
""".strip('\n')

content = mobile_pattern.sub(mobile_replacement, content, count=1)

# Replace desktop block
desktop_pattern = re.compile(r"<div ref=\{certificateRef\} className=\"certificate-print bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 relative\">.*?</div>\s*</div>\s*</div>", re.DOTALL)
desktop_replacement = """
                                    <CertificateCard 
                                        ref={certificateRef}
                                        user={user}
                                        role="school"
                                        barcode={certificate?.barcode}
                                        issueDate={certificate?.issue_date_formatted || new Date().toLocaleDateString('en-GB')}
                                    />
""".strip('\n')

content = desktop_pattern.sub(desktop_replacement, content, count=1)

with open("resources/js/Pages/School/Certificate/Show.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
