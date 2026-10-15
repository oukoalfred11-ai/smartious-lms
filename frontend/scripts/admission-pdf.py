"""
admission-pdf.py — builds the Smartious Admission Agreement PDF.

    python3 frontend/scripts/admission-pdf.py

The policy text is read from the same arrays the website renders
(TERMS_OF_SERVICE, ACADEMIC_INTEGRITY_POLICY … in src/pages/LandingPage.jsx),
so the signed agreement always matches the published policies. Re-run this
script whenever a policy changes and commit the new PDF.

Output: frontend/public/Smartious_Admission_Agreement_2026.pdf
The form fields are fillable on screen; the pack also prints cleanly for
signing by hand.
"""
import json, os, subprocess, datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                PageBreak, Flowable, KeepTogether, Image, Table, TableStyle)

HERE = os.path.dirname(os.path.abspath(__file__))
FRONT = os.path.dirname(HERE)
OUT = os.path.join(FRONT, 'public', 'Smartious_Admission_Agreement_2026.pdf')
LOGO = os.path.join(FRONT, 'public', 'brand', 'logo.png')
EFFECTIVE = '15 October 2026'

# ── Policy text, straight from the website ───────────────────
POLICIES = [
    ('TERMS_OF_SERVICE', 'Terms of Service', 'smartioushomeschool.com/terms'),
    ('ACADEMIC_INTEGRITY_POLICY', 'Academic Integrity Policy', 'smartioushomeschool.com/academic-integrity'),
    ('AI_USE_POLICY', 'AI Use Policy', 'smartioushomeschool.com/ai-policy'),
    ('INCLUSION_POLICY', 'Inclusion Policy', 'smartioushomeschool.com/inclusion-policy'),
    ('LANGUAGE_POLICY', 'Language Policy', 'smartioushomeschool.com/language-policy'),
    ('CHILD_PROTECTION_POLICY', 'Child Protection & Safeguarding Policy', 'smartioushomeschool.com/child-protection'),
    ('PRIVACY_POLICY', 'Privacy Policy', 'smartioushomeschool.com/privacy'),
]
JS = r"""
const fs = require('fs'); const s = fs.readFileSync(process.argv[1], 'utf8'); const out = {};
for (const n of JSON.parse(process.argv[2])) {
  const head = 'const ' + n + ' = ['; const i = s.indexOf(head); const j = s.indexOf('\n]', i);
  if (i < 0 || j < 0) throw new Error('missing ' + n);
  out[n] = new Function('return ' + s.slice(i + head.length - 1, j + 2))();
}
process.stdout.write(JSON.stringify(out));
"""
texts = json.loads(subprocess.check_output(
    ['node', '-e', JS, os.path.join(FRONT, 'src', 'pages', 'LandingPage.jsx'), json.dumps([p[0] for p in POLICIES])]))

# ── Type and colour ──────────────────────────────────────────
def font(name, path, fallback):
    try:
        pdfmetrics.registerFont(TTFont(name, path)); return name
    except Exception:
        return fallback
SANS = font('Sans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'Helvetica')
SANS_B = font('Sans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'Helvetica-Bold')
from reportlab.lib.fonts import addMapping
SERIF_B = font('Serif-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 'Times-Bold')

if SANS == 'Sans':
    addMapping('Sans', 0, 0, 'Sans'); addMapping('Sans', 1, 0, 'Sans-Bold')
    addMapping('Sans', 0, 1, 'Sans'); addMapping('Sans', 1, 1, 'Sans-Bold')

CRIMSON = colors.HexColor('#8B1A2E'); GOLD = colors.HexColor('#C9973A'); INK = colors.HexColor('#121928')
GREY = colors.HexColor('#5B6475'); LINE = colors.HexColor('#D9CFBC'); BONE = colors.HexColor('#FBF7EF')

S = {
    'title': ParagraphStyle('title', fontName=SERIF_B, fontSize=26, leading=31, textColor=INK, alignment=TA_CENTER),
    'sub': ParagraphStyle('sub', fontName=SANS, fontSize=11, leading=16, textColor=GREY, alignment=TA_CENTER),
    'h1': ParagraphStyle('h1', fontName=SERIF_B, fontSize=16, leading=20, textColor=CRIMSON, spaceBefore=4, spaceAfter=8),
    'h2': ParagraphStyle('h2', fontName=SANS_B, fontSize=10.5, leading=14, textColor=INK, spaceBefore=8, spaceAfter=3),
    'body': ParagraphStyle('body', fontName=SANS, fontSize=9.2, leading=13.4, textColor=INK, spaceAfter=4),
    'small': ParagraphStyle('small', fontName=SANS, fontSize=8, leading=11, textColor=GREY),
    'label': ParagraphStyle('label', fontName=SANS_B, fontSize=7.6, leading=10, textColor=GREY),
    'box': ParagraphStyle('box', fontName=SANS, fontSize=9.4, leading=14, textColor=INK),
}
esc = lambda t: str(t).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

# ── Fillable fields ──────────────────────────────────────────
_ids = {}
def fid(name):
    base = ''.join(c if c.isalnum() else '_' for c in name.lower()).strip('_')[:40]
    _ids[base] = _ids.get(base, 0) + 1
    return base if _ids[base] == 1 else f'{base}_{_ids[base]}'

class Fields(Flowable):
    """A row of labelled, fillable text fields. cols = [(label, width_fraction[, field_name]), ...]"""
    def __init__(self, cols, height=17, lines=1):
        super().__init__(); self.cols = cols; self.h = height * lines + 12; self.lines = lines
    def wrap(self, aw, ah):
        self.aw = aw; return aw, self.h
    def draw(self):
        c = self.canv; x = 0; gap = 6
        for i, col in enumerate(self.cols):
            label, frac = col[0], col[1]; name = col[2] if len(col) > 2 else label
            w = self.aw * frac - (gap if i < len(self.cols) - 1 else 0)
            c.setFont(SANS_B, 7.2); c.setFillColor(GREY); c.drawString(x, self.h - 8, label.upper())
            fh = self.h - 12
            c.acroForm.textfield(name=fid(name), x=x, y=0, width=w, height=fh, borderWidth=0.6,
                                 borderColor=LINE, fillColor=colors.white, textColor=INK, fontName='Helvetica',
                                 fontSize=9 if self.lines == 1 else 8.5, fieldFlags='multiline' if self.lines > 1 else '',
                                 relative=True)
            x += self.aw * frac

class Check(Flowable):
    """A fillable checkbox with a paragraph beside it."""
    def __init__(self, text, name):
        super().__init__(); self.p = Paragraph(text, S['body']); self.name = name
    def wrap(self, aw, ah):
        self.aw = aw; _, self.ph = self.p.wrap(aw - 20, ah); return aw, max(self.ph, 13) + 3
    def draw(self):
        c = self.canv
        c.acroForm.checkbox(name=fid(self.name), x=0, y=self.ph - 11, size=11, borderWidth=0.7, borderColor=CRIMSON,
                            fillColor=colors.white, buttonStyle='check', relative=True)
        self.p.drawOn(c, 20, 0)

class SignBlock(Flowable):
    """Signature line (signed by hand or e-signature) + fillable name and date."""
    def __init__(self, who):
        super().__init__(); self.who = who
    def wrap(self, aw, ah):
        self.aw = aw; return aw, 62
    def draw(self):
        c = self.canv; w = self.aw
        c.setFillColor(BONE); c.setStrokeColor(LINE); c.setLineWidth(0.6); c.roundRect(0, 0, w, 62, 4, fill=1, stroke=1)
        c.setFont(SANS_B, 8); c.setFillColor(CRIMSON); c.drawString(10, 49, self.who.upper())
        c.setStrokeColor(INK); c.setLineWidth(0.7); c.line(10, 16, w * 0.46, 16)
        c.setFont(SANS, 7); c.setFillColor(GREY); c.drawString(10, 6, 'Signature')
        for label, x0, x1 in (('Full name', w * 0.50, w * 0.80), ('Date', w * 0.82, w - 10)):
            c.drawString(x0, 6, label)
            c.acroForm.textfield(name=fid(self.who + ' ' + label), x=x0, y=14, width=x1 - x0, height=18, borderWidth=0,
                                 fillColor=colors.white, textColor=INK, fontName='Helvetica', fontSize=9, relative=True)
            c.setStrokeColor(INK); c.line(x0, 16, x1, 16)

def boxed(paras, bg=BONE, border=CRIMSON):
    t = Table([[p] for p in paras], colWidths=['100%'])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), bg), ('LINEBEFORE', (0, 0), (0, -1), 3, border),
                           ('LEFTPADDING', (0, 0), (-1, -1), 12), ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                           ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return t

# ── Page furniture ───────────────────────────────────────────
class Doc(BaseDocTemplate):
    def __init__(self, path):
        super().__init__(path, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=22 * mm, bottomMargin=20 * mm,
                         title='Smartious Admission Agreement 2026', author='Smartious E-School Ltd',
                         subject='Admission agreement, fees, policies and declarations')
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='f')
        self.addPageTemplates([PageTemplate('p', [frame], onPage=self.furniture)])
    def furniture(self, c, doc):
        W, H = A4
        c.saveState()
        c.setFillColor(CRIMSON); c.rect(0, H - 6, W, 6, fill=1, stroke=0)
        if doc.page > 1:
            c.setFont(SANS_B, 7.5); c.setFillColor(CRIMSON); c.drawString(18 * mm, H - 14 * mm, 'SMARTIOUS  ·  ADMISSION AGREEMENT 2026')
            c.setFont(SANS, 7.5); c.setFillColor(GREY); c.drawRightString(W - 18 * mm, H - 14 * mm, 'Student name: ______________________')
        c.setStrokeColor(LINE); c.setLineWidth(0.5); c.line(18 * mm, 14 * mm, W - 18 * mm, 14 * mm)
        c.setFont(SANS, 7); c.setFillColor(GREY)
        c.drawString(18 * mm, 9.5 * mm, 'Smartious E-School Ltd · Diamond Plaza I, Parklands, Nairobi · hello@smartioushomeschool.com · +254 745 021 212')
        c.drawRightString(W - 18 * mm, 9.5 * mm, f'Page {doc.page}')
        c.restoreState()

# ── Content ──────────────────────────────────────────────────
story = []
P = lambda t, st='body': Paragraph(t, S[st])

# Cover and instructions
if os.path.exists(LOGO):
    story += [Spacer(1, 18 * mm), Image(LOGO, width=62 * mm, height=62 * mm * 441 / 1200), Spacer(1, 10 * mm)]
story += [P('Admission Agreement', 'title'), Spacer(1, 4),
          P(f'2026 academic year · Effective {EFFECTIVE}', 'sub'), Spacer(1, 14 * mm)]
story.append(boxed([
    P('<b>Before your child’s first lesson</b>', 'box'),
    P('1. Complete Sections A and B with the student’s and parent’s details.', 'box'),
    P('2. Read the fees (Section C) and every policy in Section D. They are also published at smartioushomeschool.com.', 'box'),
    P('3. Tick the consents in Section E.', 'box'),
    P('4. The <b>student</b> and a <b>parent or legal guardian</b> sign the declarations in Section F. Students aged 18 or over who pay their own fees sign both.', 'box'),
    P('5. Return the signed agreement to <b>hello@smartioushomeschool.com</b> or upload it in the parent portal.', 'box'),
    P('<b>Lessons begin only after Smartious has received this signed agreement.</b>', 'box'),
]))
story += [Spacer(1, 8 * mm), P('You can fill in the fields on screen and sign electronically, or print the agreement and sign by hand. '
                              'Please keep a copy for your records.', 'small'), PageBreak()]

# Section A — student
story += [P('Section A · Student details', 'h1'),
          Fields([('Student full name (as on passport or birth certificate)', 0.66), ('Date of birth', 0.34)]),
          Fields([('Nationality', 0.33), ('Country of residence', 0.33), ('Time zone', 0.34)]),
          Fields([('Student email', 0.5), ('Student phone / WhatsApp', 0.5)]),
          Fields([('Curriculum', 0.34), ('Year / grade joining', 0.33), ('Intended start date', 0.33)]),
          Fields([('Programme (online school, homeschool, 1-on-1 tuition)', 0.6), ('Subjects', 0.4)]),
          Fields([('Previous school and last year completed', 1.0)]),
          Fields([('Languages spoken at home', 0.5), ('First language', 0.5)]),
          P('Learning needs, disabilities, health or medical information we should know to keep the student safe and support them well '
            '(see the Inclusion Policy). This information is kept confidential.', 'small'),
          Fields([('Learning needs and support', 1.0)], lines=3),
          Fields([('Medical conditions, allergies, medication', 1.0)], lines=2),
          Spacer(1, 6)]

# Section B — parents
story += [P('Section B · Parent or guardian details', 'h1')]
for n, k in (('Parent / guardian 1', 'p1'), ('Parent / guardian 2 (optional)', 'p2')):
    story += [P(n, 'h2'),
              Fields([('Full name', 0.5, k + ' name'), ('Relationship to student', 0.5, k + ' relationship')]),
              Fields([('Email', 0.5, k + ' email'), ('Phone / WhatsApp', 0.5, k + ' phone')]),
              Fields([('Home address', 1.0, k + ' address')])]
story += [P('Fee payer and emergency contact', 'h2'),
          Fields([('Person responsible for fees', 0.5), ('Invoice email', 0.5)]),
          Fields([('Emergency contact name', 0.4, 'emergency name'), ('Relationship', 0.3, 'emergency relationship'), ('Phone', 0.3, 'emergency phone')]),
          PageBreak()]

# Section C — fees
story += [P('Section C · Fees and payment terms', 'h1')]
fees = Table([
    [P('<b>Programme</b>'), P('<b>Fee</b>'), P('<b>Billing</b>')],
    [P('Online school and homeschool, every year group and curriculum'), P('USD 423 per month'), P('Paid termly, in advance')],
    [P('One-to-one tuition, any subject, any level'), P('USD 15 per hour'), P('As booked')],
    [P('External examination fees (Cambridge, Pearson Edexcel, IB, College Board)'), P('Board rate'), P('Separate, before entry')],
], colWidths=['52%', '22%', '26%'])
fees.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), BONE), ('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE),
                          ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
story += [fees, Spacer(1, 8), boxed([
    P('<b>Refunds.</b> Fees are non-refundable once the student’s assessment has been done, the timetable has been created and '
      'lessons have started. This applies to the whole term paid for. Before that point, tuition paid in advance is refunded, '
      'less the application fee once the assessment has been served. To withdraw at the end of a term, tell Smartious in writing '
      'before the next term’s invoice is due.', 'box')]),
    Spacer(1, 6),
    P('All fees are stated in US Dollars; local currency amounts are shown for convenience only. Payments are made through Paystack '
      '(M-Pesa, Visa, Mastercard, bank transfer, Apple Pay). Full terms are in the Terms of Service in Section D.'),
    PageBreak()]

# Section D — policies in full
story += [P('Section D · Policies', 'h1'),
          P('These are the policies in force on the date of signing. They are the same as the versions published on our website. '
            'By signing Section F you confirm that you have read them.'), Spacer(1, 4)]
for key, title, url in POLICIES:
    block = [P(f'{title}', 'h1'), P(f'Published at {url}', 'small'), Spacer(1, 4)]
    secs = texts[key]
    story.append(KeepTogether(block + [P(esc(secs[0]['h']), 'h2'), P(esc(secs[0]['p']))]))
    for s in secs[1:]:
        story.append(KeepTogether([P(esc(s['h']), 'h2'), P(esc(s['p']))]))
    story.append(Spacer(1, 10))
story.append(PageBreak())

# Section E — consents
story += [P('Section E · Consents', 'h1'),
          P('Please tick each box you agree to. Consents marked <b>required</b> are needed for the student to learn with Smartious.'),
          Spacer(1, 4),
          Check('<b>Required.</b> Smartious may process the student’s and parents’ personal data to provide education, as set out in the Privacy Policy.', 'consent data'),
          Check('<b>Required.</b> Live lessons may be recorded so students can review them and for safeguarding, as set out in the Child Protection and Privacy policies.', 'consent recording'),
          Check('<b>Required.</b> Smartious may share the student’s details with examination boards and examination centres to enter the student for external examinations.', 'consent exams'),
          Check('Smartious may contact me by email, phone and WhatsApp about the student’s learning, fees and school news.', 'consent contact'),
          Check('Smartious may use the student’s first name, photographs or work on its website and social media. (Optional: you may withdraw this at any time.)', 'consent media'),
          Check('The student may use the Mshauri AI tutor under the AI Use Policy.', 'consent ai'),
          PageBreak()]

# Section F — declarations
story += [P('Section F · Declarations and signatures', 'h1'), P('Student declaration', 'h2')]
for t in ['I will do my own work and acknowledge every source I use.',
          'I will not copy, buy or share answers, and I will not use AI tools in tests or assessed work unless my teacher allows it, and I will say when I have used them.',
          'I understand that my marks, grades, reports and certificates will never be changed for any favour, gift, payment or pressure, from anyone, and that offering one is a serious breach.',
          'I will treat teachers and other students with respect, online and in lessons, and follow the Child Protection rules for safe online learning.',
          'I have read, or had explained to me, the Academic Integrity, AI Use, Language and Inclusion policies.']:
    story.append(Check(t, 'student decl'))
story += [Spacer(1, 6), SignBlock('Student'), Spacer(1, 12), P('Parent or guardian declaration', 'h2')]
for t in ['The information in this agreement is complete and accurate, and I will tell Smartious promptly if it changes.',
          'I accept the fees in Section C: USD 423 per month, paid termly in advance, and USD 15 per hour for one-to-one tuition.',
          'I understand that fees are non-refundable once the assessment has been done, the timetable has been created and lessons have started.',
          'I understand that no student record will be changed in any way, for any reason, in return for any favour, and that offering a favour may end the enrolment.',
          'I have read and agree to the Terms of Service and the policies in Section D, and I will support my child to follow them.']:
    story.append(Check(t, 'parent decl'))
story += [Spacer(1, 6), SignBlock('Parent or guardian'), Spacer(1, 14)]

office = Table([[P('<b>FOR SMARTIOUS USE ONLY</b>', 'label')],
                [Fields([('Admission number', 0.34), ('Received by', 0.33), ('Date received', 0.33)])],
                [Fields([('Assessment date', 0.34), ('Timetable created on', 0.33), ('First lesson date', 0.33)])],
                [SignBlock('Admissions, for Smartious')]], colWidths=['100%'])
office.setStyle(TableStyle([('BOX', (0, 0), (-1, -1), 0.8, GOLD), ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFDF8')),
                            ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10)]))
story.append(KeepTogether(office))

Doc(OUT).build(story)
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
