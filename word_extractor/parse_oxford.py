import re

SRC = r"C:\Users\thantam\Desktop\WordYQuiz\WordYQuiz\db\oxford_raw.txt"
OUT = r"C:\Users\thantam\Desktop\WordYQuiz\WordYQuiz\db\oxford_words.tsv"

# POS tags ที่ปรากฏใน Oxford 3000 (เรียงยาว->สั้น กัน match ผิด)
POS_PATTERN = (
    r"indefinite article|definite article|infinitive marker|"
    r"modal v\.|auxiliary v\.|exclam\.|number|det\./pron\.|noun\.|"
    r"n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|det\.|art\."
)
LEVEL = r"(?:A1|A2|B1|B2)"

lines = []
with open(SRC, encoding="utf-8") as f:
    for raw in f:
        line = raw.strip()
        if not line or "Oxford" in line or "©" in line or line.startswith("The "):
            continue
        # บรรทัดที่ขึ้นต้นด้วย pos/level คือส่วนที่ PDF ตัดมาจากบรรทัดก่อนหน้า
        if lines and (
            lines[-1].endswith((",", "/"))
            or (
                len(line) <= 8
                and re.fullmatch(r"(?:(?:" + POS_PATTERN + r")\s*)?" + LEVEL, line)
            )
        ):
            lines[-1] += " " + line
        else:
            lines.append(line)

rows = []
skipped = []
if True:
    for line in lines:
        # บางบรรทัด level ติดกับ pos เช่น "adj.B1" -> เติมช่องว่าง
        line = re.sub(r"(\.)(" + LEVEL + r")\b", r"\1 \2", line)
        m = re.match(r"^(.{1,60}?)\s+((?:" + POS_PATTERN + r").*)$", line)
        if not m:
            skipped.append(line)
            continue
        word, rest = m.group(1).strip().rstrip(","), m.group(2)
        # เอา pos ตัวแรก และ level ตัวแรกพอ (คำที่มีหลาย pos ใช้ตัวหลักนำ)
        pos_m = re.match(r"^(" + POS_PATTERN + r")", rest)
        lvl_m = re.search(r"\b(" + LEVEL + r")\b", rest)
        if not pos_m or not lvl_m:
            skipped.append(line)
            continue
        rows.append((word, pos_m.group(1), lvl_m.group(1)))

# ตัดวงเล็บกำกับความหมาย เช่น "light (not heavy)" และเลขท้ายคำ เช่น "second1"
rows = [
    (re.sub(r"\d+$", "", re.sub(r"\s*\(.*?\)", "", w)).strip(), p, l)
    for w, p, l in rows
]

# normalize pos ที่สะกดต่างกัน
rows = [(w, "n." if p == "noun." else p, l) for w, p, l in rows]

# กันคำซ้ำ (เก็บตัวแรก)
seen, uniq = set(), []
for w, p, l in rows:
    if w.lower() in seen:
        continue
    seen.add(w.lower())
    uniq.append((w, p, l))

with open(OUT, "w", encoding="utf-8") as f:
    for w, p, l in uniq:
        f.write(f"{w}\t{p}\t{l}\n")

print(f"parsed={len(uniq)} skipped={len(skipped)}")
for s in skipped[:20]:
    print("SKIP:", s)
