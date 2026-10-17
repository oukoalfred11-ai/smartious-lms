"""
admission-pdf.py — builds the Smartious Admission Pack PDF.

    python3 frontend/scripts/admission-pdf.py

The policy text is read from the same arrays the website renders
(TERMS_OF_SERVICE, ACADEMIC_INTEGRITY_POLICY … in src/pages/LandingPage.jsx),
so the signed agreement always matches the published policies. Re-run this
script whenever a policy changes and commit the new PDF.

Output: frontend/public/Smartious_Admission_Pack_2026.pdf
Part 1 is information for families; Part 2 is the agreement they sign and return.
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
OUT = os.environ.get('OUT') or os.path.join(FRONT, 'public', 'Smartious_Admission_Pack_2026.pdf')
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
                         title='Smartious Admission Pack 2026-27', author='Smartious E-School Ltd',
                         subject='Admission pack: information, fees, policies, forms and declarations')
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='f')
        self.addPageTemplates([PageTemplate('p', [frame], onPage=self.furniture)])
    def furniture(self, c, doc):
        W, H = A4
        c.saveState()
        c.setFillColor(CRIMSON); c.rect(0, H - 6, W, 6, fill=1, stroke=0)
        if doc.page > 1:
            c.setFont(SANS_B, 7.5); c.setFillColor(CRIMSON); c.drawString(18 * mm, H - 14 * mm, 'SMARTIOUS  ·  ADMISSION PACK 2026–27')
            c.setFont(SANS, 7.5); c.setFillColor(GREY); c.drawRightString(W - 18 * mm, H - 14 * mm, 'Student name: ______________________')
        c.setStrokeColor(LINE); c.setLineWidth(0.5); c.line(18 * mm, 14 * mm, W - 18 * mm, 14 * mm)
        c.setFont(SANS, 7); c.setFillColor(GREY)
        c.drawString(18 * mm, 9.5 * mm, 'Smartious E-School Ltd · hello@smartioushomeschool.com · Admissions +254 745 021 212 · Academic +254 182 071 920')
        c.drawRightString(W - 18 * mm, 9.5 * mm, f'Page {doc.page}')
        c.restoreState()

# ── Content ──────────────────────────────────────────────────
story = []
P = lambda t, st='body': Paragraph(t, S[st])

# ── Cover ─────────────────────────────────────────────────────
if os.path.exists(LOGO):
    story += [Spacer(1, 16 * mm), Image(LOGO, width=66 * mm, height=66 * mm * 441 / 1200), Spacer(1, 10 * mm)]
story += [P('Admission Pack', 'title'), Spacer(1, 4),
          P(f'2026–27 academic year · Effective {EFFECTIVE}', 'sub'), Spacer(1, 12 * mm)]
contents = [('Part 1 · Welcome and information', ''),
            ('1  Welcome from the Principal', ''), ('2  About Smartious', ''), ('3  Programmes and curricula', ''),
            ('4  How admission works', ''), ('5  Documents to submit', ''), ('6  Fees and payment', ''),
            ('7  Academic calendar 2026–27', ''), ('8  Recommended devices and getting ready', ''),
            ('9  Reports, examinations and university guidance', ''), ('10  Expectations in lessons', ''),
            ('11  Attendance and absence', ''), ('12  Who to contact', ''),
            ('Part 2 · Admission Agreement (sign and return)', ''),
            ('A  Student details   ·   B  Parent or guardian details   ·   C  Fees and payment terms', ''),
            ('D  Policies   ·   E  Consents   ·   F  Declarations and signatures', '')]
story.append(boxed([P(('<b>%s</b>' % t) if t.startswith('Part') else t, 'box') for t, _ in contents]))
story += [Spacer(1, 8 * mm),
          P('<b>Lessons begin only after Smartious has received the signed Admission Agreement (Part 2) and the first term’s fees.</b>', 'box'),
          PageBreak()]

def section(title, *paras):
    out = [P(title, 'h1')]
    for x in paras:
        out.append(x if not isinstance(x, str) else P(x))
    return out

def bullets(items):
    return [P('•&nbsp;&nbsp;' + t) for t in items]

# ── Part 1 ────────────────────────────────────────────────────
story += [P('PART 1 · WELCOME AND INFORMATION', 'label'), Spacer(1, 4)]
story += section('1  Welcome from the Principal',
    'Dear parents, guardians and students,',
    'Thank you for choosing Smartious. Whether your child is joining our online school, learning at home with us, or taking '
    'one-to-one tuition, you are joining a school that has taught families across Kenya and more than 40 countries since 2018.',
    'Our promise is simple: qualified teachers who know your child, small live classes, honest feedback and records you can trust. '
    'Every grade we give reflects what your child has truly achieved, and no record is ever changed for any favour. That is what '
    'makes a Smartious report and a Smartious reference worth something to universities and employers.',
    'This pack tells you how admission works, what to prepare, and what we expect of each other. Part 2 is the agreement that the '
    'student and a parent or guardian sign before lessons begin. Please read it with your child, and contact us with any question.',
    'We look forward to teaching your child.',
    Spacer(1, 6), P('<b>The Principal</b><br/>Smartious E-School Ltd'))
story += section('2  About Smartious',
    'Smartious E-School Ltd is an international online and home-based school founded in Nairobi in 2018. We teach the Cambridge, '
    'Pearson Edexcel, IB and American curricula, the Kenyan CBC, and the Ontario Secondary School Diploma (OSSD) through our '
    'partnership with Canadian Cross International School.',
    'Lessons are taught live by qualified subject specialists, in small groups or one to one, at times that suit each family’s '
    'time zone. Our learning platform brings lessons, homework, assessments, reports and invoices together in one place for '
    'students and parents.')
story += section('3  Programmes and curricula')
prog = Table([
    [P('<b>Programme</b>'), P('<b>What it includes</b>')],
    [P('Online school and homeschool'), P('Full-time live classes in small groups of 4–6 students, every subject in the chosen curriculum, '
       'homework and assessments, recorded lessons for review, the Mshauri AI tutor, termly reports and university guidance.')],
    [P('One-to-one tuition'), P('Live online sessions with a subject specialist in any subject, at any level, scheduled to your time zone.')],
    [P('Curricula'), P('Cambridge Primary, Lower Secondary, IGCSE and A-Level · Pearson Edexcel IGCSE and A-Level · IB · American '
       'curriculum and AP · Kenyan CBC · Ontario OSSD.')],
    [P('Languages'), P('French, Spanish, German, Mandarin Chinese, Arabic, Kiswahili, Italian and Portuguese.')],
], colWidths=['28%', '72%'])
prog.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), BONE), ('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE),
                          ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]))
story += [prog, PageBreak()]

story += section('4  How admission works')
steps = [('Apply', 'Complete the online application or contact our admissions team. We arrange a free consultation call.'),
         ('Assessment', 'Your child sits a placement assessment so we can place them at the right level and plan support.'),
         ('Learning plan and timetable', 'We agree the programme, subjects and any support with you, and create the timetable.'),
         ('Sign and pay', 'The student and a parent sign the Admission Agreement (Part 2) and pay the first term’s fees.'),
         ('Orientation and first lesson', 'We set up portal accounts, run a short orientation, and lessons begin.')]
st = Table([[P(f'<b>{i + 1}</b>', 'h2'), P(f'<b>{h}</b><br/>{t}')] for i, (h, t) in enumerate(steps)], colWidths=['8%', '92%'])
st.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('TEXTCOLOR', (0, 0), (0, -1), CRIMSON), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]))
story += [st, Spacer(1, 6), boxed([P('Fees become non-refundable once the assessment is done, the timetable is created and lessons have started.', 'box')])]

story += section('5  Documents to submit',
    'Upload these with the signed agreement in the student or parent portal, under Admission Documents, or reply to your Admission Pack email with them attached. '
    'Tick each one as you include it.')
for t in ['Signed Admission Agreement (Part 2 of this pack)',
          'Copy of the student’s passport or birth certificate',
          'One recent passport-size photograph of the student',
          'The student’s most recent school report',
          'Copies of any examination certificates already achieved (for example IGCSE results)',
          'Any assessment or specialist reports about learning needs (educational psychologist, therapist, doctor), if you have them',
          'Proof of payment of the first term’s fees']:
    story.append(Check(t, 'document'))

story += [PageBreak()]
story += section('6  Fees and payment',
    'Online school and homeschool: from <b>USD 423 per month</b> for Primary. Fees for secondary, IGCSE, A-Level and IB vary by '
    'curriculum and level; we confirm your child’s fee in writing after the assessment, and it is recorded in Section C. '
    'Fees are paid termly in advance. One-to-one tuition: <b>USD 15 per hour</b>. External examination fees are separate and charged at the examination board’s rate. '
    'Sibling discounts and need-based bursaries may be available; ask our admissions team in confidence.',
    'Payments are made through Paystack: M-Pesa, Visa, Mastercard, bank transfer or Apple Pay. The full payment terms are in '
    'Section C and the Terms of Service in Part 2.')

story += section('7  Academic calendar 2026–27')
cal = Table([[P('<b>Term</b>'), P('<b>Dates</b>'), P('<b>Half-term</b>'), P('<b>Notes</b>')],
             [P('Term 1'), P('25 August – 4 December 2026'), P('12–16 October 2026'), P('Teacher training week 17–21 August')],
             [P('Term 2'), P('5 January – 25 March 2027'), P('15–19 February 2027'), P('Mock examinations')],
             [P('Term 3'), P('13 April – early July 2027'), P('Late May 2027'), P('External examinations (provisional)')]],
            colWidths=['14%', '32%', '24%', '30%'])
cal.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), BONE), ('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE),
                         ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]))
story += [cal, Spacer(1, 4), P('Students can join at any point in the year. Examination entry deadlines are set by each board; we will tell you yours.', 'small')]

story.append(PageBreak())
story += section('8  Recommended devices and getting ready',
    'At Smartious, <b>notes and examinations are handwritten</b>. Writing by hand builds the handwriting, speed and accuracy '
    'students need in Cambridge, Pearson Edexcel and IB examination halls, where answers are written on paper. Students therefore '
    'need a device they can write on with a pen, not only type on. We recommend one of these two.')
ASSETS = os.path.join(HERE, 'assets')
def device_card(img, name, kind, points):
    cell = []
    path = os.path.join(ASSETS, img)
    if os.path.exists(path):
        from PIL import Image as PILImage
        w, h = PILImage.open(path).size
        cell += [Image(path, width=62 * mm, height=62 * mm * h / w), Spacer(1, 4)]
    cell += [P(f'<font color="#8B1A2E"><b>{kind}</b></font>', 'small'), P(f'<b>{name}</b>', 'h2')]
    cell += [P('•&nbsp;&nbsp;' + t) for t in points]
    return cell
cards = Table([[device_card('device-ipad-pro-11.jpg', 'Apple iPad Pro 11-inch with stylus pen', 'OPTION 1 · TABLET',
                            ['Apple Pencil or a compatible stylus pen for handwritten notes, worksheets and examinations.',
                             'Light and portable, with a long battery life.',
                             'Front camera and microphones for live lessons.']),
                device_card('device-thinkpad-x390-yoga.jpg', 'Lenovo ThinkPad X390 Yoga with pen', 'OPTION 2 · 2-IN-1 LAPTOP',
                            ['Folds from a laptop into a tablet for writing with the pen.',
                             'A full keyboard for typed coursework and Windows software.',
                             'Camera and microphones for live lessons.'])]],
              colWidths=['50%', '50%'])
cards.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('BOX', (0, 0), (0, 0), 0.6, LINE), ('BOX', (1, 0), (1, 0), 0.6, LINE),
                           ('BACKGROUND', (0, 0), (-1, -1), colors.white), ('LEFTPADDING', (0, 0), (-1, -1), 12),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 12), ('TOPPADDING', (0, 0), (-1, -1), 10), ('BOTTOMPADDING', (0, 0), (-1, -1), 10)]))
story += [Spacer(1, 4), cards, Spacer(1, 8),
          boxed([P('<b>Already have a device?</b> Another tablet or 2-in-1 laptop can work if it has an active stylus pen, a camera and a '
                   'microphone. Please check with us before buying. Phones are not suitable for lessons or examinations.', 'box')]),
          P('Also needed', 'h2')]
story += bullets(['A reliable internet connection, and a backup such as mobile data for examination days.',
                  'A headset with a microphone, and a quiet, well-lit place to learn, with a parent or guardian nearby for younger students.',
                  'Exercise books, a scientific calculator for secondary maths and science, and the textbooks your teacher lists.',
                  'Your student and parent portal logins, which we send after admission. Keep them private.'])
story.append(PageBreak())
story += section('9  Reports, examinations and university guidance')
story += bullets(['Parents can follow attendance, homework, marks and invoices in the parent portal.',
                  'Written progress reports every term, with grades, and a parent–teacher consultation each term.',
                  'We enter students for Cambridge, Pearson Edexcel, IB and College Board examinations and guide families through entry deadlines and access arrangements.',
                  'University and careers guidance from Year 10, including UCAS, Common App and applications worldwide.'])
story += section('10  Expectations in lessons')
story += bullets(['Join on time, with camera on unless your teacher says otherwise, and be ready to take part.',
                  'Dress and behave as you would in a classroom, and choose a suitable background.',
                  'Be kind and respectful to teachers and classmates, in lessons and in the student community.',
                  'Do your own work, and use AI only as the AI Use Policy allows.',
                  'Do not record, share or post lessons or teaching materials.',
                  'If you miss a lesson, watch the recording and catch up on the work.'])
story += section('11  Attendance and absence: the family’s responsibility')
story.append(boxed([P('<b>Attendance is the responsibility of the parent or guardian and the student.</b> Smartious teaches every '
                      'scheduled lesson, sends lesson reminders to students and parents, records attendance in every lesson and shows it in '
                      'the parent portal. We do not supervise students at home, and we are not responsible for lessons a student misses.', 'box')]))
story += [Spacer(1, 4)]
story += bullets(['<b>Check the parent portal.</b> Attendance, homework and marks are visible to parents at all times. Please check them at '
                  'least once a week. The attendance recorded in the portal is the official record.',
                  '<b>Absences must be reported by a parent.</b> If the student cannot attend, a parent or guardian tells the Academic office '
                  '(+254 182 071 920, call or WhatsApp, or academics@smartioushomeschool.com) before the lesson. A message from the student '
                  'alone, including a student telling us they are unwell, is not an authorised absence until a parent confirms it.',
                  '<b>Calls and messages from us are a courtesy.</b> When a student is missing from a lesson we may call or message the '
                  'student or the parent, but we are not obliged to, and a call not made does not make Smartious responsible for the absence.',
                  '<b>Missed lessons.</b> Lessons missed by the student are not refunded, credited or repeated. The student catches up from the '
                  'lesson recording and the work set in the portal. Lessons that Smartious cancels are rescheduled.',
                  '<b>Keep your details up to date.</b> Reminders and attendance alerts go to the phone numbers and email addresses in Section B. '
                  'Tell us straight away if they change.',
                  '<b>Results.</b> Poor attendance affects progress, reports and examination results. Smartious is not responsible for the '
                  'academic consequences of lessons the student did not attend.'])
story += section('12  Who to contact')
ct = Table([[P('<b>Admissions, fees and enrolment</b>'), P('+254 745 021 212 (call or WhatsApp) · admissions@smartioushomeschool.com')],
            [P('<b>Academic matters</b><br/>lessons, timetable, homework, reports, examinations'), P('+254 182 071 920 · academics@smartioushomeschool.com')],
            [P('<b>General questions</b>'), P('hello@smartioushomeschool.com')],
            [P('<b>Safeguarding concerns</b>'), P('safeguarding@smartioushomeschool.com · +254 745 021 212')],
            [P('<b>Office and website</b>'), P('Diamond Plaza I Parklands Annex, 3rd Floor, Nairobi, Kenya · smartioushomeschool.com')]], colWidths=['40%', '60%'])
ct.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]))
story += [ct, PageBreak()]

# ── Part 2 · Admission Agreement ──────────────────────────────
story += [P('PART 2 · ADMISSION AGREEMENT', 'label'), Spacer(1, 4), P('Admission Agreement', 'h1')]
story.append(boxed([
    P('<b>Complete, sign and return before the first lesson</b>', 'box'),
    P('1. Complete Sections A and B with the student’s and parent’s details.', 'box'),
    P('2. Read the fees (Section C) and every policy in Section D. They are also published at smartioushomeschool.com.', 'box'),
    P('3. Tick the consents in Section E.', 'box'),
    P('4. The <b>student</b> and a <b>parent or legal guardian</b> sign the declarations in Section F. Students aged 18 or over who pay their own fees sign both.', 'box'),
    P('5. Upload the signed agreement and the documents in item 5 of Part 1 in your portal under <b>Admission Documents</b>, or reply to your Admission Pack email with them attached.', 'box'),
]))
story += [Spacer(1, 6), P('You can fill in the fields on screen and sign electronically, or print the pages and sign by hand. Please keep a copy for your records.', 'small'),
          Spacer(1, 10)]

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
story += [PageBreak(), P('Section B · Parent or guardian details', 'h1')]
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
    [P('Online school and homeschool, Primary'), P('From USD 423 per month'), P('Paid termly, in advance')],
    [P('Online school and homeschool, secondary, IGCSE, A-Level and IB'), P('Varies by curriculum and level'), P('Paid termly, in advance')],
    [P('One-to-one tuition, any subject, any level'), P('USD 15 per hour'), P('As booked')],
    [P('External examination fees (Cambridge, Pearson Edexcel, IB, College Board)'), P('Board rate'), P('Separate, before entry')],
], colWidths=['52%', '22%', '26%'])
fees.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), BONE), ('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE),
                          ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
story += [fees, Spacer(1, 8),
          P('<b>Fee for this student</b> (completed by Smartious after the assessment)', 'h2'),
          Fields([('Programme and level', 0.4, 'fee programme'), ('Monthly fee (USD)', 0.2, 'fee monthly'),
                  ('Fee per term (USD)', 0.2, 'fee term'), ('Confirmed by', 0.2, 'fee confirmed by')]),
          Spacer(1, 6), boxed([
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
          'I will attend every lesson on time. If I cannot attend, I will ask my parent or guardian to tell Smartious before the lesson; telling my teacher or classmates is not enough.',
          'I have read, or had explained to me, the Academic Integrity, AI Use, Language and Inclusion policies.']:
    story.append(Check(t, 'student decl'))
story += [Spacer(1, 6), SignBlock('Student'), Spacer(1, 12), P('Parent or guardian declaration', 'h2')]
for t in ['The information in this agreement is complete and accurate, and I will tell Smartious promptly if it changes.',
          'I accept the fee confirmed for my child in Section C, paid termly in advance, and USD 15 per hour for any one-to-one tuition.',
          'I understand that fees are non-refundable once the assessment has been done, the timetable has been created and lessons have started.',
          'I understand that no student record will be changed in any way, for any reason, in return for any favour, and that offering a favour may end the enrolment.',
          'I accept that my child’s attendance is my responsibility and my child’s, not Smartious’s. I will check attendance in the parent portal at least weekly and report any absence myself before the lesson, and I understand that lessons my child misses are not refunded, credited or repeated.',
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
