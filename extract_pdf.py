import sys
try:
    from pypdf import PdfReader
    reader = PdfReader("cahier_des_charges_CampCompass_v3.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    print(text)
except Exception as e:
    print(f"Error: {e}")
