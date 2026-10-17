"""
fees-pdf.py — builds the Smartious Fee Guide 2026–27 PDF.

    python3 frontend/scripts/fees-pdf.py

Output: frontend/public/smartious-fees-2026-27.pdf (override with OUT=...)

Replaces the old "Smartious_Fee_Structure_2026 (2).pdf", whose prices were out of
date. Only the published facts below are used: from USD 423 per month for Primary,
paid termly; other levels are quoted after the placement assessment; one-to-one
tuition is USD 15 per hour. Keep these in step with section 6 and Section C of
admission-pdf.py and with the fees shown on the website.
Brand style (crimson, gold, cream, logo, page furniture) follows admission-pdf.py.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Image,
                                Table, TableStyle, KeepTogether, PageBreak)

HERE = os.path.dirname(os.path.abspath(__file__))
FRONT = os.path.dirname(HERE)
OUT = os.environ.get('OUT') or os.path.join(FRONT, 'public', 'smartious-fees-2026-27.pdf')
LOGO = os.path.join(FRONT, 'public', 'brand', 'logo.png')

# ── Facts (the only figures this document may state) ──────────
PRIMARY_USD_MONTH = 423
TUITION_USD_HOUR = 15
RATES_DATE = 'October 2026'
# Approximate units of local currency per 1 USD. Indicative only.
RATES = [('Kenyan shilling', 'KSh', 129), ('Nigerian naira', 'NGN', 1550), ('UAE dirham', 'AED', 3.6725),
         ('Saudi riyal', 'SAR', 3.75), ('Qatari riyal', 'QAR', 3.64)]

# ── Type and colour ──────────────────────────────────────────
def font(name, path, fallback):
    try:
        pdfmetrics.registerFont(TTFont(name, path)); return name
    except Exception:
        return fallback
LIB = '/usr/share/fonts/truetype/liberation/'
SANS = font('Sans', LIB + 'LiberationSans-Regular.ttf', 'Helvetica')
SANS_B = font('Sans-Bold', LIB + 'LiberationSans-Bold.ttf', 'Helvetica-Bold')
SERIF = font('Serif', LIB + 'LiberationSerif-Regular.ttf', 'Times-Roman')
SERIF_I = font('Serif-Italic', LIB + 'LiberationSerif-Italic.ttf', 'Times-Italic')
if SANS == 'Sans':
    addMapping('Sans', 0, 0, SANS); addMapping('Sans', 1, 0, SANS_B); addMapping('Sans', 0, 1, SANS); addMapping('Sans', 1, 1, SANS_B)
if SERIF == 'Serif':
    addMapping('Serif', 0, 0, SERIF); addMapping('Serif', 0, 1, SERIF_I); addMapping('Serif', 1, 0, SERIF); addMapping('Serif', 1, 1, SERIF_I)

CRIMSON = colors.HexColor('#8B1A2E'); DEEP = colors.HexColor('#7D1025'); GOLD = colors.HexColor('#C9973A')
INK = colors.HexColor('#1E1E24'); GREY = colors.HexColor('#5B6475'); LINE = colors.HexColor('#E3D9C6')
CREAM = colors.HexColor('#FCF9F3'); CARD = colors.HexColor('#F4ECE1'); WHITE = colors.white

S = {
    'kicker': ParagraphStyle('kicker', fontName=SANS_B, fontSize=7.6, leading=10, textColor=GOLD),
    'title': ParagraphStyle('title', fontName=SERIF, fontSize=27, leading=31, textColor=INK, spaceAfter=6),
    'h1': ParagraphStyle('h1', fontName=SERIF, fontSize=16, leading=20, textColor=INK, spaceBefore=6, spaceAfter=5),
    'body': ParagraphStyle('body', fontName=SANS, fontSize=9, leading=13, textColor=INK, spaceAfter=4),
    'cell': ParagraphStyle('cell', fontName=SANS, fontSize=8.8, leading=12, textColor=INK),
    'cellh': ParagraphStyle('cellh', fontName=SANS_B, fontSize=7.6, leading=10, textColor=GREY),
    'price': ParagraphStyle('price', fontName=SANS_B, fontSize=9.4, leading=12.5, textColor=CRIMSON),
    'small': ParagraphStyle('small', fontName=SANS, fontSize=7.6, leading=10.5, textColor=GREY),
    'box': ParagraphStyle('box', fontName=SANS, fontSize=9, leading=13, textColor=INK),
}
P = lambda t, st='body': Paragraph(t, S[st])

def heading(kicker, plain, accent):
    return [P(kicker.upper(), 'kicker'), Spacer(1, 2),
            P(f'{plain} <font name="{SERIF_I}" color="#8B1A2E">{accent}</font>', 'h1')]

def table(rows, widths, header=True, pad=5):
    t = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    st = [('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('TOPPADDING', (0, 0), (-1, -1), pad), ('BOTTOMPADDING', (0, 0), (-1, -1), pad),
          ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6)]
    if header:
        st += [('BACKGROUND', (0, 0), (-1, 0), CARD), ('LINEBELOW', (0, 0), (-1, 0), 0.8, GOLD)]
    t.setStyle(TableStyle(st)); return t

def boxed(paras, bg=CARD, border=CRIMSON):
    t = Table([[p] for p in paras], colWidths=['100%'])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), bg), ('LINEBEFORE', (0, 0), (0, -1), 3, border),
                           ('LEFTPADDING', (0, 0), (-1, -1), 12), ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                           ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return t

def bullets(items, cols=2):
    cells = [[P('<font color="#C9973A">●</font>', 'cell'), P(t, 'cell')] for t in items]
    rows = []
    for i in range(0, len(cells), cols):
        chunk = cells[i:i + cols]; chunk += [['', '']] * (cols - len(chunk))
        rows.append([x for pair in chunk for x in pair])
    t = Table(rows, colWidths=[4 * mm, W_FULL / cols - 4 * mm] * cols)
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 10), ('TOPPADDING', (0, 0), (-1, -1), 2),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 3)]))
    return t

# ── Page furniture ───────────────────────────────────────────
class Doc(BaseDocTemplate):
    def __init__(self, path):
        super().__init__(path, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=20 * mm, bottomMargin=19 * mm,
                         title='Smartious Fee Guide 2026-27', author='Smartious E-School Ltd',
                         subject='School fees, tuition rates, payment and refund terms for the 2026-27 academic year')
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='f', leftPadding=0, rightPadding=0)
        self.addPageTemplates([PageTemplate('p', [frame], onPage=self.furniture)])
    def furniture(self, c, doc):
        W, H = A4
        c.saveState()
        c.setFillColor(CREAM); c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColor(DEEP); c.rect(0, H - 6, W, 6, fill=1, stroke=0)
        if doc.page > 1:
            if os.path.exists(LOGO):
                c.drawImage(LOGO, 18 * mm, H - 15.5 * mm, width=22 * mm, height=22 * mm * 441 / 1200, mask='auto')
            c.setFont(SANS, 7.2); c.setFillColor(GREY); c.drawRightString(W - 18 * mm, H - 13 * mm, 'FEE GUIDE  ·  2026–27 ACADEMIC YEAR')
            c.setStrokeColor(LINE); c.setLineWidth(0.5); c.line(18 * mm, H - 17 * mm, W - 18 * mm, H - 17 * mm)
        c.setStrokeColor(LINE); c.setLineWidth(0.5); c.line(18 * mm, 14 * mm, W - 18 * mm, 14 * mm)
        c.setFont(SANS, 7); c.setFillColor(GREY)
        c.drawString(18 * mm, 9.5 * mm, 'smartioushomeschool.com  ·  hello@smartioushomeschool.com  ·  Admissions +254 745 021 212  ·  Academic +254 182 071 920')
        c.setFont(SANS_B, 7); c.setFillColor(CRIMSON); c.drawRightString(W - 18 * mm, 9.5 * mm, f'Page {doc.page}')
        c.restoreState()

# ── Content ──────────────────────────────────────────────────
story = []
W_FULL = A4[0] - 36 * mm

# Page 1 — title and fees
top = []
if os.path.exists(LOGO):
    top.append(Image(LOGO, width=48 * mm, height=48 * mm * 441 / 1200, hAlign='LEFT'))
story += top + [Spacer(1, 6 * mm), P('FEE GUIDE  ·  2026–27 ACADEMIC YEAR', 'kicker'), Spacer(1, 3),
          P(f'Clear fees, <font name="{SERIF_I}" color="#8B1A2E">confirmed for your child.</font>', 'title'), Spacer(1, 4),
          P('Smartious is a premium homeschool and online school, founded in Nairobi in 2018 and serving families in 40+ countries. '
            'This guide sets out our published fees for the 2026–27 academic year, what they include, and how payment and refunds work. '
            'All fees are quoted in US Dollars (USD), per student.'),
          Spacer(1, 3 * mm)]

story += heading('Section 1 · School fees and tuition', 'Fees for', '2026–27')
fees = table([
    [P('PROGRAMME', 'cellh'), P('LEVEL', 'cellh'), P('FEE (USD)', 'cellh'), P('BILLING', 'cellh')],
    [P('<b>Online school and homeschool</b>', 'cell'), P('Primary', 'cell'),
     P(f'From USD {PRIMARY_USD_MONTH} per month', 'price'), P('Payable termly, in advance', 'cell')],
    [P('<b>Online school and homeschool</b>', 'cell'), P('Secondary, IGCSE, A-Level, IB, American and other levels', 'cell'),
     P('Quoted after assessment', 'price'), P('Payable termly, in advance', 'cell')],
    [P('<b>One-to-one tuition</b>', 'cell'), P('Any subject, any level, in person in Nairobi or online', 'cell'),
     P(f'USD {TUITION_USD_HOUR} per hour', 'price'), P('As booked', 'cell')],
    [P('<b>External examinations</b>', 'cell'), P('Cambridge, Pearson Edexcel, IB, College Board', 'cell'),
     P('Board rate', 'price'), P('Separate, before entry', 'cell')],
], [W_FULL * f for f in (0.25, 0.33, 0.21, 0.21)])
story += [fees, Spacer(1, 3),
          P('Fees vary by curriculum and level. Your child’s fee is confirmed in writing after the placement assessment, before any payment for lessons is due.', 'small'),
          Spacer(1, 4 * mm)]

story += heading('Section 2 · Local currency', 'Approximate', 'local equivalents')
rows = [[P('CURRENCY', 'cellh'), P('RATE USED (PER USD 1)', 'cellh'),
         P(f'USD {PRIMARY_USD_MONTH} PER MONTH IS ABOUT', 'cellh'), P(f'USD {TUITION_USD_HOUR} PER HOUR IS ABOUT', 'cellh')]]
for name, code, rate in RATES:
    note = ' (fluctuates)' if code == 'NGN' else ''
    rows.append([P(f'<b>{name}</b> ({code})', 'cell'), P(f'about {code} {rate:,}{note}', 'cell'),
                 P(f'{code} {round(PRIMARY_USD_MONTH * rate, -1 if rate < 100 else -2):,.0f}', 'cell'),
                 P(f'{code} {round(TUITION_USD_HOUR * rate, 0 if rate < 100 else -1):,.0f}', 'cell')])
story += [table(rows, [W_FULL * f for f in (0.28, 0.26, 0.24, 0.22)], pad=4), Spacer(1, 3),
          P(f'<b>Approximate only.</b> Local amounts use indicative exchange rates for {RATES_DATE} and are shown for convenience. '
            'You are invoiced in USD; the amount charged in your local currency depends on the exchange rate on the day you pay. '
            'The Nigerian naira in particular fluctuates.', 'small')]

# Page 2 — inclusions, terms, intake, contacts
story += [PageBreak()]
story += heading('Section 3 · What is included', 'What your fees', 'include')
story += [bullets([
    'Qualified teachers; for in-person homeschool, a tutor visits your home in Nairobi',
    'All textbooks and learning materials',
    'Specialist subject teachers per subject (secondary)',
    'Smartious LMS and Mshauri AI tutor access',
    'Weekly lesson reports to parents',
    'Termly progress reports with grades',
    'Parent-teacher consultations every term',
    'University pathway guidance from Year 10, and free Study Abroad consulting for enrolled families',
]), Spacer(1, 2),
    P('External examination fees are not included; they are charged separately at the published board rate.', 'small'),
    Spacer(1, 4 * mm)]

story += heading('Section 4 · Payment and refunds', 'Payment and', 'refund terms')
story += [table([
    [P('<b>Billing</b>', 'cell'), P('Fees are payable termly, in advance. The first term’s fees are paid once your child’s fee has been confirmed after the assessment.', 'cell')],
    [P('<b>Currency</b>', 'cell'), P('All fees are stated in US Dollars. Local currency amounts are approximate and shown for convenience only.', 'cell')],
    [P('<b>How to pay</b>', 'cell'), P('Through Paystack: M-Pesa, Visa, Mastercard, bank transfer or Apple Pay. Payment details are on your invoice.', 'cell')],
    [P('<b>Tuition</b>', 'cell'), P(f'One-to-one tuition is USD {TUITION_USD_HOUR} per hour, charged as booked.', 'cell')],
], [W_FULL * 0.18, W_FULL * 0.82], header=False, pad=4), Spacer(1, 5),
    boxed([P('<b>Refunds.</b> Fees are non-refundable once the assessment is done, the timetable is created and lessons have started.', 'box')]),
    Spacer(1, 4 * mm)]

story += [KeepTogether(heading('Section 5 · Next intake', 'The January 2027', 'intake') + [
    P('Term 2 of the 2026–27 academic year, the January 2027 intake, starts on <b>5 January 2027</b>. To join, apply online or contact admissions; '
      'your child sits a placement assessment, we confirm the fee in writing, and lessons begin once the timetable is set and the first term’s fees are paid.'),
    Spacer(1, 4 * mm)])]

contact = table([
    [P('ADMISSIONS (ALSO WHATSAPP)', 'cellh'), P('ACADEMIC', 'cellh'), P('EMAIL', 'cellh'), P('WEBSITE', 'cellh')],
    [P('+254 745 021 212', 'cell'), P('+254 182 071 920', 'cell'), P('hello@smartioushomeschool.com', 'cell'), P('smartioushomeschool.com', 'cell')],
], [W_FULL * f for f in (0.25, 0.19, 0.32, 0.24)], pad=4)
story += [KeepTogether(heading('Section 6 · Contact', 'Talk to', 'us') + [contact, Spacer(1, 5),
    P('<b>Head office:</b> Diamond Plaza I Parklands Annex, 3rd Floor, Nairobi, Kenya. Our second centre is at Karen West, Mokoyeti Road, past Galleria Mall, Nairobi.'),
    Spacer(1, 2),
    P('This guide applies to the 2026–27 academic year. Fees may be revised for future years with written notice. Smartious E-School Ltd.', 'small')])]

Doc(OUT).build(story)
print('wrote', OUT)
