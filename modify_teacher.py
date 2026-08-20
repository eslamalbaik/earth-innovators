import re

with open("resources/js/Pages/Teacher/Certificate/Show.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add import if not present
if "CertificateCard" not in content:
    content = content.replace(
        "import { downloadElementAsImage, printElementAsImage, shareElementAsImage } from '@/utils/downloadElementAsImage';",
        "import { downloadElementAsImage, printElementAsImage, shareElementAsImage } from '@/utils/downloadElementAsImage';\nimport CertificateCard from '@/Components/Certificate/CertificateCard';"
    )

# Replace mobile block
mobile_pattern = re.compile(r"<div ref=\{certificateRef\} className=\"bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 relative\">.*?</div>\s*</div>\s*</div>", re.DOTALL)
mobile_replacement = """
                                <CertificateCard 
                                    ref={certificateRef}
                                    user={user}
                                    role="teacher"
                                    barcode={certificate?.barcode}
                                    issueDate={formatDate(certificate?.issue_date)}
                                    membershipStatus={membershipSummary?.membership_type === 'subscription'
                                        ? t('teacherCertificatesIndexPage.membershipStatus.subscription')
                                        : t('teacherCertificatesIndexPage.membershipStatus.basic')}
                                />
""".strip('\n')

content = mobile_pattern.sub(mobile_replacement, content, count=1)

# Replace desktop block
desktop_pattern = re.compile(r"<div\s+ref=\{certificateRef\}\s+className=\"certificate-print relative rounded-2xl p-3\".*?</div>\s*</div>\s*</div>\s*</div>", re.DOTALL)
desktop_replacement = """
                                    <CertificateCard 
                                        ref={certificateRef}
                                        user={user}
                                        role="teacher"
                                        barcode={certificate?.barcode}
                                        issueDate={formatDate(certificate?.issue_date)}
                                        membershipStatus={membershipSummary?.membership_type === 'subscription'
                                            ? t('teacherCertificatesIndexPage.membershipStatus.subscription')
                                            : t('teacherCertificatesIndexPage.membershipStatus.basic')}
                                    />
""".strip('\n')

content = desktop_pattern.sub(desktop_replacement, content, count=1)

with open("resources/js/Pages/Teacher/Certificate/Show.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
