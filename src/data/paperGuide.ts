// Long-form copy for /paper-guide. Both locales are written independently;
// UI labels live in lib/translations.ts with the rest of the site copy.
import type { Locale } from '@/lib/translations';

export type MediumKey = 'pencil' | 'ink' | 'watercolour';

export interface MediumSection {
  key: MediumKey;
  /** gsm band used to pick the matching sketchbooks from the live catalog */
  min: number;
  max: number;
  texture: string;
  weight: string;
  title: string;
  lede: string;
  paras: string[];
  tips: string[];
}

export interface PaperGuideCopy {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string[];
  gsmHeading: string;
  gsmIntro: string;
  gsmTable: { gsm: string; feel: string; bestFor: string }[];
  gsmCols: { gsm: string; feel: string; bestFor: string };
  sections: MediumSection[];
  matchingLabel: string;
  tipsLabel: string;
  kraftHeading: string;
  kraftParas: string[];
  sizesHeading: string;
  sizes: { name: string; text: string }[];
  quickHeading: string;
  quick: { q: string; a: string }[];
  outroHeading: string;
  outro: string;
}

const en: PaperGuideCopy = {
  title: 'Sketchbook Paper Guide: Which GSM Do You Need? · Waraqa (ورقة)',
  description:
    'A plain-language guide to sketchbook paper in Egypt: what 150, 180, 200, 250 and 320gsm mean, and which weight suits pencil, markers or watercolour.',
  eyebrow: 'Paper guide',
  h1: 'Which sketchbook paper do you need?',
  intro: [
    'The number on a sketchbook cover — 150gsm, 250gsm, 320gsm — is the single best clue to what the paper can take. GSM means grams per square metre: the heavier the sheet, the thicker it is, and the more water, pressure and erasing it survives.',
    'There is no “best” weight. There is the weight that suits what you draw with. Below is the short version, then each medium in detail, with the Waraqa sketchbooks that fit it.',
  ],
  gsmHeading: 'Paper weight at a glance',
  gsmIntro: 'Every Waraqa sketchbook is acid-free, so your pages won’t yellow with time. What changes between them is weight and surface.',
  gsmCols: { gsm: 'Weight', feel: 'How it feels', bestFor: 'Best for' },
  gsmTable: [
    { gsm: '150gsm', feel: 'Like a good drawing pad; smooth with light tooth', bestFor: 'Pencil, graphite, charcoal, everyday sketching' },
    { gsm: '180gsm (kraft)', feel: 'Warm brown, slightly toothy', bestFor: 'White charcoal, gel pens, pastels on toned paper' },
    { gsm: '200gsm', feel: 'Noticeably sturdier, still flexible', bestFor: 'Mixed sketching on the go: pen, pencil, markers' },
    { gsm: '250gsm', feel: 'Card-like, pages lie flat', bestFor: 'Fineliners, alcohol markers, light washes' },
    { gsm: '320gsm', feel: 'Heavy and stiff', bestFor: 'Watercolour, gouache, acrylic, collage' },
  ],
  sections: [
    {
      key: 'pencil',
      min: 0,
      max: 180,
      texture: '/guide/pencil.jpg',
      weight: '150–180gsm',
      title: 'Pencil, charcoal and pastel',
      lede: 'Dry media need tooth more than thickness.',
      paras: [
        'Graphite and charcoal work by catching on the paper’s surface. A 150gsm drawing paper has enough tooth to build layers of shading, yet is smooth enough for fine lines and portraits. You don’t pay for weight you won’t use, which is why this is the sketchbook to fill fast and freely.',
        'Kraft pages (180gsm) change the game: drawing on a mid-tone means you add the shadows in graphite and the highlights in white charcoal or gel pen. Portraits and still lifes gain depth in half the time.',
      ],
      tips: [
        'Use a light hand first; 150gsm forgives erasing better than you expect, but not endless scrubbing.',
        'Spray or place a loose sheet over finished charcoal pages so they don’t smudge the facing page.',
        'On kraft, keep pure white for the brightest spot only. It reads brighter when used sparingly.',
      ],
    },
    {
      key: 'ink',
      min: 181,
      max: 299,
      texture: '/guide/ink.jpg',
      weight: '200–250gsm',
      title: 'Pens, markers and light washes',
      lede: 'Ink needs a sheet that stops it reaching the next page.',
      paras: [
        'Fineliners are gentle on paper, but alcohol markers soak straight through anything thin. At 200–250gsm the sheet is dense enough that marker colour stays on the page you’re working on, and the back of each page stays usable.',
        'This weight also takes a quick wash of watercolour or ink without curling much, which makes it the most versatile choice if you mix tools in one sketchbook: line drawing, marker colour, a light wash on top.',
      ],
      tips: [
        'Test your darkest marker on the last page first; every brand bleeds differently.',
        'For heavy marker blending, work on one side of each sheet and keep the back for pen.',
        'The Mini (200gsm) fits a pocket, so it is the one to carry for urban sketching.',
      ],
    },
    {
      key: 'watercolour',
      min: 300,
      max: 9999,
      texture: '/guide/wash.jpg',
      weight: '320gsm',
      title: 'Watercolour, gouache and acrylic',
      lede: 'Water is the real test of paper.',
      paras: [
        'Wet media make paper fibres swell, which is what causes buckling and pilling. A 320gsm mixed-media sheet is thick enough to take layered washes, wet-in-wet blooms and gouache without turning into waves, and it still flattens once dry.',
        'Because the sheet is heavy, a 320gsm sketchbook has fewer pages for its thickness. Treat each page as a finished piece rather than a quick note.',
      ],
      tips: [
        'Let each layer dry before the next; heavy paper is forgiving, not waterproof.',
        'Put a scrap sheet behind the page you’re painting so the spiral side stays dry.',
        'Gouache and acrylic sit beautifully on this surface; use less water than with watercolour.',
      ],
    },
  ],
  matchingLabel: 'Waraqa sketchbooks for this',
  tipsLabel: 'Tips',
  kraftHeading: 'Kraft or white paper?',
  kraftParas: [
    'White paper is neutral: colour looks true, and it suits anyone who scans or photographs their work. Kraft paper is warm and toned: it hides the blank-page fear, flatters pencil and makes white media glow.',
    'Many artists keep one of each: a white sketchbook for colour and studies, and a kraft one for portraits, quick figure drawing and anything with highlights.',
  ],
  sizesHeading: 'Which size?',
  sizes: [
    { name: 'Mini (10.5×15 cm)', text: 'Fits a pocket or small bag. For daily sketching outside, cafés and commutes.' },
    { name: 'A5 (14.8×21 cm)', text: 'The everyday size. Big enough for studies, small enough to carry. Most of our range is A5.' },
    { name: 'A4 (21×29.7 cm)', text: 'Room for finished pieces, assessments and art-school projects.' },
    { name: '25×35 cm', text: 'Studio format for large drawings, full-page washes and portfolio work.' },
  ],
  quickHeading: 'Quick answers',
  quick: [
    { q: 'Can I use watercolour on 150gsm paper?', a: 'A light wash, yes; real watercolour, no. It will buckle. For washes choose 250gsm, and 320gsm for proper watercolour.' },
    { q: 'Do alcohol markers bleed through 250gsm?', a: 'They don’t reach the next page, though heavy layering can show slightly on the back of the sheet itself.' },
    { q: 'What is the best sketchbook for a beginner?', a: 'An A5 at 150gsm. Plenty of pages, a forgiving surface and a price that makes it easy to fill without worrying about “wasting” paper.' },
    { q: 'What does acid-free mean?', a: 'The paper is pH-neutral, so it won’t yellow or turn brittle over the years. All Waraqa sketchbooks are acid-free.' },
  ],
  outroHeading: 'Still not sure?',
  outro: 'Send us a message on WhatsApp or Instagram with what you draw with, and we’ll point you to the right sketchbook.',
};

const ar: PaperGuideCopy = {
  title: 'دليل ورق السكتش بوك: أنهي جرام يناسبك؟ · ورقة',
  description:
    'دليل بسيط لورق السكتش بوك في مصر: يعني إيه ١٥٠ و١٨٠ و٢٠٠ و٢٥٠ و٣٢٠ جرام، وأنهي ورق يناسب الرصاص أو الماركرز أو الألوان المائية.',
  eyebrow: 'دليل الورق',
  h1: 'أنهي ورق سكتش بوك يناسبك؟',
  intro: [
    'الرقم اللي مكتوب على غلاف السكتش بوك — ١٥٠ جرام، ٢٥٠، ٣٢٠ — هو أهم حاجة تعرف منها الورق هيستحمل إيه. الجرام هنا معناه وزن المتر المربع من الورق: كل ما الرقم يعلى، الورقة تبقى أتقل وتستحمل مية وضغط ومساحة أكتر.',
    'مفيش ورق «أحسن» وخلاص. فيه ورق يناسب الأدوات اللي بترسم بيها. تحت هتلاقي الملخص، وبعدين كل خامة بالتفصيل، ومعاها سكتشات ورقة اللي تنفع لها.',
  ],
  gsmHeading: 'الجرام في لمحة',
  gsmIntro: 'كل سكتشات ورقة خالية من الأحماض، يعني صفحاتك مش هتصفّر مع الوقت. اللي بيختلف بينهم هو الوزن وملمس السطح.',
  gsmCols: { gsm: 'الجرام', feel: 'ملمسه', bestFor: 'أحسن لـ' },
  gsmTable: [
    { gsm: '١٥٠ جرام', feel: 'زي بلوك رسم كويس؛ ناعم وفيه خشونة خفيفة', bestFor: 'رصاص، جرافيت، فحم، اسكتشات يومية' },
    { gsm: '١٨٠ جرام (كرافت)', feel: 'بني دافي وخشن شوية', bestFor: 'فحم أبيض، جل بن، باستيل على ورق ملوّن' },
    { gsm: '٢٠٠ جرام', feel: 'أتقل بشكل واضح ولسه مرن', bestFor: 'رسم متنوع وإنت برا: قلم، رصاص، ماركر' },
    { gsm: '٢٥٠ جرام', feel: 'قريب من الكرتون، والصفحة بتفرد', bestFor: 'فاينلاينر، ماركرز كحول، ألوان خفيفة' },
    { gsm: '٣٢٠ جرام', feel: 'تقيل وناشف', bestFor: 'ألوان مائية، جواش، أكريليك، كولاج' },
  ],
  sections: [
    {
      key: 'pencil',
      min: 0,
      max: 180,
      texture: '/guide/pencil.jpg',
      weight: '١٥٠–١٨٠ جرام',
      title: 'رصاص وفحم وباستيل',
      lede: 'الخامات الناشفة محتاجة خشونة أكتر من التُقل.',
      paras: [
        'الجرافيت والفحم بيمسكوا في سطح الورقة. ورق رسم ١٥٠ جرام فيه خشونة كفاية تبني بيها طبقات تظليل، وفي نفس الوقت ناعم كفاية للخطوط الدقيقة والبورتريه. ومش هتدفع في تُقل مش محتاجه، عشان كده ده السكتش اللي تملاه بسرعة ومن غير ما تحسب.',
        'صفحات الكرافت (١٨٠ جرام) بتغيّر اللعبة: لما ترسم على ورق ملوّن، بتحط الضل بالرصاص والنور بالفحم الأبيض أو الجل بن. البورتريه والطبيعة الصامتة بياخدوا عمق في نص الوقت.',
      ],
      tips: [
        'ابدأ بإيد خفيفة؛ ورق ١٥٠ بيستحمل الأستيكة أكتر ما تتوقع، بس مش الدعك الكتير.',
        'حط ورقة سايبة فوق صفحات الفحم بعد ما تخلص عشان ماتطبعش على الصفحة اللي قصادها.',
        'على الكرافت، خلّي الأبيض الصافي لأنور حتة بس. كل ما تقلل منه يبان أقوى.',
      ],
    },
    {
      key: 'ink',
      min: 181,
      max: 299,
      texture: '/guide/ink.jpg',
      weight: '٢٠٠–٢٥٠ جرام',
      title: 'أقلام وماركرز وألوان خفيفة',
      lede: 'الحبر محتاج ورقة تمنعه يوصل للصفحة اللي بعدها.',
      paras: [
        'الفاينلاينر خفيف على الورق، لكن ماركرز الكحول بتعدّي من أي ورق رفيع. في ٢٠٠–٢٥٠ جرام الورقة كثيفة كفاية إن لون الماركر يفضل في الصفحة اللي بتشتغل عليها، وضهر كل صفحة يفضل ينفع ترسم عليه.',
        'الوزن ده كمان بيستحمل طبقة ألوان مائية أو حبر خفيفة من غير ما يتلوي كتير، وده بيخليه أكتر اختيار مرن لو بتخلط أدوات في سكتش واحد: خط، لون ماركر، وطبقة خفيفة فوقهم.',
      ],
      tips: [
        'جرّب أغمق ماركر عندك في آخر صفحة الأول؛ كل ماركة بتشف بشكل مختلف.',
        'لو بتدمج ماركرز كتير، اشتغل على وش واحد من الورقة وسيب الضهر للقلم.',
        'الميني (٢٠٠ جرام) بيدخل في الجيب، فهو اللي تاخده معاك وإنت بترسم في الشارع.',
      ],
    },
    {
      key: 'watercolour',
      min: 300,
      max: 9999,
      texture: '/guide/wash.jpg',
      weight: '٣٢٠ جرام',
      title: 'ألوان مائية وجواش وأكريليك',
      lede: 'المية هي الاختبار الحقيقي للورق.',
      paras: [
        'الخامات المبلولة بتخلي ألياف الورق تنفخ، وده اللي بيعمل التموّج والتنسير. ورق ميكسد ميديا ٣٢٠ جرام تقيل كفاية ياخد طبقات ألوان مائية وتداخل مبلول وجواش من غير ما يتحول لموج، وبيرجع يفرد لما ينشف.',
        'وعشان الورقة تقيلة، سكتش الـ٣٢٠ جرام عدد صفحاته أقل بالنسبة لتخنه. اتعامل مع كل صفحة كأنها لوحة خلصانة مش ملاحظة سريعة.',
      ],
      tips: [
        'سيب كل طبقة تنشف قبل اللي بعدها؛ الورق التقيل بيسامح، بس مش ضد المية.',
        'حط ورقة سايبة ورا الصفحة اللي بتلوّنها عشان ناحية السلك تفضل ناشفة.',
        'الجواش والأكريليك شكلهم حلو جداً على السطح ده؛ استخدم مية أقل من الألوان المائية.',
      ],
    },
  ],
  matchingLabel: 'سكتشات ورقة اللي تنفع لده',
  tipsLabel: 'نصايح',
  kraftHeading: 'كرافت ولا ورق أبيض؟',
  kraftParas: [
    'الورق الأبيض محايد: الألوان بتطلع زي ما هي، ومناسب لو بتصوّر أو بتعمل سكان لشغلك. ورق الكرافت دافي وملوّن: بيكسر رهبة الصفحة الفاضية، وبيحلّي الرصاص، وبيخلي الألوان البيضا تنوّر.',
    'فنانين كتير بيشيلوا الاتنين: سكتش أبيض للألوان والدراسات، وسكتش كرافت للبورتريه والرسم السريع وأي حاجة فيها نور.',
  ],
  sizesHeading: 'أنهي مقاس؟',
  sizes: [
    { name: 'ميني (١٠.٥×١٥ سم)', text: 'بيدخل في الجيب أو الشنطة الصغيرة. للرسم اليومي برا، في الكافيه والمواصلات.' },
    { name: 'A5 (١٤.٨×٢١ سم)', text: 'المقاس اليومي. كبير كفاية للدراسات وصغير كفاية تشيله. أغلب تشكيلتنا A5.' },
    { name: 'A4 (٢١×٢٩.٧ سم)', text: 'مساحة للوحات الخلصانة والتقييمات ومشاريع كلية الفنون.' },
    { name: '٢٥×٣٥ سم', text: 'مقاس الاستوديو للرسومات الكبيرة والألوان على الصفحة كلها والبورتفوليو.' },
  ],
  quickHeading: 'إجابات سريعة',
  quick: [
    { q: 'ينفع ألوان مائية على ورق ١٥٠ جرام؟', a: 'طبقة خفيفة آه، ألوان مائية بجد لأ. هيتموّج. للطبقات الخفيفة اختار ٢٥٠ جرام، وللألوان المائية الحقيقية ٣٢٠ جرام.' },
    { q: 'ماركرز الكحول بتشف من ٢٥٠ جرام؟', a: 'مش بتوصل للصفحة اللي بعدها، بس لو بتعمل طبقات كتير ممكن تبان شوية في ضهر نفس الورقة.' },
    { q: 'أحسن سكتش بوك لواحد لسه بيبدأ؟', a: 'A5 ورق ١٥٠ جرام. صفحات كتير، وسطح بيسامح، وسعر يخليك تملاه من غير ما تخاف «تبوّظ» الورق.' },
    { q: 'يعني إيه خالي من الأحماض؟', a: 'الورق متعادل، فمش هيصفّر ولا هيبقى هش مع السنين. كل سكتشات ورقة خالية من الأحماض.' },
  ],
  outroHeading: 'لسه محتار؟',
  outro: 'ابعتلنا على واتساب أو إنستجرام وقولنا بترسم بإيه، وإحنا نقولك أنهي سكتش يناسبك.',
};

export const PAPER_GUIDE: Record<Locale, PaperGuideCopy> = { en, ar };
