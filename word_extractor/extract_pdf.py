from pypdf import PdfReader

r = PdfReader(r"C:\Users\thantam\Downloads\American_Oxford_3000.pdf")
text = "\n".join(p.extract_text() for p in r.pages)
with open(r"C:\Users\thantam\Desktop\WordYQuiz\WordYQuiz\db\oxford_raw.txt", "w", encoding="utf-8") as f:
    f.write(text)
print(len(r.pages), "pages,", len(text), "chars")
