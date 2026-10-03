// ============================================================
// Waraqa Store — Legal pages (privacy, returns, shipping, terms)
// ============================================================
// Written against Egyptian law: the Consumer Protection Law (No. 181 of 2018),
// in particular its distance-selling chapter (Arts. 37–41) and the return and
// defect rules (Arts. 17 and 21), and the Personal Data Protection Law
// (No. 151 of 2020). They describe how this store actually runs — cash on
// delivery, orders stored in Google Sheets, PostHog analytics, Cloudflare
// hosting — so change them when any of that changes.
//
// Not legal advice; have them reviewed before relying on them in a dispute.
// ============================================================

import type { Locale } from './translations';
import {
  SHIPPING_CAIRO,
  SHIPPING_OUTSIDE,
  FREE_SHIP_OVER,
  DELIVERY_DAYS_MIN,
  DELIVERY_DAYS_MAX,
  WHATSAPP_NUMBER,
  INSTAGRAM_URL,
  CONTACT_EMAIL,
} from './constants';

export type LegalSlug = 'privacy' | 'returns' | 'shipping' | 'terms';
export const LEGAL_SLUGS: LegalSlug[] = ['shipping', 'returns', 'privacy', 'terms'];

/** Shown on every page; bump when a policy's substance changes. */
export const LEGAL_UPDATED = { en: '3 October 2026', ar: '٣ أكتوبر ٢٠٢٦' };

export interface LegalSection {
  heading: string;
  /** Paragraphs; a paragraph starting with "• " renders as a list item. */
  body: string[];
}

export interface LegalDoc {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

const wa = `+${WHATSAPP_NUMBER}`;
const ig = INSTAGRAM_URL.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const docs: Record<Locale, Record<LegalSlug, LegalDoc>> = {
  en: {
    shipping: {
      title: 'Shipping & delivery',
      description: 'Delivery fees, timings and cash on delivery for Waraqa orders across Egypt.',
      intro: 'We deliver to all 27 governorates in Egypt. Every order is cash on delivery.',
      sections: [
        {
          heading: 'Delivery fees',
          body: [
            `• Cairo and Giza: ${SHIPPING_CAIRO} EGP.`,
            `• All other governorates: ${SHIPPING_OUTSIDE} EGP.`,
            `• Free delivery in Cairo and Giza on orders over ${FREE_SHIP_OVER} EGP. Other governorates always pay the delivery fee.`,
            'The exact fee is shown at checkout once you choose your governorate, before you place the order.',
          ],
        },
        {
          heading: 'Delivery time',
          body: [
            `Orders arrive in ${DELIVERY_DAYS_MIN}–${DELIVERY_DAYS_MAX} working days, depending on your governorate. We confirm every order with you on WhatsApp before it ships.`,
            'If your order has not arrived within 30 days of the order date, or by a date we agreed with you, you may cancel it at no cost and we will refund anything you have paid.',
          ],
        },
        {
          heading: 'Paying on delivery',
          body: [
            'You pay the courier in cash, in Egyptian pounds, when your order arrives. You can check the package before paying. If something is wrong or missing, you may refuse it and pay nothing.',
          ],
        },
        {
          heading: 'Changing or cancelling an order',
          body: [
            'You can change or cancel your order free of charge at any time before it ships. Message us on WhatsApp or reply to your order email.',
          ],
        },
      ],
    },
    returns: {
      title: 'Returns & refunds',
      description: 'Return any Waraqa sketchbook within 14 days of delivery. Defective items within 30 days, at no cost to you.',
      intro: 'You have 14 days from delivery to return a sketchbook for any reason, as the Egyptian Consumer Protection Law guarantees.',
      sections: [
        {
          heading: 'Changed your mind',
          body: [
            'You may return or exchange any item within 14 days of receiving it, without giving a reason.',
            'The item must be unused: no drawing, writing, torn-out or damaged pages, and in the condition you received it. A sketchbook that has been used cannot be resold, so it cannot be returned for change of mind.',
            'For change-of-mind returns you cover the return delivery cost. We refund the full amount you paid for the order, including the original delivery fee.',
          ],
        },
        {
          heading: 'Damaged, defective or wrong items',
          body: [
            'If an item arrives damaged, has a manufacturing defect (for example loose binding or missing pages), or is not what you ordered, tell us within 30 days of delivery.',
            'We will replace it or refund you in full, and we cover all delivery costs both ways. A photo on WhatsApp helps us sort it out quickly.',
          ],
        },
        {
          heading: 'How to return',
          body: [
            `• Message us on WhatsApp (${wa}) or reply to your order confirmation email with your order number.`,
            '• We arrange a courier pickup or agree a drop-off with you.',
            '• Once the item reaches us and we have checked it, we confirm the refund or send the replacement.',
          ],
        },
        {
          heading: 'Refunds',
          body: [
            'We refund within 7 days of receiving the returned item.',
            'Because orders are paid in cash, refunds are made in cash on pickup, by InstaPay, by mobile wallet or by bank transfer, whichever you prefer.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'This policy does not reduce any right you have under the Consumer Protection Law (No. 181 of 2018). If we cannot resolve a complaint, you can contact the Consumer Protection Agency (hotline 19588).',
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      description: 'What personal data Waraqa collects, why, who it is shared with, and your rights under Egyptian law.',
      intro: 'This policy explains what personal data we collect when you use waraqa.art, why, and the rights you have under the Egyptian Personal Data Protection Law (No. 151 of 2020).',
      sections: [
        {
          heading: 'Who we are',
          body: [
            `Waraqa (ورقة) is a sketchbook brand based in Cairo, Egypt, and is responsible for your data on this site. Contact us on WhatsApp (${wa}), by email (${CONTACT_EMAIL}) or on Instagram (${ig}).`,
          ],
        },
        {
          heading: 'What we collect',
          body: [
            '• When you order: your name, mobile number, email address, governorate, city and delivery address, any delivery notes, and what you ordered.',
            '• When you join our list: your email address and language.',
            '• When you browse: pages viewed, clicks, device and browser type, and approximate location derived from your IP address, collected through our analytics tool.',
            'We never ask for card or bank details. All orders are cash on delivery.',
          ],
        },
        {
          heading: 'Why we use it',
          body: [
            '• To confirm, deliver and support your order, including contacting you on WhatsApp and emailing your receipt.',
            '• To send you news about new batches, only if you joined our list. You can leave at any time.',
            '• To understand how the site is used and improve it.',
            '• To keep the records Egyptian tax and commercial law require.',
            'We do not sell your personal data.',
          ],
        },
        {
          heading: 'Who we share it with',
          body: [
            '• Delivery companies, who receive your name, phone number and address to deliver your order.',
            '• Google (Sheets, Apps Script and Gmail), where orders are recorded and receipts are sent from.',
            '• PostHog, our website analytics provider.',
            '• Cloudflare, which hosts this website.',
            '• WhatsApp (Meta), when we message you about your order.',
            'Some of these providers store data outside Egypt, including in the United States. By placing an order or using the site you consent to this transfer. We only use providers that protect data to a standard comparable to Egyptian law.',
          ],
        },
        {
          heading: 'Cookies and local storage',
          body: [
            'We store a language cookie so the site remembers English or Arabic, keep your bag in your browser’s local storage so it survives a refresh, and our analytics tool sets its own cookie to count visits. Blocking cookies will not stop you from ordering.',
          ],
        },
        {
          heading: 'How long we keep it',
          body: [
            'Order records are kept for as long as Egyptian tax and commercial law require. Mailing-list addresses are kept until you unsubscribe. Analytics data is kept in aggregate for site improvement.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'Under Law No. 151 of 2020 you have the right to:',
            '• know what personal data we hold about you and get a copy of it;',
            '• correct or update it;',
            '• ask us to delete it, unless we must keep it by law;',
            '• withdraw your consent, or object to or restrict how we use it;',
            '• be told if your data is affected by a breach.',
            `To use any of these rights, message us on WhatsApp (${wa}) or email ${CONTACT_EMAIL}. If you are not satisfied with our answer, you may complain to Egypt’s Personal Data Protection Center.`,
          ],
        },
        {
          heading: 'Children',
          body: [
            'Orders from customers under 18 should be placed with the consent of a parent or guardian.',
          ],
        },
        {
          heading: 'Changes',
          body: [
            'If we change this policy we will update the date at the top of this page.',
          ],
        },
      ],
    },
    terms: {
      title: 'Terms & conditions',
      description: 'The terms that apply when you order from Waraqa: prices, orders, payment, delivery, returns and governing law.',
      intro: 'These terms apply to every order placed on waraqa.art. By placing an order you agree to them, together with our Shipping, Returns and Privacy policies.',
      sections: [
        {
          heading: 'About us',
          body: [
            `Waraqa (ورقة) sells sketchbooks from Cairo, Egypt. WhatsApp: ${wa}. Email: ${CONTACT_EMAIL}. Instagram: ${ig}.`,
          ],
        },
        {
          heading: 'Products and photos',
          body: [
            'We describe each sketchbook’s size, sheet count, paper weight and paper type as accurately as we can. Product photos are studio images of the covers; printing, paper colour and cover illustration can vary slightly between batches.',
          ],
        },
        {
          heading: 'Prices',
          body: [
            'Prices are in Egyptian pounds and include any applicable taxes. The delivery fee is shown separately at checkout. Prices can change, but the price shown when you place your order is the price you pay.',
          ],
        },
        {
          heading: 'Orders',
          body: [
            'After you place an order you receive a confirmation email, and we confirm the details with you on WhatsApp before shipping. If an item turns out to be out of stock, we will tell you and you will not be charged for it.',
            'You can change or cancel your order free of charge before it ships.',
          ],
        },
        {
          heading: 'Payment',
          body: [
            'Payment is cash on delivery only, in Egyptian pounds. You may inspect your order before paying.',
          ],
        },
        {
          heading: 'Delivery and returns',
          body: [
            'Delivery fees and timings are set out in our Shipping & delivery policy. You may return items within 14 days of delivery, and defective items within 30 days, as set out in our Returns & refunds policy.',
          ],
        },
        {
          heading: 'Use of the site',
          body: [
            'All photos, text, the Waraqa name and the ورقة logo belong to Waraqa and may not be copied for commercial use without permission.',
          ],
        },
        {
          heading: 'Liability',
          body: [
            'Nothing in these terms limits your rights under Egyptian consumer protection law. Beyond those rights, our responsibility for any order is limited to the amount you paid for it.',
          ],
        },
        {
          heading: 'Governing law',
          body: [
            'These terms are governed by the laws of the Arab Republic of Egypt, and the Egyptian courts have jurisdiction over any dispute.',
          ],
        },
      ],
    },
  },

  ar: {
    shipping: {
      title: 'الشحن والتوصيل',
      description: 'مصاريف التوصيل ومواعيده والدفع عند الاستلام لطلبات ورقة في كل محافظات مصر.',
      intro: 'نوصّل إلى جميع محافظات مصر الـ ٢٧، وجميع الطلبات بالدفع عند الاستلام.',
      sections: [
        {
          heading: 'مصاريف التوصيل',
          body: [
            `• القاهرة والجيزة: ${SHIPPING_CAIRO} جنيه.`,
            `• باقي المحافظات: ${SHIPPING_OUTSIDE} جنيه.`,
            `• التوصيل مجاني في القاهرة والجيزة للطلبات التي تزيد على ${FREE_SHIP_OVER} جنيه. تُحتسب مصاريف التوصيل دائمًا في باقي المحافظات.`,
            'تظهر مصاريف التوصيل بدقة في صفحة إتمام الطلب بعد اختيار المحافظة، وقبل تأكيد الطلب.',
          ],
        },
        {
          heading: 'مدة التوصيل',
          body: [
            `يصل الطلب خلال ${DELIVERY_DAYS_MIN} إلى ${DELIVERY_DAYS_MAX} أيام عمل حسب المحافظة، ونؤكد كل طلب معك عبر واتساب قبل شحنه.`,
            'إذا لم يصلك الطلب خلال ٣٠ يومًا من تاريخ الطلب، أو في الموعد الذي اتفقنا عليه، يحق لك إلغاؤه دون أي تكلفة واسترداد أي مبلغ دفعته.',
          ],
        },
        {
          heading: 'الدفع عند الاستلام',
          body: [
            'تدفع للمندوب نقدًا بالجنيه المصري عند وصول الطلب، ويمكنك معاينة الطلب قبل الدفع. إذا وجدت أي مشكلة أو نقص، يحق لك رفض الاستلام دون دفع أي مبلغ.',
          ],
        },
        {
          heading: 'تعديل الطلب أو إلغاؤه',
          body: [
            'يمكنك تعديل طلبك أو إلغاؤه مجانًا في أي وقت قبل شحنه، عبر مراسلتنا على واتساب أو الرد على إيميل تأكيد الطلب.',
          ],
        },
      ],
    },
    returns: {
      title: 'الاسترجاع والاسترداد',
      description: 'يمكنك إرجاع أي سكتش بوك من ورقة خلال ١٤ يومًا من الاستلام، والمنتجات المعيبة خلال ٣٠ يومًا دون أي تكلفة.',
      intro: 'لديك ١٤ يومًا من تاريخ الاستلام لإرجاع أي منتج دون إبداء أسباب، وفقًا لقانون حماية المستهلك المصري.',
      sections: [
        {
          heading: 'إذا غيّرت رأيك',
          body: [
            'يحق لك إرجاع أو استبدال أي منتج خلال ١٤ يومًا من استلامه دون إبداء أسباب.',
            'يشترط أن يكون المنتج غير مستخدم: بلا رسم أو كتابة أو صفحات مقطوعة أو تالفة، وبالحالة التي استلمته بها. لا يمكن إعادة بيع السكتش بوك المستخدم، لذلك لا يُقبل إرجاعه لمجرد تغيير الرأي.',
            'في حالة الإرجاع لتغيير الرأي تتحمل أنت مصاريف شحن الإرجاع، ونرد لك كامل المبلغ الذي دفعته للطلب بما فيه مصاريف التوصيل الأصلية.',
          ],
        },
        {
          heading: 'المنتجات التالفة أو المعيبة أو المختلفة',
          body: [
            'إذا وصلك منتج تالف، أو به عيب صناعة (مثل سلك مفكوك أو صفحات ناقصة)، أو مختلف عما طلبته، أبلغنا خلال ٣٠ يومًا من الاستلام.',
            'سنستبدله أو نرد لك كامل المبلغ، ونتحمل جميع مصاريف الشحن ذهابًا وعودة. إرسال صورة على واتساب يساعدنا على الحل بسرعة.',
          ],
        },
        {
          heading: 'طريقة الإرجاع',
          body: [
            `• راسلنا على واتساب (${wa}) أو رد على إيميل تأكيد الطلب مع رقم الطلب.`,
            '• نرتب معك استلام المنتج عن طريق مندوب أو نتفق على مكان للتسليم.',
            '• بعد وصول المنتج إلينا وفحصه نؤكد الاسترداد أو نرسل البديل.',
          ],
        },
        {
          heading: 'رد المبلغ',
          body: [
            'نرد المبلغ خلال ٧ أيام من استلام المنتج المرتجع.',
            'لأن الطلبات تُدفع نقدًا، يتم الرد نقدًا عند الاستلام أو عبر إنستاباي أو المحفظة الإلكترونية أو التحويل البنكي، حسب ما تفضله.',
          ],
        },
        {
          heading: 'حقوقك',
          body: [
            'لا تنتقص هذه السياسة من أي حق مكفول لك بموجب قانون حماية المستهلك رقم ١٨١ لسنة ٢٠١٨. وإذا تعذر حل شكواك معنا، يمكنك التواصل مع جهاز حماية المستهلك (الخط الساخن ١٩٥٨٨).',
          ],
        },
      ],
    },
    privacy: {
      title: 'سياسة الخصوصية',
      description: 'ما البيانات الشخصية التي تجمعها ورقة، ولماذا، ومع من تشاركها، وحقوقك وفقًا للقانون المصري.',
      intro: 'توضح هذه السياسة البيانات الشخصية التي نجمعها عند استخدامك waraqa.art، وسبب جمعها، والحقوق المكفولة لك بموجب قانون حماية البيانات الشخصية المصري رقم ١٥١ لسنة ٢٠٢٠.',
      sections: [
        {
          heading: 'من نحن',
          body: [
            `ورقة (Waraqa) علامة سكتش بوك مقرها القاهرة، مصر، وهي المسؤولة عن بياناتك على هذا الموقع. للتواصل: واتساب (${wa})، أو البريد الإلكتروني (${CONTACT_EMAIL})، أو إنستجرام (${ig}).`,
          ],
        },
        {
          heading: 'البيانات التي نجمعها',
          body: [
            '• عند الطلب: الاسم، ورقم الموبايل، والبريد الإلكتروني، والمحافظة، والمدينة، وعنوان التوصيل، وأي ملاحظات للتوصيل، والمنتجات المطلوبة.',
            '• عند الاشتراك في قائمتنا البريدية: بريدك الإلكتروني ولغتك.',
            '• أثناء التصفح: الصفحات التي تزورها، والنقرات، ونوع الجهاز والمتصفح، والموقع التقريبي المستنتج من عنوان IP، وذلك من خلال أداة التحليلات.',
            'لا نطلب أبدًا بيانات بطاقات أو حسابات بنكية، فجميع الطلبات بالدفع عند الاستلام.',
          ],
        },
        {
          heading: 'لماذا نستخدمها',
          body: [
            '• لتأكيد طلبك وتوصيله ومتابعته، بما في ذلك التواصل معك عبر واتساب وإرسال الإيصال بالبريد الإلكتروني.',
            '• لإرسال أخبار الدفعات الجديدة، فقط إذا اشتركت في قائمتنا، ويمكنك إلغاء الاشتراك في أي وقت.',
            '• لفهم كيفية استخدام الموقع وتحسينه.',
            '• للاحتفاظ بالسجلات التي تتطلبها القوانين الضريبية والتجارية المصرية.',
            'نحن لا نبيع بياناتك الشخصية.',
          ],
        },
        {
          heading: 'مع من نشاركها',
          body: [
            '• شركات الشحن، وتحصل على اسمك ورقم هاتفك وعنوانك لتوصيل الطلب.',
            '• جوجل (Sheets وApps Script وGmail)، حيث تُسجل الطلبات وتُرسل الإيصالات.',
            '• PostHog، مزود تحليلات الموقع.',
            '• Cloudflare، التي تستضيف هذا الموقع.',
            '• واتساب (Meta)، عند مراسلتك بخصوص طلبك.',
            'يخزن بعض هؤلاء المزودين البيانات خارج مصر، ومنها الولايات المتحدة. بإتمامك للطلب أو استخدامك للموقع فإنك توافق على هذا النقل، ونحن لا نتعامل إلا مع مزودين يحمون البيانات بمستوى مماثل لما يقتضيه القانون المصري.',
          ],
        },
        {
          heading: 'ملفات تعريف الارتباط والتخزين المحلي',
          body: [
            'نحفظ ملف تعريف ارتباط للغة حتى يتذكر الموقع اختيارك بين العربية والإنجليزية، ونحفظ سلة مشترياتك في التخزين المحلي لمتصفحك حتى لا تضيع عند تحديث الصفحة، كما تضع أداة التحليلات ملفها الخاص لإحصاء الزيارات. حظر ملفات تعريف الارتباط لا يمنعك من الطلب.',
          ],
        },
        {
          heading: 'مدة الاحتفاظ بالبيانات',
          body: [
            'نحتفظ بسجلات الطلبات للمدة التي تتطلبها القوانين الضريبية والتجارية المصرية، وبعناوين القائمة البريدية حتى تلغي اشتراكك، وببيانات التحليلات بشكل مجمّع لأغراض تحسين الموقع.',
          ],
        },
        {
          heading: 'حقوقك',
          body: [
            'وفقًا للقانون رقم ١٥١ لسنة ٢٠٢٠ يحق لك:',
            '• معرفة البيانات الشخصية التي نحتفظ بها عنك والحصول على نسخة منها؛',
            '• تصحيحها أو تحديثها؛',
            '• طلب حذفها، ما لم يُلزمنا القانون بالاحتفاظ بها؛',
            '• سحب موافقتك، أو الاعتراض على معالجتها أو تقييدها؛',
            '• إخطارك بأي خرق يمس بياناتك.',
            `لممارسة أي من هذه الحقوق راسلنا على واتساب (${wa}) أو عبر البريد الإلكتروني ${CONTACT_EMAIL}. وإذا لم تكن راضيًا عن ردنا يحق لك تقديم شكوى إلى مركز حماية البيانات الشخصية.`,
          ],
        },
        {
          heading: 'الأطفال',
          body: [
            'يجب أن تتم طلبات من هم دون ١٨ عامًا بموافقة أحد الوالدين أو الولي.',
          ],
        },
        {
          heading: 'التعديلات',
          body: [
            'إذا عدّلنا هذه السياسة سنحدّث التاريخ المذكور أعلى هذه الصفحة.',
          ],
        },
      ],
    },
    terms: {
      title: 'الشروط والأحكام',
      description: 'الشروط التي تسري على طلباتك من ورقة: الأسعار والطلبات والدفع والتوصيل والاسترجاع والقانون الواجب التطبيق.',
      intro: 'تسري هذه الشروط على كل طلب يتم عبر waraqa.art. بإتمامك للطلب فإنك توافق عليها وعلى سياسات الشحن والاسترجاع والخصوصية.',
      sections: [
        {
          heading: 'من نحن',
          body: [
            `ورقة (Waraqa) تبيع السكتش بوك من القاهرة، مصر. واتساب: ${wa}. البريد الإلكتروني: ${CONTACT_EMAIL}. إنستجرام: ${ig}.`,
          ],
        },
        {
          heading: 'المنتجات والصور',
          body: [
            'نصف مقاس كل سكتش بوك وعدد أوراقه ووزن الورق ونوعه بأدق ما يمكن. صور المنتجات صور استوديو للأغلفة، وقد تختلف الطباعة ولون الورق ورسوم الغلاف اختلافًا بسيطًا بين الدفعات.',
          ],
        },
        {
          heading: 'الأسعار',
          body: [
            'الأسعار بالجنيه المصري وتشمل أي ضرائب مطبقة، وتظهر مصاريف التوصيل منفصلة في صفحة إتمام الطلب. قد تتغير الأسعار، لكن السعر الظاهر وقت تأكيد طلبك هو السعر الذي تدفعه.',
          ],
        },
        {
          heading: 'الطلبات',
          body: [
            'بعد تأكيد الطلب يصلك إيميل بالتأكيد، ونراجع التفاصيل معك عبر واتساب قبل الشحن. وإذا تبين نفاد أي منتج سنبلغك ولن تُحاسب عليه.',
            'يمكنك تعديل طلبك أو إلغاؤه مجانًا قبل شحنه.',
          ],
        },
        {
          heading: 'الدفع',
          body: [
            'الدفع نقدًا عند الاستلام فقط وبالجنيه المصري، ويمكنك معاينة الطلب قبل الدفع.',
          ],
        },
        {
          heading: 'التوصيل والاسترجاع',
          body: [
            'مصاريف التوصيل ومواعيده موضحة في سياسة الشحن والتوصيل. يحق لك إرجاع المنتجات خلال ١٤ يومًا من الاستلام، والمنتجات المعيبة خلال ٣٠ يومًا، كما هو موضح في سياسة الاسترجاع والاسترداد.',
          ],
        },
        {
          heading: 'استخدام الموقع',
          body: [
            'جميع الصور والنصوص واسم ورقة وشعارها مملوكة لورقة، ولا يجوز نسخها لأغراض تجارية دون إذن.',
          ],
        },
        {
          heading: 'المسؤولية',
          body: [
            'لا تنتقص هذه الشروط من حقوقك وفقًا لقانون حماية المستهلك المصري. وفيما يتجاوز تلك الحقوق، تقتصر مسؤوليتنا عن أي طلب على المبلغ الذي دفعته مقابله.',
          ],
        },
        {
          heading: 'القانون الواجب التطبيق',
          body: [
            'تخضع هذه الشروط لقوانين جمهورية مصر العربية، وتختص المحاكم المصرية بنظر أي نزاع.',
          ],
        },
      ],
    },
  },
};

export function getLegalDoc(locale: Locale, slug: LegalSlug): LegalDoc {
  return docs[locale][slug];
}
