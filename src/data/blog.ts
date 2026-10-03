// Blog posts. Each post is written separately in English and Egyptian Arabic;
// the slug is shared so hreflang pairs /en/blog/x with /ar/blog/x.
import type { Locale } from '@/lib/translations';

export type Block =
  | { h2: string }
  | { p: string }
  | { list: string[] }
  | { tip: string };

export interface PostCopy {
  title: string;
  description: string;
  excerpt: string;
  body: Block[];
}

export interface Post {
  slug: string;
  date: string; // ISO, first published
  updated?: string;
  image: string;
  /** product slugs to suggest at the end of the post */
  products: string[];
  minutes: number;
  en: PostCopy;
  ar: PostCopy;
}

export const POSTS: Post[] = [
  {
    slug: 'how-to-choose-a-sketchbook',
    date: '2026-10-04',
    image: '/lifestyle/hero-brand.jpg',
    products: ['a5-drawing-sketchbook-150gsm', 'a5-sketchbook-250gsm', 'mini-sketchbook-200gsm'],
    minutes: 5,
    en: {
      title: 'How to choose your first sketchbook (without overthinking it)',
      description:
        'Size, paper weight, binding and page count: a practical guide to picking a sketchbook in Egypt that you will actually fill.',
      excerpt: 'Four questions decide it: what you draw with, where you draw, how much you draw, and how flat the pages need to lie.',
      body: [
        { p: 'The best sketchbook is the one you open every day. Most people pick a beautiful, expensive one, then never draw in it because every page feels too precious. So the first rule is simple: choose a sketchbook you are not afraid to ruin.' },
        { p: 'After that, four questions decide almost everything.' },
        { h2: '1. What do you draw with?' },
        { p: 'This sets the paper weight (gsm). Pencil and charcoal are happy on 150–180gsm. Fineliners and alcohol markers need 200–250gsm so they don’t bleed through. Watercolour and gouache need around 320gsm, or the page will buckle.' },
        { p: 'If you use a bit of everything, 250gsm is the safest middle ground: it takes markers and light washes and still feels good under a pencil.' },
        { h2: '2. Where do you draw?' },
        { p: 'If you sketch at home or in class, A5 or A4 gives you room to work. If you draw in cafés, on the metro or while waiting, carry something small enough to live in your bag: a pocket-size mini gets used far more than a big book that stays on the desk.' },
        { h2: '3. How much do you draw?' },
        { p: 'Count sheets, not just thickness. A 50-sheet drawing sketchbook is built for volume: daily practice, studies, warm-ups. A 25-sheet watercolour sketchbook is for slower, finished pieces. If you are building a habit, more pages at a lighter weight beats fewer heavy pages.' },
        { h2: '4. Does it need to lie flat?' },
        { p: 'Spiral binding opens completely flat and even folds back on itself, which matters when you draw across a spread or hold the book in one hand. It also lets you tear a page out cleanly. Every Waraqa sketchbook is wire-spiral bound for this reason.' },
        { h2: 'The short answer' },
        { list: [
          'Just starting, mostly pencil: A5, 150gsm, lots of pages.',
          'Pens and markers: A5, 250gsm.',
          'Drawing on the go: the mini, 200gsm.',
          'Watercolour: 320gsm, any size you like.',
        ] },
        { tip: 'Not sure? Our paper guide compares every weight side by side, or message us on WhatsApp with what you draw with.' },
      ],
    },
    ar: {
      title: 'إزاي تختار أول سكتش بوك ليك (من غير ما تحتار كتير)',
      description:
        'المقاس، الجرام، التجليد وعدد الصفحات: دليل عملي تختار بيه سكتش بوك في مصر هتملاه فعلاً.',
      excerpt: 'أربع أسئلة بيحسموا الموضوع: بترسم بإيه، بترسم فين، بترسم قد إيه، ومحتاج الصفحة تفرد ولا لأ.',
      body: [
        { p: 'أحسن سكتش بوك هو اللي بتفتحه كل يوم. ناس كتير بتشتري واحد شيك وغالي، وبعدين مابترسمش فيه عشان كل صفحة حاسسها غالية أوي. فأول قاعدة بسيطة: اختار سكتش مش خايف تبوّظه.' },
        { p: 'بعد كده، أربع أسئلة بيحددوا كل حاجة تقريباً.' },
        { h2: '١. بترسم بإيه؟' },
        { p: 'ده اللي بيحدد الجرام. الرصاص والفحم مبسوطين على ١٥٠–١٨٠ جرام. الفاينلاينر وماركرز الكحول محتاجين ٢٠٠–٢٥٠ جرام عشان مايشفّوش. الألوان المائية والجواش محتاجين حوالي ٣٢٠ جرام، وإلا الصفحة هتتموّج.' },
        { p: 'لو بتستخدم شوية من كل حاجة، الـ٢٥٠ جرام هو الوسط الآمن: بياخد ماركرز وألوان خفيفة، ولسه حلو تحت الرصاص.' },
        { h2: '٢. بترسم فين؟' },
        { p: 'لو بترسم في البيت أو الكلية، A5 أو A4 هيدّوك مساحة تشتغل. لو بترسم في الكافيه أو المترو أو وإنت مستني، خد حاجة صغيرة تعيش في شنطتك: الميني اللي في الجيب بيتملي أكتر بكتير من سكتش كبير قاعد على المكتب.' },
        { h2: '٣. بترسم قد إيه؟' },
        { p: 'عدّ الصفحات، مش التُخن بس. سكتش رسم ٥٠ ورقة معمول للكمية: تمرين يومي ودراسات وتسخين. سكتش ألوان مائية ٢٥ ورقة للشغل الأبطأ والأكمل. لو بتبني عادة، صفحات أكتر بورق أخف أحسن من صفحات تقيلة قليلة.' },
        { h2: '٤. محتاج الصفحة تفرد؟' },
        { p: 'التجليد السلك بيفتح على الآخر وبيتطبّق على نفسه كمان، وده مهم لو بترسم على صفحتين أو ماسك السكتش بإيد واحدة. وكمان تقدر تقطع صفحة بشكل نضيف. عشان كده كل سكتشات ورقة متجلدة سلك.' },
        { h2: 'الإجابة المختصرة' },
        { list: [
          'لسه بادئ وأغلب شغلك رصاص: A5، ١٥٠ جرام، صفحات كتير.',
          'أقلام وماركرز: A5، ٢٥٠ جرام.',
          'بترسم وإنت برا: الميني، ٢٠٠ جرام.',
          'ألوان مائية: ٣٢٠ جرام، بأي مقاس يعجبك.',
        ] },
        { tip: 'لسه محتار؟ دليل الورق عندنا بيقارن كل جرام جنب التاني، أو ابعتلنا على واتساب وقولنا بترسم بإيه.' },
      ],
    },
  },
  {
    slug: 'drawing-on-kraft-paper',
    date: '2026-10-04',
    image: '/lifestyle/lifestyle-1.jpeg',
    products: ['a5-kraft-sketchbook-180gsm'],
    minutes: 4,
    en: {
      title: 'Drawing on kraft paper: a beginner’s guide to toned sketchbooks',
      description:
        'Why artists love brown kraft sketchbooks, which pens and pencils work on them, and a simple three-value method for drawing on toned paper.',
      excerpt: 'On a mid-tone page you only draw half the drawing: the shadows go down in graphite, the light goes up in white.',
      body: [
        { p: 'A white page asks you to build every value from scratch. A kraft page already gives you the middle. That single change makes drawing faster, more dramatic and, for many people, much less intimidating.' },
        { h2: 'Why toned paper works' },
        { p: 'Kraft is a warm brown mid-tone. When you draw on it, the paper itself becomes the half-tone: you add darks for shadows and lights for highlights, and leave the rest alone. Portraits, still lifes and figure studies pick up depth in a few strokes.' },
        { h2: 'What to draw with' },
        { list: [
          'Graphite pencil or charcoal for the shadows.',
          'White charcoal, white pastel pencil or a white gel pen for the highlights.',
          'Brown, sepia or sanguine pencils sit naturally on kraft for warm studies.',
          'Black fineliner for crisp line work; the brown paper makes it feel softer than on white.',
        ] },
        { h2: 'A simple three-value method' },
        { list: [
          'Sketch the outline lightly in graphite.',
          'Block in the shadow shapes, nothing else.',
          'Add white only where the light hits hardest. Stop earlier than you think.',
        ] },
        { p: 'That last step is where kraft shines: a little white reads as bright light because everything around it is mid-tone. Use too much and the effect disappears.' },
        { h2: 'Paper weight for kraft' },
        { p: 'Toned dry media don’t need heavy paper. Around 180gsm gives enough tooth for charcoal and pastel and stays comfortable for gel pens. Avoid heavy washes on kraft; it is a dry-media paper.' },
        { tip: 'Try it on something everyday: a tea glass by the window, a hand, the folds of a curtain. Toned paper makes ordinary light look special.' },
      ],
    },
    ar: {
      title: 'الرسم على ورق الكرافت: دليل المبتدئ للسكتش الملوّن',
      description:
        'ليه الفنانين بيحبوا سكتش الكرافت البني، أنهي أقلام ورصاص بتنفع عليه، وطريقة بسيطة بتلات درجات للرسم على الورق الملوّن.',
      excerpt: 'على صفحة متوسطة اللون إنت بترسم نص الرسمة بس: الضل بالرصاص، والنور بالأبيض.',
      body: [
        { p: 'الصفحة البيضا بتطلب منك تبني كل درجة من الصفر. صفحة الكرافت بتديك النص جاهز. التغيير ده لوحده بيخلي الرسم أسرع وأقوى، ولناس كتير أقل رهبة بكتير.' },
        { h2: 'ليه الورق الملوّن بيشتغل' },
        { p: 'الكرافت درجة بني دافية متوسطة. لما ترسم عليه، الورق نفسه بيبقى الدرجة الوسطانية: بتضيف الغامق للضل والفاتح للنور، وتسيب الباقي زي ما هو. البورتريه والطبيعة الصامتة ودراسات الجسم بياخدوا عمق في كام خط.' },
        { h2: 'ترسم بإيه' },
        { list: [
          'قلم رصاص أو فحم للضل.',
          'فحم أبيض أو قلم باستيل أبيض أو جل بن أبيض للنور.',
          'الألوان البني والسيبيا والأحمر الطوبي بتقعد طبيعي على الكرافت للدراسات الدافية.',
          'فاينلاينر أسود للخطوط الحادة؛ الورق البني بيخليه أنعم من على الأبيض.',
        ] },
        { h2: 'طريقة بسيطة بتلات درجات' },
        { list: [
          'ارسم الشكل الخارجي بخفة بالرصاص.',
          'املا أشكال الضل بس، ولا حاجة تانية.',
          'حط الأبيض في الأماكن اللي النور ضاربها أوي بس. ووقّف قبل ما تفتكر إنك خلصت.',
        ] },
        { p: 'الخطوة الأخيرة دي هي سر الكرافت: شوية أبيض بيبانوا نور قوي عشان كل اللي حواليهم درجة متوسطة. لو حطيت كتير، التأثير بيروح.' },
        { h2: 'جرام ورق الكرافت' },
        { p: 'الخامات الناشفة على الورق الملوّن مش محتاجة ورق تقيل. حوالي ١٨٠ جرام بيدي خشونة كفاية للفحم والباستيل ومريح للجل بن. ابعد عن الألوان المائية الكتير على الكرافت؛ ده ورق للخامات الناشفة.' },
        { tip: 'جرّب على حاجة من يومك: كوباية شاي جنب الشباك، إيدك، كسرات الستارة. الورق الملوّن بيخلي النور العادي يبان مميز.' },
      ],
    },
  },
  {
    slug: 'watercolour-in-a-sketchbook',
    date: '2026-10-04',
    image: '/guide/wash.jpg',
    products: ['a5-mixed-media-sketchbook-320gsm', 'a4-mixed-media-sketchbook-320gsm'],
    minutes: 4,
    en: {
      title: 'Watercolour in a sketchbook: how to stop the pages buckling',
      description:
        'Why watercolour warps thin paper, why 320gsm mixed-media paper holds up, and six habits that keep sketchbook pages flat.',
      excerpt: 'Buckling is not bad technique. It is paper fibres swelling with water, and the fix starts with the right weight.',
      body: [
        { p: 'You lay down a beautiful wash, and ten minutes later the page looks like a potato crisp. Almost every watercolour beginner hits this, and it is rarely about technique. It is the paper.' },
        { h2: 'Why paper buckles' },
        { p: 'Paper is made of fibres. Water makes them swell unevenly: the wet area expands while the dry area doesn’t, so the sheet ripples. Thin paper has fewer fibres to resist, so it warps quickly and can even pill when you rework a spot.' },
        { h2: 'Why weight matters' },
        { p: 'At around 320gsm a mixed-media sheet is dense enough to absorb a wash without losing its shape, and it settles back close to flat as it dries. Below 250gsm, keep washes light; above 300gsm you can layer, glaze and work wet-in-wet.' },
        { h2: 'Six habits that keep pages flat' },
        { list: [
          'Mix enough paint before you start, so you are not re-wetting the page to fix colour.',
          'Let each layer dry fully before the next.',
          'Work from light to dark; fewer layers means less water.',
          'Slip a scrap sheet behind the page to protect the next one.',
          'If a page curls, close the sketchbook under a few books overnight once it is dry.',
          'Use gouache or acrylic more thickly, with less water; they sit on top rather than soaking in.',
        ] },
        { h2: 'Spiral binding helps too' },
        { p: 'A spiral sketchbook opens fully flat, so you can paint right to the edge and lay the book flat to dry, instead of fighting a spine that wants to close.' },
        { tip: 'Treat a 320gsm sketchbook as a book of finished pieces. Fewer pages, but each one can take the full treatment.' },
      ],
    },
    ar: {
      title: 'ألوان مائية في السكتش بوك: إزاي تمنع الصفحات تتموّج',
      description:
        'ليه الألوان المائية بتلوي الورق الرفيع، وليه ورق الميكسد ميديا ٣٢٠ جرام بيستحمل، وست عادات بتخلي صفحات السكتش مفرودة.',
      excerpt: 'التموّج مش غلط في التكنيك. ده ألياف الورق بتنفخ من المية، والحل بيبدأ من الجرام الصح.',
      body: [
        { p: 'بتحط طبقة لون حلوة، وبعد عشر دقايق الصفحة شكلها شيبسي. كل اللي بيبدأ ألوان مائية تقريباً بيقابل ده، والسبب نادراً ما يكون التكنيك. السبب الورق.' },
        { h2: 'ليه الورق بيتموّج' },
        { p: 'الورق معمول من ألياف. المية بتخليها تنفخ بشكل مش متساوي: الحتة المبلولة بتتمدد والناشفة لأ، فالورقة بتعمل موج. الورق الرفيع أليافه أقل تقاوم، فبيتلوي بسرعة وممكن ينسّر لو رجعت على نفس الحتة.' },
        { h2: 'ليه الجرام فارق' },
        { p: 'في حوالي ٣٢٠ جرام، ورقة الميكسد ميديا كثيفة كفاية تشرب الطبقة من غير ما تفقد شكلها، وبترجع قريبة من المفرودة وهي بتنشف. تحت ٢٥٠ جرام خلّي الطبقات خفيفة؛ وفوق ٣٠٠ جرام تقدر تعمل طبقات وتداخل مبلول على مبلول.' },
        { h2: 'ست عادات بتخلي الصفحات مفرودة' },
        { list: [
          'اخلط لون كفاية قبل ما تبدأ، عشان ماترجعش تبل الصفحة تظبط اللون.',
          'سيب كل طبقة تنشف خالص قبل اللي بعدها.',
          'اشتغل من الفاتح للغامق؛ طبقات أقل يعني مية أقل.',
          'حط ورقة سايبة ورا الصفحة عشان تحمي اللي بعدها.',
          'لو الصفحة اتلوت، اقفل السكتش تحت كام كتاب لحد الصبح بعد ما ينشف.',
          'استخدم الجواش والأكريليك أتخن وبمية أقل؛ بيقعدوا فوق الورق بدل ما يتشربوا جواه.',
        ] },
        { h2: 'السلك كمان بيفرق' },
        { p: 'السكتش السلك بيفتح مفرود على الآخر، فتقدر تلوّن لحد الحرف وتسيب السكتش مفرود ينشف، بدل ما تحارب كعب عايز يتقفل.' },
        { tip: 'اتعامل مع سكتش الـ٣٢٠ جرام كأنه كتاب لوحات خلصانة. صفحات أقل، بس كل واحدة تستحمل الشغل كله.' },
      ],
    },
  },
  {
    slug: 'what-to-draw-in-cairo',
    date: '2026-10-04',
    image: '/blog/cairo-desk.jpg',
    products: ['mini-sketchbook-200gsm', 'a5-drawing-sketchbook-150gsm'],
    minutes: 4,
    en: {
      title: '30 things to draw in Cairo when you don’t know what to draw',
      description:
        'A sketchbook prompt list taken from everyday Cairo: tea glasses, balconies, microbuses and more. Small subjects for a daily drawing habit.',
      excerpt: 'Blank-page block is usually a subject problem. Here are thirty small, ordinary ones you can find within a few minutes of home.',
      body: [
        { p: 'Most days the hardest part of drawing is deciding what to draw. Big subjects feel like they need a big drawing, so nothing happens. The fix is to go small and local: draw what is already in front of you, quickly, and let it be imperfect.' },
        { p: 'Here are thirty prompts from everyday Cairo. Pick one, give it ten minutes, and turn the page.' },
        { h2: 'At home' },
        { list: [
          'A glass of tea with mint, before and after the first sip.',
          'Your shoes by the door.',
          'The view from your balcony at sunset.',
          'Laundry on the line.',
          'A plant that has survived everything.',
          'Your keys, phone and wallet as a still life.',
          'A sleeping cat (they hold still, mostly).',
          'Bread on the table at breakfast.',
          'Your own hand holding the pencil.',
          'The pattern on a cushion or rug.',
        ] },
        { h2: 'In the street' },
        { list: [
          'A microbus waiting to fill up.',
          'Satellite dishes on a rooftop.',
          'A kiosk and everything hanging from it.',
          'A minaret against the evening sky.',
          'Pigeon towers on the roofs.',
          'A street-food cart.',
          'People waiting at a bus stop, in under a minute each.',
          'Old balconies with iron railings.',
          'A shop sign in Arabic lettering.',
          'Traffic lights and the chaos underneath them.',
        ] },
        { h2: 'Out and about' },
        { list: [
          'Your coffee cup in a café.',
          'Someone reading on the metro.',
          'A felucca on the Nile.',
          'Fruit stacked at a market stall.',
          'Trees along the Corniche.',
          'A doorway in Islamic Cairo.',
          'Your bag and what spills out of it.',
          'Hands of someone talking.',
          'Clouds over the city, five minutes apart.',
          'The same street at two different times of day.',
        ] },
        { h2: 'Make it a habit' },
        { p: 'Carry a small sketchbook so the prompt is always possible. Date every page. Don’t tear out the bad ones: a month later, the difference between the first page and the last is the best motivation you will get.' },
        { tip: 'Draw a lot, mess up often. That is the whole method.' },
      ],
    },
    ar: {
      title: '٣٠ حاجة ترسمها في القاهرة لما تبقى مش عارف ترسم إيه',
      description:
        'قايمة أفكار للسكتش بوك من يومك في القاهرة: كوباية الشاي، البلكونات، الميكروباص وأكتر. مواضيع صغيرة لعادة رسم يومية.',
      excerpt: 'وقفة الصفحة الفاضية غالباً مشكلة موضوع. دي تلاتين موضوع صغير وعادي تلاقيهم على بعد دقايق من بيتك.',
      body: [
        { p: 'أغلب الأيام أصعب حتة في الرسم إنك تقرر ترسم إيه. المواضيع الكبيرة بتحسسك إنها محتاجة رسمة كبيرة، فمفيش حاجة بتحصل. الحل إنك تصغّر وتقرّب: ارسم اللي قدامك أصلاً، بسرعة، وسيبه يطلع مش مظبوط.' },
        { p: 'دي تلاتين فكرة من يومنا في القاهرة. اختار واحدة، اديها عشر دقايق، واقلب الصفحة.' },
        { h2: 'في البيت' },
        { list: [
          'كوباية شاي بالنعناع، قبل أول شفطة وبعدها.',
          'جزمتك جنب الباب.',
          'المنظر من البلكونة وقت المغرب.',
          'الغسيل على الحبل.',
          'زرعة عاشت رغم كل حاجة.',
          'مفاتيحك وموبايلك ومحفظتك كطبيعة صامتة.',
          'قطة نايمة (غالباً مش بتتحرك).',
          'العيش على السفرة وقت الفطار.',
          'إيدك وهي ماسكة القلم.',
          'نقشة مخدة أو سجادة.',
        ] },
        { h2: 'في الشارع' },
        { list: [
          'ميكروباص مستني يكمّل.',
          'الأطباق على السطوح.',
          'كشك وكل اللي متعلق فيه.',
          'مئذنة قدام سما المغرب.',
          'غيّات الحمام على السطوح.',
          'عربية فول.',
          'ناس مستنية في المحطة، كل واحد في أقل من دقيقة.',
          'بلكونات قديمة بسور حديد.',
          'يافطة محل بخط عربي.',
          'إشارة المرور والزحمة اللي تحتها.',
        ] },
        { h2: 'وإنت برا' },
        { list: [
          'فنجان قهوتك في الكافيه.',
          'حد بيقرا في المترو.',
          'فلوكة في النيل.',
          'فاكهة مرصوصة على فرشة في السوق.',
          'الشجر على الكورنيش.',
          'باب في القاهرة الإسلامية.',
          'شنطتك واللي بيقع منها.',
          'إيدين حد بيتكلم.',
          'سحاب فوق المدينة، كل خمس دقايق مرة.',
          'نفس الشارع في وقتين مختلفين من اليوم.',
        ] },
        { h2: 'خليها عادة' },
        { p: 'شيل سكتش صغير معاك عشان الفكرة تبقى ممكنة دايماً. اكتب التاريخ على كل صفحة. وماتقطعش الصفحات الوحشة: بعد شهر، الفرق بين أول صفحة وآخر صفحة هو أحسن دافع هتلاقيه.' },
        { tip: 'ارسم كتير، وماتخافش تغلط. دي الطريقة كلها.' },
      ],
    },
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export function formatDate(iso: string, isAr: boolean) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export type { Locale };
