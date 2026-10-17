"""
portfolio-pdf.py — builds the Smartious Company Portfolio 2026 PDF.

    python3 frontend/scripts/portfolio-pdf.py

Output: frontend/public/smartious-portfolio-2026.pdf (override with OUT=...)

A rebuild of the old "Smartious_Company_Portfolio_2026 (2).pdf" with the same
sections and wording. Only the facts that had gone out of date were changed:
prices (from USD 423 per month for Primary, paid termly; other levels quoted
after assessment; one-to-one tuition USD 15 per hour), the head-office address,
the date line, and price-dependent offers that are not current (subscription
tiers, fixed discount percentages). The layout is compact: sections flow on and
only start a new page when little room is left. Accreditation and partnership wording is copied exactly from
the old portfolio; do not edit it here without sign-off.
Brand style (crimson, gold, cream, logo, page furniture) follows admission-pdf.py.
"""
import io, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
                                Flowable, Table, TableStyle, KeepTogether, CondPageBreak)

HERE = os.path.dirname(os.path.abspath(__file__))
FRONT = os.path.dirname(HERE)
OUT = os.environ.get('OUT') or os.path.join(FRONT, 'public', 'smartious-portfolio-2026.pdf')
LOGO = os.path.join(FRONT, 'public', 'brand', 'logo.png')
LOGO_RATIO = 441 / 1200

PRIMARY_FEE = 'From USD 423 per month (Primary), payable termly'
OTHER_FEES = 'Other levels quoted after assessment'
TUITION = 'USD 15 per hour, one to one'
ADDRESS = 'Diamond Plaza I Parklands Annex, 3rd Floor, Nairobi, Kenya'
FOOTER = 'smartioushomeschool.com  ·  hello@smartioushomeschool.com  ·  +254 745 021 212'

# ── Type and colour ──────────────────────────────────────────
def font(name, path, fallback):
    try:
        pdfmetrics.registerFont(TTFont(name, path)); return name
    except Exception:
        return fallback
LIB = '/usr/share/fonts/truetype/liberation/'
SANS = font('Sans', LIB + 'LiberationSans-Regular.ttf', 'Helvetica')
SANS_B = font('Sans-Bold', LIB + 'LiberationSans-Bold.ttf', 'Helvetica-Bold')
SANS_I = font('Sans-Italic', LIB + 'LiberationSans-Italic.ttf', 'Helvetica-Oblique')
SERIF = font('Serif', LIB + 'LiberationSerif-Regular.ttf', 'Times-Roman')
SERIF_I = font('Serif-Italic', LIB + 'LiberationSerif-Italic.ttf', 'Times-Italic')
if SANS == 'Sans':
    addMapping('Sans', 0, 0, SANS); addMapping('Sans', 1, 0, SANS_B); addMapping('Sans', 0, 1, SANS_I); addMapping('Sans', 1, 1, SANS_B)
if SERIF == 'Serif':
    addMapping('Serif', 0, 0, SERIF); addMapping('Serif', 0, 1, SERIF_I); addMapping('Serif', 1, 0, SERIF); addMapping('Serif', 1, 1, SERIF_I)

CRIMSON = colors.HexColor('#8B1A2E'); DEEP = colors.HexColor('#7D1025'); GOLD = colors.HexColor('#C9973A')
INK = colors.HexColor('#1E1E24'); CHAR = colors.HexColor('#4A4A52'); GREY = colors.HexColor('#7A7F8C')
LINE = colors.HexColor('#E3D9C6'); CREAM = colors.HexColor('#FCF9F3'); CARD = colors.HexColor('#F4ECE1'); WHITE = colors.white

def st(name, **kw):
    base = dict(fontName=SANS, fontSize=9.8, leading=14.2, textColor=CHAR)
    base.update(kw); return ParagraphStyle(name, **base)
S = {
    'kicker': st('kicker', fontName=SANS_B, fontSize=7.4, leading=10, textColor=GOLD),
    'h1': st('h1', fontName=SERIF, fontSize=25, leading=30, textColor=INK),
    'h3': st('h3', fontName=SERIF, fontSize=14, leading=17, textColor=INK),
    'body': st('body', spaceAfter=6),
    'lead': st('lead', fontSize=10.6, leading=15.6, spaceAfter=6),
    'sub': st('sub', fontName=SANS_B, fontSize=7.6, leading=10, textColor=CRIMSON),
    'cell': st('cell', fontSize=9.2, leading=13),
    'small': st('small', fontSize=8, leading=11.2, textColor=GREY),
    'label': st('label', fontName=SANS_B, fontSize=7.4, leading=10, textColor=GOLD),
    'price': st('price', fontName=SANS_B, fontSize=9.2, leading=12.6, textColor=CRIMSON),
    'num': st('num', fontName=SERIF, fontSize=22, leading=25, textColor=GOLD),
    'statn': st('statn', fontName=SERIF, fontSize=24, leading=27, textColor=CRIMSON),
    'statl': st('statl', fontName=SANS_B, fontSize=7.8, leading=10.4, textColor=INK),
    'year': st('year', fontName=SERIF, fontSize=13, leading=16, textColor=CRIMSON),
    'quote': st('quote', fontName=SERIF_I, fontSize=13, leading=18, textColor=INK),
    'big': st('big', fontName=SERIF, fontSize=23, leading=30, textColor=INK),
    'bigi': st('bigi', fontName=SERIF_I, fontSize=23, leading=30, textColor=CRIMSON),
    'toc': st('toc', fontName=SERIF, fontSize=12.5, leading=16, textColor=INK),
    'tocn': st('tocn', fontName=SERIF, fontSize=12.5, leading=16, textColor=GOLD),
    'tocp': st('tocp', fontName=SANS, fontSize=9, leading=16, textColor=GREY, alignment=2),
    'center': st('center', alignment=TA_CENTER),
}
P = lambda t, s='body': Paragraph(t, S[s] if isinstance(s, str) else s)
W_FULL = A4[0] - 40 * mm

# ── Building blocks ──────────────────────────────────────────
PAGES = {}
class Mark(Flowable):
    """Zero-size flowable that records the page it lands on (for the contents page)."""
    def __init__(self, key):
        super().__init__(); self.key = key
    def wrap(self, aw, ah):
        return 0, 0
    def draw(self):
        PAGES[self.key] = self.canv.getPageNumber()

class Rule(Flowable):
    def __init__(self, w=12 * mm, color=CRIMSON, weight=1.6):
        super().__init__(); self.w = w; self.color = color; self.weight = weight
    def wrap(self, aw, ah):
        return self.w, self.weight + 2
    def draw(self):
        self.canv.setStrokeColor(self.color); self.canv.setLineWidth(self.weight); self.canv.line(0, 1, self.w, 1)

def section(num, kicker, plain, accent, key=None, new_page=True):
    # Start on a new page only when there isn't room for the heading and a
    # good part of the section; otherwise continue on the same page.
    out = [CondPageBreak(110 * mm), Spacer(1, 12)] if new_page else []
    if key:
        out.append(Mark(key))
    out += [P(f'{num}  ·  {kicker}' if num else kicker, 'kicker'), Spacer(1, 2),
            P(f'{plain} <font name="{SERIF_I}" color="#8B1A2E">{accent}</font>', 'h1'), Spacer(1, 3), Rule(), Spacer(1, 10)]
    return out

def label(t):
    return [Spacer(1, 4), P(t.upper(), 'label'), Spacer(1, 4)]

def card(rows, pad=10, bg=CARD, space=8):
    t = Table([[r] for r in rows], colWidths=[W_FULL])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), bg), ('LEFTPADDING', (0, 0), (-1, -1), pad + 2),
                           ('RIGHTPADDING', (0, 0), (-1, -1), pad + 2), ('TOPPADDING', (0, 0), (-1, -1), 2),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 2), ('TOPPADDING', (0, 0), (-1, 0), pad),
                           ('BOTTOMPADDING', (0, -1), (-1, -1), pad), ('ROUNDEDCORNERS', [4, 4, 4, 4])]))
    return KeepTogether([t, Spacer(1, space)])

def grid(rows, widths, pad=6, lines=True, valign='TOP'):
    t = Table(rows, colWidths=widths)
    style = [('VALIGN', (0, 0), (-1, -1), valign), ('LEFTPADDING', (0, 0), (-1, -1), 0),
             ('RIGHTPADDING', (0, 0), (-1, -1), 10), ('TOPPADDING', (0, 0), (-1, -1), pad),
             ('BOTTOMPADDING', (0, 0), (-1, -1), pad)]
    if lines:
        style.append(('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE))
    t.setStyle(TableStyle(style)); return t

def stat(n, lbl, desc=None, num_style='statn'):
    out = [P(n, num_style), P(lbl, 'statl')]
    if desc:
        out += [Spacer(1, 2), P(desc, 'small')]
    return out

def stat_grid(items, cols=2):
    cells = [stat(*it, num_style='statn' if i % 2 == 0 else 'num') for i, it in enumerate(items)]
    rows = [cells[i:i + cols] for i in range(0, len(cells), cols)]
    return grid(rows, [W_FULL / cols] * cols, pad=9)

def numbered(items, title_style='h3'):
    rows = []
    for i, (title, body) in enumerate(items, 1):
        rows.append([P(f'{i:02d}', 'num'), [P(title, title_style), Spacer(1, 3), P(body, 'cell')]])
    return grid(rows, [16 * mm, W_FULL - 16 * mm], pad=8)

def programme(n, title, sub, body, price):
    head = Table([[P(f'{n:02d}', 'num'), [P(title, 'h3'), P(sub, 'sub')]]], colWidths=[14 * mm, W_FULL - 38 * mm])
    head.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                              ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 0),
                              ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return card([head, P(body, 'cell'), Spacer(1, 3)] + [P(p, 'price') for p in price])

def curriculum(tag, title, sub, body):
    return card([P(tag, 'label'), Spacer(1, 2), P(title, 'h3'), P(sub, 'sub'), Spacer(1, 3), P(body, 'cell')], pad=9, space=7)

def entry(title, body):
    return KeepTogether([P(f'<b>{title}</b>', st('et', fontSize=9.4, leading=13, textColor=INK)), P(body, 'cell'), Spacer(1, 7)])

def bullets(items):
    return [P(f'<font color="#C9973A">•</font>&nbsp;&nbsp;{t}', st('bl', fontSize=9.2, leading=13.2, leftIndent=11,
              firstLineIndent=-11, spaceAfter=4)) for t in items]

# ── Page furniture ───────────────────────────────────────────
def draw_logo(c, x, y, w):
    if os.path.exists(LOGO):
        c.drawImage(LOGO, x, y, width=w, height=w * LOGO_RATIO, mask='auto')

def cover(c, doc):
    W, H = A4
    c.saveState()
    c.setFillColor(CREAM); c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(DEEP); c.rect(0, 0, 14, H, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(14, 0, 2.2, H, fill=1, stroke=0)
    lw = 78 * mm; draw_logo(c, (W - lw) / 2, H - 92 * mm, lw)
    c.setStrokeColor(GOLD); c.setLineWidth(0.8); c.line(W / 2 - 34 * mm, H - 104 * mm, W / 2 + 34 * mm, H - 104 * mm)
    c.setFont(SANS_B, 8); c.setFillColor(GOLD)
    c.drawCentredString(W / 2, H - 111 * mm, 'C O M P A N Y   P O R T F O L I O   ·   2 0 2 6   E D I T I O N')
    c.setFont(SERIF, 40); c.setFillColor(INK); c.drawCentredString(W / 2, H - 132 * mm, 'Premium Education')
    c.setFont(SERIF_I, 40); c.setFillColor(CRIMSON); c.drawCentredString(W / 2, H - 149 * mm, 'with a Heart.')
    c.setFont(SANS, 10); c.setFillColor(CHAR)
    c.drawCentredString(W / 2, H - 165 * mm, 'Premium homeschooling, virtual schooling and tuition')
    c.drawCentredString(W / 2, H - 170.5 * mm, 'for the families of Kenya, the UAE and the world.')
    y = H - 222 * mm
    c.setStrokeColor(LINE); c.setLineWidth(0.8); c.line(30 * mm, y + 20 * mm, W - 30 * mm, y + 20 * mm)
    c.setStrokeColor(GOLD); c.line(30 * mm, y - 9 * mm, W - 30 * mm, y - 9 * mm)
    stats = [('3,421+', 'Students educated', CRIMSON), ('650+', 'Active learners', GOLD),
             ('40+', 'Countries', CRIMSON), ('Est. 2018', 'Nairobi, Kenya', GOLD)]
    span = (W - 60 * mm) / 4
    for i, (n, l, col) in enumerate(stats):
        cx = 30 * mm + span * (i + 0.5)
        c.setFont(SERIF, 21); c.setFillColor(col); c.drawCentredString(cx, y + 3 * mm, n)
        c.setFont(SANS, 7.5); c.setFillColor(CHAR); c.drawCentredString(cx, y - 2.5 * mm, l)
    c.setFont(SANS, 7.4); c.setFillColor(GREY)
    c.drawCentredString(W / 2, 24 * mm, 'smartioushomeschool.com   ·   hello@smartioushomeschool.com')
    c.drawCentredString(W / 2, 19.5 * mm, '+254 745 021 212   ·   Diamond Plaza I Parklands Annex  ·  Karen West  ·  Nairobi')
    c.restoreState()

def furniture(c, doc):
    W, H = A4
    c.saveState()
    c.setFillColor(CREAM); c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_logo(c, 20 * mm, H - 16 * mm, 20 * mm)
    c.setFont(SANS, 6.8); c.setFillColor(GREY); c.drawRightString(W - 20 * mm, H - 12.5 * mm, 'COMPANY PORTFOLIO  ·  2026 EDITION')
    c.setStrokeColor(LINE); c.setLineWidth(0.6); c.line(20 * mm, H - 19 * mm, W - 20 * mm, H - 19 * mm)
    c.line(20 * mm, 16 * mm, W - 20 * mm, 16 * mm)
    c.setFont(SANS, 7.4); c.drawString(20 * mm, 11 * mm, FOOTER)
    c.setFont(SANS_B, 6.8); c.setFillColor(CRIMSON); c.drawRightString(W - 20 * mm, 11 * mm, f'Page {doc.page}')
    c.restoreState()

class Doc(BaseDocTemplate):
    def __init__(self, path):
        super().__init__(path, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=26 * mm, bottomMargin=22 * mm,
                         title='Smartious Company Portfolio 2026', author='Smartious Homeschool and eSchool',
                         subject='Company portfolio: who we are, curricula, programmes, team, locations and contacts')
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='f',
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate('cover', [frame], onPage=cover, autoNextPageTemplate='p'),
                               PageTemplate('p', [frame], onPage=furniture)])

# ── Content ──────────────────────────────────────────────────
CONTENTS = [('founder', 'A Letter from the Founder'), ('about', 'Who We Are'), ('values', 'Vision, Mission and Values'),
            ('numbers', 'By the Numbers'), ('curricula', 'Our Curricula'), ('programmes', 'Our Programmes'),
            ('tech', 'Technology and Innovation'), ('team', 'Our Teaching Team'), ('locations', 'Locations and Reach'),
            ('life', 'School Life and Co Curricular'), ('partners', 'Partnerships and Affiliations'),
            ('why', 'Why Smartious'), ('stories', 'Family Stories'), ('partner', 'Partner With Us'), ('contact', 'Get In Touch')]

def story():
    s = [Spacer(1, 1), PageBreak()]

    # Page 2 — reason for being
    s += [Spacer(1, 6 * mm), P('OUR REASON FOR BEING', 'kicker'), Spacer(1, 8),
          P('We exist to give every child<br/>a chance', 'big'), Spacer(1, 8),
          P('to learn well, learn deeply,<br/>and learn anywhere.', 'bigi'), Spacer(1, 16), Rule(16 * mm, GOLD, 1), Spacer(1, 14),
          P('From a single tutor visiting families in Nairobi homes in 2018, Smartious has grown into a premium international '
            'homeschool and online school. More than 3,421 students educated. Over 650 learners active today. Families in more than '
            '40 countries. And through all of it, we have never lost sight of the one thing that matters most: the child in front of us.', 'lead')]

    # Page 3 — contents
    s += [Spacer(1, 16), P('CONTENTS', 'kicker'), Spacer(1, 2),
          P(f'What you’ll find <font name="{SERIF_I}" color="#8B1A2E">inside</font>', 'h1'), Spacer(1, 3), Rule(), Spacer(1, 12)]
    rows = [[P(f'{i:02d}', 'tocn'), P(t, 'toc'), P(f'{PAGES.get(k, 0):02d}', 'tocp')] for i, (k, t) in enumerate(CONTENTS, 1)]
    s.append(grid(rows, [16 * mm, W_FULL - 36 * mm, 20 * mm], pad=4))
    s.append(PageBreak())   # the founder's letter starts on its own page

    # 01 Founder
    s += section('01', 'THE FOUNDER', 'A letter from', 'Alfred Ouko', 'founder')
    for para in [
        'Dear reader,',
        'When I started Smartious in 2018, I was a young mathematics and physics teacher visiting Nairobi homes one at a time. '
        'The families I met all wanted the same thing: an excellent education for their child, delivered with care, on their own terms.',
        'What began as one tutor in Parklands has grown into a school of more than 78 qualified teachers, serving over 650 active learners, '
        'with families in more than 40 countries. We deliver five international curricula: Cambridge IGCSE, Pearson Edexcel, Cambridge A-Level, '
        'IB Diploma and the American curriculum, alongside our own Smartious Blended programme. We run two physical centres in Nairobi, at '
        'Diamond Plaza, Parklands and Karen West, and we teach families online from London, Dubai, Toronto, Riyadh and everywhere in between.',
        'But the heart of Smartious has never been the curricula or the technology, important as both are. The heart of Smartious is a simple '
        'promise: your child will be known. Known by name. Known for what excites them. Known for what they struggle with. Known well enough that '
        'we can meet them where they are and walk with them to where they want to go.',
        'This portfolio sets out who we are, what we offer, and what we believe in. If you are a parent considering Smartious for your child, an '
        'investor wanting to understand our business, or a partner exploring collaboration, I hope you find here a clear, honest picture of Smartious in 2026.',
        'Education is the most consequential thing one generation passes to the next. We take that responsibility seriously. Thank you for the '
        'time you will spend reading what follows.']:
        s.append(P(para, 'lead'))
    s += [Spacer(1, 10), P('Alfred Ouko', st('sig', fontName=SERIF_I, fontSize=20, leading=24, textColor=CRIMSON)),
          P('<b>Founder and Chief Executive</b><br/>Smartious Homeschool and eSchool', st('sigt', textColor=INK)), Spacer(1, 8),
          Rule(W_FULL, LINE, 0.6), Spacer(1, 6),
          P('BEd Mathematics and Physics, University of Nairobi, 2022. Founded Smartious in 2018 while still an undergraduate, having begun private '
            'tutoring earlier that year. Lives and works in Nairobi.', 'small')]

    # 02 About
    s += section('02', 'ABOUT US', 'Who', 'we are', 'about')
    s += [P('Smartious is a Kenyan founded, internationally positioned premium homeschool and online school. We were established in 2018 in '
            'Nairobi. Today we serve more than 650 active learners, with families in over 40 countries, through a model that combines the '
            'personalisation of homeschooling, the rigour of international curricula, and the flexibility of online learning.', 'lead')]
    s += label('Our story')
    story_rows = [
        ('2018', 'Smartious is founded by Alfred Ouko, then a Mathematics and Physics undergraduate at the University of Nairobi. The first students are 4 families in Parklands.'),
        ('2019', 'Expansion to 15 students across Nairobi. First Cambridge IGCSE student passes with distinction.'),
        ('2020', 'COVID-19 catalyses the shift online. Smartious launches its first virtual classroom programme and discovers that quality online education is its true calling.'),
        ('2021', 'First diaspora family signs on from Dubai. International expansion begins.'),
        ('2022', 'Diamond Plaza, Parklands becomes the first physical centre. Alfred completes his BEd at the University of Nairobi.'),
        ('2023', 'Karen West learning centre opens. Teaching team grows past 40 educators.'),
        ('2024', 'Launch of Mshauri AI, the first AI tutor purpose built for African and international curricula. Smartious LMS goes into beta.'),
        ('2025', 'Five curricula formally offered. Study Abroad consulting launches as a free service to enrolled families.'),
        ('2026', 'Over 3,421 students educated to date. 650+ active learners. Families in more than 40 countries. Smartious continues to grow, one family at a time.'),
    ]
    s.append(grid([[P(y, 'year'), P(t, 'cell')] for y, t in story_rows], [22 * mm, W_FULL - 22 * mm], pad=7))

    # 03 Values
    s += section('03', 'WHAT WE STAND FOR', 'Vision, mission', '&amp; values', 'values')
    s += label('Our vision')
    s += [P('A world where every learner, anywhere, can access an education that meets them as an individual.',
            st('vis', fontName=SERIF_I, fontSize=15, leading=20, textColor=INK, spaceAfter=6))]
    s += label('Our mission')
    s += [P('To deliver premium homeschooling, online schooling and tuition that combines academic rigour with deep personalisation, built on '
            'the foundation of qualified, caring teachers, robust technology, and lasting relationships with the families we serve.', 'lead')]
    s += label('Our values')
    s.append(numbered([
        ('Excellence', 'We do not believe in good enough. Every lesson, every report, every email is delivered to the highest standard we can manage.'),
        ('Personalisation', 'Every child is different. Our programmes, pace and pedagogy bend to fit the learner, never the other way around.'),
        ('Honesty', "We tell families the truth: about their child's progress, about our limits, about our fees. No hidden charges. No spin."),
        ('Care', 'We see each student as a whole person, not a customer. We are in this for the long arc of a young life.'),
        ('Innovation', 'We build the tools we need. From the Smartious LMS to Mshauri AI, we engineer better ways to teach and to learn.'),
        ('Accessibility', 'Through bursaries for families who demonstrate need, we work to keep excellence within reach.'),
    ]))

    # 04 Numbers
    s += section('04', 'SMARTIOUS TODAY', 'By the', 'numbers', 'numbers')
    hero_style = st('hn', fontName=SERIF, fontSize=30, leading=33, textColor=WHITE)
    hero = Table([[[P('3,421+', hero_style), P('Students educated since 2018', st('hl', fontName=SANS_B, fontSize=8, leading=11, textColor=WHITE)),
                    Spacer(1, 3), P('Every learner who has ever studied with Smartious, online, at our centres and in family homes.', st('hd', fontSize=7.4, leading=10, textColor=colors.HexColor('#F1D9DE')))],
                   [P('650+', hero_style), P('Active learners today', st('hl2', fontName=SANS_B, fontSize=8, leading=11, textColor=WHITE)),
                    Spacer(1, 3), P('Enrolled students currently learning with us across our programmes.', st('hd2', fontSize=7.4, leading=10, textColor=colors.HexColor('#F1D9DE')))]]],
                 colWidths=[W_FULL / 2] * 2)
    hero.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), DEEP), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                              ('LEFTPADDING', (0, 0), (-1, -1), 14), ('RIGHTPADDING', (0, 0), (-1, -1), 14),
                              ('TOPPADDING', (0, 0), (-1, -1), 12), ('BOTTOMPADDING', (0, 0), (-1, -1), 12), ('ROUNDEDCORNERS', [4, 4, 4, 4])]))
    s += [hero, Spacer(1, 8), stat_grid([
        ('40+', 'Countries with Smartious families', 'Including Kenya, the UAE, the UK, the USA, Canada, Saudi Arabia, Qatar, Oman, Nigeria, South Africa, Tanzania, Uganda, Rwanda and Ethiopia.'),
        ('78+', 'Qualified teachers', 'All hold at least a Bachelor’s degree. Most hold an additional teaching qualification.'),
        ('5', 'International curricula', 'CBC Kenya, Cambridge IGCSE and A-Level, Pearson Edexcel, IB Diploma, American Common Core.'),
        ('2', 'Physical centres in Nairobi', 'Diamond Plaza, Parklands, since 2022, and the Karen West Centre, since 2023.'),
        ('21', 'Nairobi areas served', 'In person tuition from Kileleshwa to Karen, Westlands to Runda, and everywhere between.'),
        ('27', 'UAE areas served', 'Online tuition across Dubai, Abu Dhabi, Sharjah, Ajman, Al Ain and beyond.'),
        ('10', 'Languages taught', 'French, Spanish, German, Italian, Portuguese, Mandarin, Japanese, Kiswahili, Arabic, Russian.'),
        ('8', 'Years of track record', 'Established 2018. Eight years of compounding excellence in individualised education.'),
    ])]

    # 05 Curricula
    s += section('05', 'CURRICULA', 'What we', 'teach', 'curricula')
    s += [P('Families choose Smartious for the breadth of internationally recognised curricula we deliver with depth. Each curriculum has its own '
            'pathways, certifications and university outcomes. Our teachers are subject specialists in the curriculum they teach.', 'lead'), Spacer(1, 4)]
    for c in [
        ('INTERNATIONAL', 'Cambridge IGCSE', 'Years 9 to 11. External examinations: Cambridge International Education.',
         "The world's most popular international qualification for students aged 14 to 16. Recognised by every major university globally. Smartious offers the full subject range including Sciences, Mathematics, English, Languages, Humanities and Creative subjects."),
        ('INTERNATIONAL', 'Pearson Edexcel International', 'Years 9 to 11. External examinations: Pearson Edexcel.',
         'The international version of the UK GCSE. A slightly more linear assessment model than Cambridge, well suited to students who perform better in end of course examinations than in coursework.'),
        ('INTERNATIONAL', 'Cambridge A-Level', 'Years 12 to 13. External examinations: Cambridge International Education.',
         'The gold standard pre university qualification. Three or four A-Levels in specialised subjects, recognised by UK, US, Canadian and Commonwealth universities. Modular AS plus A2 structure, or full linear.'),
        ('INTERNATIONAL', 'IB Diploma Programme', 'Years 12 to 13. External examinations: International Baccalaureate Organization.',
         'The most rigorous pre university qualification. Six subjects plus Theory of Knowledge, the Extended Essay, and Creativity, Activity, Service. Highly regarded by US Ivy League and Oxbridge admissions.'),
        ('INTERNATIONAL', 'American Common Core', 'K-12. External examinations: AP and SAT where applicable.',
         'For families on or transitioning to the American pathway. Includes Advanced Placement preparation in the final years and full SAT support. A strong fit for diaspora US families and students heading to US universities.'),
        ('LOCAL', 'Kenya CBC', 'Grades 1 to 12. External examinations: KNEC.',
         'The official Kenyan national curriculum, delivered to KNEC standards from Pre Primary through Senior School. Suitable for families remaining within the Kenyan system and intending KCSE.'),
        ('LOCAL', 'British National Curriculum', 'Reception to Year 13. External examinations: AQA, OCR, Cambridge.',
         'The full UK national curriculum from Reception through A-Level. Best for British diaspora families wanting continuity with UK schools, or families intending UK university entry.'),
        ('SMARTIOUS CUSTOM', 'Smartious Blended Programme', 'Years 1 to 13. Smartious issued progression reports plus external exam options.',
         'A bespoke programme combining the best of Cambridge, IB and competency based pedagogy. Designed for families who want a child to develop internationally credentialed exam outcomes together with broad creative, ethical and entrepreneurial capabilities.'),
    ]:
        s.append(curriculum(*c))

    # 06 Programmes
    s += section('06', 'PROGRAMMES', 'What we', 'offer', 'programmes')
    s += [P('Six core programmes designed to meet families where they are. From full time homeschooling to a single language lesson per week, '
            'we have a delivery model to fit your family.', 'lead'), Spacer(1, 4)]
    progs = [
        ('Homeschool, In Person', 'A tutor visits your home in Nairobi',
         'Full curriculum delivery in your home. Our tutor comes to you, 4 to 5 days per week, for the full academic year. Best for families seeking maximum personalisation and the comfort of learning at home.',
         [PRIMARY_FEE, OTHER_FEES]),
        ('Online Virtual School', 'Fully online, live and recorded',
         'Full live online classes delivered globally. Best for diaspora families, families seeking flexibility, or students who thrive with virtual learning.',
         [PRIMARY_FEE, OTHER_FEES]),
        ('Private Tuition', 'One to one supplementary tutoring',
         'Hourly tutoring across all subjects and levels, delivered in person in Nairobi or online worldwide. For students attending other schools who need targeted support.',
         [TUITION]),
        ('Language Programme', '10 world languages',
         'French, Spanish, German, Italian, Portuguese, Mandarin, Japanese, Kiswahili, Arabic and Russian. Delivered one to one or in small groups. Includes preparation for DELF, DELE, Goethe, HSK and JLPT.',
         [TUITION]),
        ('Test Preparation', 'IELTS, TOEFL, SAT, GRE, GMAT',
         'Intensive preparation for English language tests, including IELTS, TOEFL and PTE, and standardised university admissions tests, including SAT, GRE and GMAT. Bundled programmes of 20 to 40 sessions.',
         [TUITION]),
        ('Study Abroad Consulting', 'Free to Smartious families',
         'University application support to 10 international destinations: the UK, USA, Canada, Australia, Germany, the Netherlands, Ireland, China, Malaysia and Mauritius. Free for all enrolled Smartious students.',
         ['FREE for enrolled families']),
    ]
    for i, p in enumerate(progs, 1):
        s.append(programme(i, *p))
    s.append(P('School fees vary by curriculum and level and are confirmed in writing after the placement assessment. External examination fees are separate.', 'small'))

    # 07 Technology
    s += section('07', 'TECHNOLOGY', 'Built for', 'modern learning', 'tech')
    s += label('Smartious LMS')
    s += [P('Our Learning Management System', 'h3'), Spacer(1, 4),
          P('The Smartious LMS is the digital backbone of our school. Custom built by our in house engineering team, it connects students, parents, '
            'teachers and administrators in one secure, branded platform, accessible from any device, anywhere.', 'body')]
    portals = [('STUDENT PORTAL', 'Live class joining, assignment submission, gradebook, AI tutor access, digital library, course materials, calendar.'),
               ('TEACHER PORTAL', 'Lesson planning, attendance, gradebook, assignment creation, student progress tracking, live class delivery, parent communication.'),
               ('PARENT PORTAL', 'Live progress monitoring, attendance reports, fee statements, teacher communication, school calendar, document downloads.'),
               ('ADMIN PORTAL', 'Full school operations: enrolment, allocations, fees, payroll, timetabling, examinations, reports, financial dashboards.')]
    cells = [[P(t, 'sub'), Spacer(1, 2), P(d, 'cell')] for t, d in portals]
    s += [grid([cells[0:2], cells[2:4]], [W_FULL / 2] * 2, pad=8), Spacer(1, 8)]
    s += label('Mshauri AI')
    s += [P('The first AI tutor for African and international curricula', 'h3'), Spacer(1, 4),
          P('Mshauri is Kiswahili for advisor. Mshauri AI is the first AI homework helper purpose trained on Cambridge, Edexcel, IB, American and '
            'Kenyan CBC curricula, available to every Smartious student.', 'body')]
    s += bullets(['Trained on more than 50,000 past examination questions across all five curricula we deliver.',
                  'Available around the clock on web and mobile. Supports text, voice and image questions: photograph a worksheet and get instant guidance.',
                  'Pedagogically trained to guide rather than give answers, protecting authentic student learning.',
                  'Multilingual: communicates in English, Kiswahili, French, Spanish, Arabic and three other languages.',
                  'Available to enrolled Smartious students.'])

    # 08 Team
    s += section('08', 'OUR TEAM', 'Our teaching', 'team', 'team')
    s += [P('Smartious is its teachers. We invest in recruitment with the seriousness of a top university admissions office, and the proof is in '
            'how few applicants make the cut.', 'lead'), Spacer(1, 4),
          stat_grid([('78+', 'Active teaching staff worldwide'), ('100%', 'Hold at least a Bachelor’s degree'),
                     ('65%', 'Hold a postgraduate qualification'), ('48%', 'Hold a teaching qualification such as PGCE, BEd or TSC'),
                     ('8 yrs', 'Average teaching experience'), ('&lt; 5%', 'Acceptance rate of teacher applicants')]),
          Spacer(1, 12),
          card([P('<b><font color="#1E1E24">Hiring philosophy.</font></b> Every Smartious teacher passes through a four stage interview: application '
                  'screening, a subject knowledge written examination, a demonstration lesson before an internal panel, and a final interview with '
                  'the founder. We hire for substance, warmth, and the ability to make a child feel seen.', 'cell')])]

    # 09 Locations
    s += section('09', 'WHERE WE ARE', 'Locations', '&amp; reach', 'locations')
    s += [P('Two physical centres in Nairobi. In home delivery across 21 Nairobi neighbourhoods and 6 Kenyan cities. Online delivery worldwide, '
            'with families in more than 40 countries and concentrated reach across the UAE, the United Kingdom and the diaspora communities of North America.', 'lead')]
    s += label('Physical centres')
    s += [grid([
        [[P('Diamond Plaza, Parklands', 'h3'), P(ADDRESS + '. Our flagship learning centre: 6 tutoring pods, parent lounge, resource library, '
                                              'admin office. Open Monday to Saturday, 8am to 7pm.', 'cell')], P('EST. 2022', 'label')],
        [[P('Karen West Centre', 'h3'), P('Karen West, Mokoyeti Road, past Galleria Mall, Nairobi, Kenya. Our second centre, purpose built for IGCSE and A-Level intensive tuition. '
                                           'Bookable session based access.', 'cell')], P('EST. 2023', 'label')],
    ], [W_FULL - 24 * mm, 24 * mm], pad=7)]
    s += label('Nairobi areas served · 21 neighbourhoods')
    s += [P('Westlands · Parklands · Kileleshwa · Lavington · Kilimani · Karen · Runda · Muthaiga · Spring Valley · Riverside · Hurlingham · '
            'Upper Hill · Gigiri · Loresho · Brookside · Garden Estate · Mountain View · Lower Kabete · Ridgeways · Nyari Estate · Adams Arcade', 'cell')]
    s += label('Kenyan cities beyond Nairobi · 6 cities')
    s += [P('Mombasa · Kisumu · Nakuru · Eldoret · Nyeri · Naivasha', 'cell')]
    s += label('International reach · more than 40 countries')
    s += [grid([[P('<b>AFRICA</b>', 'sub'), P('Kenya · Tanzania · Uganda · Rwanda · Ethiopia · Nigeria · South Africa', 'cell')],
                [P('<b>MIDDLE EAST</b>', 'sub'), P('UAE, 27 areas · Saudi Arabia · Qatar · Oman', 'cell')],
                [P('<b>DIASPORA</b>', 'sub'), P('United Kingdom · United States · Canada', 'cell')],
                [P('<b>AND BEYOND</b>', 'sub'), P('Families in more than 40 countries worldwide connect to Smartious online.', 'cell')]],
               [30 * mm, W_FULL - 30 * mm], pad=5)]

    # 10 School life
    s += section('10', 'BEYOND ACADEMICS', 'School life', '&amp; co curricular', 'life')
    s += [P('A child is not a test score. Smartious students grow as whole human beings: through sports, arts, leadership, debate and service.', 'lead'), Spacer(1, 2)]
    s.append(numbered([
        ('Sports', 'Football, basketball, athletics, swimming at partner facilities, tennis. Inter school competitions and friendlies with other Nairobi schools.'),
        ('Arts', 'Music with piano, guitar and voice, drama club, art society, creative writing workshops, photography club.'),
        ('STEM Clubs', 'Robotics with FIRST LEGO League and FIRST Tech Challenge, coding club, mathematics olympiad team, science fair preparation.'),
        ('Debate and Public Speaking', 'Inter school debate teams including KISMUN and MUN Kenya, public speaking club, mock parliament, oratory competitions.'),
        ('Service', 'Community service hours, required for IB CAS, partnership with local NGOs, blood drive coordination, tree planting initiatives.'),
        ('Leadership', 'Student council, peer mentoring, prefect system, leadership retreats.'),
        ('Excursions', 'Termly educational outings: museums, national parks, university visits, science centres, factories, cultural events.'),
    ]))

    # 11 Partnerships (wording copied exactly from the 2026 portfolio)
    s += section('11', 'PARTNERSHIPS', 'Partnerships', '&amp; affiliations', 'partners')
    s += [P('We work with the institutions and platforms that set the standard for international education.', 'lead')]
    s += label('Examination boards')
    for t, b in [('Cambridge International Education', 'Registered Cambridge centre via partner school. We prepare students for IGCSE, AS Level and A-Level.'),
                 ('Pearson Edexcel', 'Pearson recognised teaching centre. Full Edexcel IGCSE and International A-Level preparation.'),
                 ('International Baccalaureate Organization', 'Partnership with IB World Schools for student examination registration.'),
                 ('College Board, USA', 'SAT and AP preparation. Registered AP Course Audit pathway.'),
                 ('KNEC, Kenya', 'Registered KNEC examination preparation centre for KCSE candidates.'),
                 ('British Council Kenya', 'IELTS examination preparation and registration.')]:
        s.append(entry(t, b))
    s += label('Technology partners')
    for t, b in [('Paystack', 'Payment infrastructure across all African markets we serve.'),
                 ('Khan Academy', 'Integrated supplementary content across all curricula.'),
                 ('Labster Virtual Labs', 'Virtual laboratory experiences for online students taking sciences.'),
                 ('PhET Interactive Simulations', 'University of Colorado Boulder simulations integrated into our STEM curriculum.'),
                 ('Cloudinary', 'Educational content delivery across our digital library.')]:
        s.append(entry(t, b))
    s += label('University pathways')
    for t, b in [('UCAS, UK', 'Direct UCAS support and reference letter coordination.'),
                 ('Common Application, USA', 'Common App and Coalition App support.'),
                 ('OUAC, Canada', 'Ontario university application support.'),
                 ('UAC, Australia', 'Australian university application support.')]:
        s.append(entry(t, b))

    # 12 Why
    s += section('12', 'DIFFERENTIATORS', 'Why', 'Smartious', 'why')
    s.append(numbered([
        ('Genuine personalisation', 'Every student has a learning plan tailored to their pace, gaps and goals. Not slogans. Actual differentiated teaching.'),
        ('Teachers, not bots', 'Our AI tutor guides; our teachers teach. Real human relationships remain the heart of every Smartious experience.'),
        ('Transparent pricing', 'Every fee is published. No hidden costs. External exam fees pass through at the published board rate.'),
        ('Five curricula, one school', 'Most international schools offer one curriculum, maybe two. We deliver five, properly, through curriculum specialists.'),
        ('Free Study Abroad consulting', 'Every Smartious family gets full university application support included. No extra invoice. No hidden referral commission.'),
        ('Built in technology', 'Our LMS, AI tutor and digital library are part of the offering. Not bolted on. Not extra. Always included.'),
        ('Bursaries for families in need', 'Bursaries for families who demonstrate financial need. Excellence should not be only for the wealthy.'),
        ('8 years of consistent delivery', 'Founded 2018. Same founder. Same values. Same care. The institution today reflects the choices made every day for eight years.'),
    ], title_style=st('wt', fontName=SERIF, fontSize=13, leading=16, textColor=INK)))

    # 13 Stories
    s += section('13', 'FAMILY VOICES', 'Family', 'stories', 'stories')
    s += [P('The proof of a school is in the families it serves. Permission secured stories from our community appear in our public testimonials '
            'and on our website. The voices below are representative of what we hear.', 'body'), Spacer(1, 6)]
    for q, who in [
        ('My daughter went from struggling with Cambridge IGCSE to taking three A grades. The Smartious teachers found her, not the syllabus, her, and met her there.', 'Parent · Year 11 student · Westlands'),
        ("As a diaspora family in Dubai, we needed continuity with the Kenyan system without compromising on quality. Smartious delivered both. Our son's CBC reports actually mean something now.", 'Parent · Year 7 student · Dubai'),
        ('The free university application support saved us close to $4,000 we would have spent on a consultant, and our son got into his first choice UK university.', 'Parent · A-Level graduate · Karen'),
        ('What I appreciate most is the honesty. When my child was not ready for IGCSE Mathematics, they told me. When she was, they told me too. No upselling. Just truth.', 'Parent · Year 9 student · Lavington'),
    ]:
        s.append(card([P(f'“{q}”', 'quote'), Spacer(1, 5), P(f'—  {who}', 'sub')], pad=12, space=9))

    # 14 Partner
    s += section('14', 'PARTNERSHIP', 'Partner', 'with us', 'partner')
    s += [P('Smartious works with a select group of corporate, governmental and institutional partners. If your organisation values the education '
            'of the children of your employees, citizens or community, we should talk.', 'lead'), Spacer(1, 4)]
    for t, b in [
        ('CORPORATE EDUCATION BENEFITS', 'Customised employee family education packages. We work with multinationals and Kenyan corporates to provide tuition, school placement and educational consulting as a staff benefit. Packages are tailored to each organisation.'),
        ('EMBASSIES AND CONSULATES', 'Educational support for diplomatic families on rotation. We have served the children of multiple foreign missions in Nairobi and across the UAE.'),
        ('NGOS AND FOUNDATIONS', 'Scholarship delivery, refugee education programmes, and pilot education initiatives. We have capacity to absorb sponsored students at any year level.'),
        ('PROPERTY DEVELOPERS', 'Branded education partnerships for serviced residential developments. We provide on site tuition centres for new urban developments seeking premium amenities.'),
        ('EXPATRIATE COMMUNITIES', 'Customised group packages for expatriate communities on medical, mining and engineering postings. Group enrolments with a single point of contact.'),
        ('EDUCATION INVESTORS', 'Smartious is open to strategic investment partnerships. Series A discussions are ongoing. Please contact the founder directly for the investor pack.'),
    ]:
        s.append(card([P(t, 'sub'), Spacer(1, 3), P(b, 'cell')], pad=9, space=7))

    # 15 Contact
    s += section('15', 'CONTACT', 'Get in', 'touch', 'contact')
    rows = [('HEADQUARTERS', ADDRESS), ('SECOND CENTRE', 'Karen West, Mokoyeti Road, past Galleria Mall, Nairobi, Kenya'),
            ('PHONE', '+254 745 021 212 (admissions)'), ('ACADEMIC', '+254 182 071 920'), ('WHATSAPP', '+254 745 021 212'),
            ('EMAIL', 'hello@smartioushomeschool.com'), ('WEBSITE', 'smartioushomeschool.com'),
            ('FOUNDER', 'Alfred Ouko · alfred@smartioushomeschool.com'),
            ('HOURS', 'Monday to Friday 8am to 7pm · Saturday 9am to 4pm · Sunday by appointment')]
    s += [grid([[P(k, 'label'), P(v, st('cv', fontSize=9.4, leading=13, textColor=INK))] for k, v in rows],
               [34 * mm, W_FULL - 34 * mm], pad=6), Spacer(1, 16),
          P('Education is the most consequential thing one generation passes to the next.',
            st('closing', fontName=SERIF_I, fontSize=16, leading=21, textColor=CRIMSON, spaceAfter=8)),
          P('Thank you for taking the time to read about Smartious. If you would like to explore how we could serve your family, organisation or '
            'community, we would be honoured to begin a conversation. Reach out by any of the channels above. We respond within one working day.', 'lead'),
          Spacer(1, 14), Rule(W_FULL, LINE, 0.6), Spacer(1, 6),
          P('Smartious Homeschool and eSchool · A Smartious Edtech company · Established 2018 · Nairobi, Kenya · All content in this portfolio is '
            'correct as of October 2026 and subject to update.', 'small')]
    return s

# Two passes: the first records where each section lands, the second prints the contents page with those numbers.
Doc(io.BytesIO()).build(story())
Doc(OUT).build(story())
print('wrote', OUT, PAGES)
