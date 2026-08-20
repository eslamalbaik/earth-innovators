with open("resources/js/Pages/School/Certificate/Show.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

if "import CertificateCard" not in "".join(lines):
    # insert after the first import
    for i, line in enumerate(lines):
        if line.startswith("import"):
            lines.insert(i, "import CertificateCard from '@/Components/Certificate/CertificateCard';\n")
            break

# Replace mobile block
start_mobile = -1
end_mobile = -1
for i, line in enumerate(lines):
    if '<div ref={certificateRef} className="certificate-print bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 relative">' in line:
        start_mobile = i
    if start_mobile != -1 and '</div>' in line and '</div>' in lines[i-1] and '</div>' in lines[i-2] and i > start_mobile + 20:
        # the mobile block ends with 3 divs
        end_mobile = i
        break

if start_mobile != -1 and end_mobile != -1:
    replacement = """                                <CertificateCard 
                                    ref={certificateRef}
                                    user={user}
                                    role="school"
                                    barcode={certificate?.barcode}
                                    issueDate={certificate?.issue_date_formatted}
                                />\n"""
    lines[start_mobile:end_mobile+1] = [replacement]

# Replace desktop block
start_desktop = -1
end_desktop = -1
for i, line in enumerate(lines):
    if '<div ref={certificateRef} className="certificate-print bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 relative">' in line:
        start_desktop = i
    if start_desktop != -1 and '</div>' in line and '</div>' in lines[i-1] and '</div>' in lines[i-2] and i > start_desktop + 20:
        # the desktop block ends with 3 divs
        end_desktop = i
        break

if start_desktop != -1 and end_desktop != -1:
    replacement = """                                    <CertificateCard 
                                        ref={certificateRef}
                                        user={user}
                                        role="school"
                                        barcode={certificate?.barcode}
                                        issueDate={certificate?.issue_date_formatted}
                                    />\n"""
    lines[start_desktop:end_desktop+1] = [replacement]

with open("resources/js/Pages/School/Certificate/Show.jsx", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Done")
