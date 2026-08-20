with open("resources/js/Pages/Teacher/Certificate/Show.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

if "import CertificateCard" not in "".join(lines):
    for i, line in enumerate(lines):
        if line.startswith("import"):
            lines.insert(i, "import CertificateCard from '@/Components/Certificate/CertificateCard';\n")
            break

start_mobile = -1
end_mobile = -1
for i, line in enumerate(lines):
    if '<div ref={certificateRef} className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 relative">' in line:
        start_mobile = i
    if start_mobile != -1 and '</div>' in line and i > start_mobile + 20:
        # Teacher mobile block ends with 3 divs
        if '</div>' in lines[i-1] and '</div>' in lines[i-2]:
            end_mobile = i
            break

if start_mobile != -1 and end_mobile != -1:
    replacement = """                                <CertificateCard 
                                    ref={certificateRef}
                                    user={user}
                                    role="teacher"
                                    barcode={certificate?.barcode}
                                    issueDate={certificate?.issue_date_formatted || new Date().toLocaleDateString('en-GB')}
                                    membershipStatus={membershipSummary?.membership_type === 'subscription'
                                        ? t('teacherCertificatesIndexPage.membershipStatus.subscription')
                                        : t('teacherCertificatesIndexPage.membershipStatus.basic')}
                                />\n"""
    lines[start_mobile:end_mobile+1] = [replacement]

start_desktop = -1
end_desktop = -1
for i, line in enumerate(lines):
    if 'className="certificate-print relative rounded-2xl p-3"' in line:
        start_desktop = i - 1 # include the `<div ref={certificateRef}`
    if start_desktop != -1 and '</div>' in line and i > start_desktop + 20:
        if '</div>' in lines[i-1] and '</div>' in lines[i-2] and '</div>' in lines[i-3]:
            # desktop block ends with 4 divs actually! Let's check `Teacher/Certificate/Show.jsx` carefully later.
            # wait, if I am doing this, I might break it again.
            pass

