import re

with open("resources/js/Pages/MembershipCertificate/Show.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add import if not present
if "CertificateCard" not in content:
    content = content.replace(
        "import { downloadElementAsImage } from '@/utils/downloadElementAsImage';",
        "import { downloadElementAsImage } from '@/utils/downloadElementAsImage';\nimport CertificateCard from '@/Components/Certificate/CertificateCard';"
    )

# Replace mobile block
mobile_pattern = re.compile(r"<div ref=\{certificateRef\} className=\"bg-gradient-to-br from-\[\#A3C042\] to-\[\#8CA635\] rounded-2xl p-6 text-white text-center shadow-lg\">.*?</div>\s*</div>", re.DOTALL)
mobile_replacement = """
                                <CertificateCard 
                                    ref={certificateRef}
                                    user={user}
                                    role={user?.role}
                                    barcode={certificate?.barcode}
                                    issueDate={certificate?.issue_date_formatted || new Date().toLocaleDateString('en-GB')}
                                />
""".strip('\n')

content = mobile_pattern.sub(mobile_replacement, content, count=1)

# Replace desktop block
desktop_pattern = re.compile(r"<div ref=\{certificateRef\} className=\"bg-gradient-to-br from-\[\#A3C042\] to-\[\#6B8E23\] rounded-2xl p-8 text-white text-center shadow-lg border-4 border-white/20\">.*?</div>\s*</div>", re.DOTALL)
desktop_replacement = """
                                <CertificateCard 
                                    ref={certificateRef}
                                    user={user}
                                    role={user?.role}
                                    barcode={certificate?.barcode}
                                    issueDate={certificate?.issue_date_formatted || new Date().toLocaleDateString('en-GB')}
                                />
""".strip('\n')

content = desktop_pattern.sub(desktop_replacement, content, count=1)

with open("resources/js/Pages/MembershipCertificate/Show.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
