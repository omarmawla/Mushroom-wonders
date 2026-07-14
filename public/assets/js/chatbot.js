(function (root) {
  'use strict';

  const WHATSAPP_URL = 'https://wa.me/8801516567622';
  const SOURCES = {
    fdaStorage: 'https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-produce-safely',
    fdaMushrooms: 'https://www.fda.gov/food/outbreaks-foodborne-illness/investigation-illnesses-morel-mushrooms-may-2023',
    cdcWild: 'https://www.cdc.gov/mmwr/volumes/75/wr/mm7520a2.htm',
    usdaNutrition: 'https://fdc.nal.usda.gov/'
  };

  const copy = {
    en: {
      title: 'Mushroom Assistant',
      status: 'Instant answers · Free to use',
      open: 'Open Mushroom Assistant',
      close: 'Close assistant',
      placeholder: 'Ask about products, delivery, mushrooms…',
      send: 'Send',
      source: 'Verified source',
      whatsapp: 'Chat with a person on WhatsApp',
      welcome: 'Hi! I can help with Mushroom Wonders products, ordering, delivery, payment, storage, recipes, and common mushroom questions. What would you like to know?',
      fallback: 'I do not have a reliable answer for that yet. Try one of the suggestions below, or ask the Mushroom Wonders team on WhatsApp.',
      safety: 'For urgent illness after eating a mushroom, contact local emergency medical services now. Keep a sample or clear photo for the clinician if it is safe to do so.',
      quick: ['How do I order?', 'Products and prices', 'Delivery time', 'How to store mushrooms'],
      thinking: 'Finding the best answer…'
    },
    bn: {
      title: 'মাশরুম সহকারী',
      status: 'তাৎক্ষণিক উত্তর · সম্পূর্ণ বিনামূল্যে',
      open: 'মাশরুম সহকারী খুলুন',
      close: 'সহকারী বন্ধ করুন',
      placeholder: 'পণ্য, ডেলিভারি বা মাশরুম সম্পর্কে জিজ্ঞাসা করুন…',
      send: 'পাঠান',
      source: 'যাচাইকৃত উৎস',
      whatsapp: 'WhatsApp-এ সরাসরি কথা বলুন',
      welcome: 'স্বাগতম! Mushroom Wonders-এর পণ্য, অর্ডার, ডেলিভারি, পেমেন্ট, সংরক্ষণ, রেসিপি এবং মাশরুমের সাধারণ প্রশ্নে সাহায্য করতে পারি। কী জানতে চান?',
      fallback: 'এই প্রশ্নের নির্ভরযোগ্য উত্তর এখনো আমার তথ্যভাণ্ডারে নেই। নিচের কোনো প্রশ্ন বেছে নিন অথবা WhatsApp-এ Mushroom Wonders টিমকে জিজ্ঞাসা করুন।',
      safety: 'মাশরুম খাওয়ার পর অসুস্থতা দেখা দিলে এখনই স্থানীয় জরুরি চিকিৎসাসেবার সঙ্গে যোগাযোগ করুন। নিরাপদ হলে চিকিৎসকের জন্য নমুনা বা পরিষ্কার ছবি রাখুন।',
      quick: ['কীভাবে অর্ডার করব?', 'পণ্য ও দাম', 'ডেলিভারি কত দিনে?', 'মাশরুম কীভাবে রাখব?'],
      thinking: 'সঠিক উত্তর খোঁজা হচ্ছে…'
    }
  };

  const entries = [
    {
      id: 'order',
      phrases: ['how do i order', 'how to order', 'place an order', 'order process', 'কীভাবে অর্ডার', 'কিভাবে অর্ডার', 'অর্ডার করব', 'অর্ডার করার নিয়ম'],
      keywords: ['order', 'buy', 'purchase', 'অর্ডার', 'কিনব', 'কেনার'],
      answer: {
        en: 'Open the Order page, enter your name and phone, choose products and quantity, select a delivery area and address, then choose online payment or Cash on Delivery. COD opens WhatsApp immediately; a successful online payment opens WhatsApp after the confirmation countdown. Press Send in WhatsApp to deliver the order details.',
        bn: 'অর্ডার পেজে গিয়ে নাম ও ফোন নম্বর দিন, পণ্য ও পরিমাণ বাছুন, ডেলিভারি এলাকা ও ঠিকানা দিন, তারপর অনলাইন পেমেন্ট অথবা Cash on Delivery নির্বাচন করুন। COD হলে সরাসরি WhatsApp খুলবে; অনলাইন পেমেন্ট সফল হলে কাউন্টডাউনের পর WhatsApp খুলবে। অর্ডারের তথ্য পাঠাতে WhatsApp-এ Send চাপুন।'
      },
      link: { href: 'order.html', en: 'Open Order page', bn: 'অর্ডার পেজ খুলুন' }
    },
    {
      id: 'prices',
      phrases: ['products and prices', 'product price', 'price list', 'how much', 'পণ্য ও দাম', 'দাম কত', 'মূল্য কত', 'প্রাইস'],
      keywords: ['price', 'cost', 'products', 'দাম', 'মূল্য', 'পণ্য'],
      answer: {
        en: 'Fresh oyster mushrooms: 250 g ৳150, 500 g ৳280, and 1 kg ৳520. Dried mushrooms: 50 g ৳200. Delivery charge is added separately based on the selected area.',
        bn: 'তাজা অয়েস্টার মাশরুম: ২৫০ গ্রাম ৳১৫০, ৫০০ গ্রাম ৳২৮০ এবং ১ কেজি ৳৫২০। শুকনা মাশরুম: ৫০ গ্রাম ৳২০০। নির্বাচিত এলাকার ডেলিভারি চার্জ আলাদাভাবে যোগ হবে।'
      },
      link: { href: 'order.html', en: 'Choose products', bn: 'পণ্য বেছে নিন' }
    },
    {
      id: 'delivery-time',
      phrases: ['delivery time', 'delivary time', 'delivary taim', 'how many days', 'when will i get', 'delivery koto din', 'ডেলিভারি কত দিনে', 'কত দিন লাগবে', 'কবে পাব'],
      keywords: ['delivery', 'deliver', 'days', 'time', 'ডেলিভারি', 'দিন', 'সময়', 'পাব'],
      answer: {
        en: 'Mushroom Wonders normally delivers within 1–3 business days. Timing can vary with the destination and order conditions; contact the team on WhatsApp for an urgent or exact-date request.',
        bn: 'Mushroom Wonders সাধারণত ১–৩ কর্মদিবসের মধ্যে ডেলিভারি দেয়। গন্তব্য ও অর্ডারের পরিস্থিতি অনুযায়ী সময় বদলাতে পারে; জরুরি বা নির্দিষ্ট দিনের জন্য WhatsApp-এ যোগাযোগ করুন।'
      }
    },
    {
      id: 'delivery-fee',
      phrases: ['delivery fee', 'delivery charge', 'shipping cost', 'ঢাকার বাইরে ডেলিভারি চার্জ', 'ডেলিভারি চার্জ', 'চার্জ কত'],
      keywords: ['delivery', 'shipping', 'fee', 'charge', 'ডেলিভারি', 'চার্জ', 'খরচ'],
      answer: {
        en: 'Delivery fees are: Dhaka City ৳60; Dhaka Metro areas such as Savar, Tongi, and Narayanganj ৳100; outside Dhaka ৳130; remote areas ৳180. Your checkout total updates when you select an area.',
        bn: 'ডেলিভারি চার্জ: ঢাকা সিটি ৳৬০; সাভার, টঙ্গী ও নারায়ণগঞ্জসহ ঢাকা মেট্রো ৳১০০; ঢাকার বাইরে ৳১৩০; দূরবর্তী এলাকা ৳১৮০। এলাকা নির্বাচন করলে অর্ডারের মোট টাকা আপডেট হবে।'
      }
    },
    {
      id: 'payment',
      phrases: ['payment methods', 'how can i pay', 'online payment', 'cash on delivery', 'cod', 'পেমেন্ট কীভাবে', 'ক্যাশ অন ডেলিভারি', 'অনলাইন পেমেন্ট'],
      keywords: ['payment', 'pay', 'bkash', 'nagad', 'card', 'cod', 'পেমেন্ট', 'বিকাশ', 'নগদ', 'কার্ড'],
      answer: {
        en: 'You can choose bKash, Nagad, bank card, or Cash on Delivery at checkout. The public demo currently uses the SSLCommerz sandbox, so online payments are tests and do not charge real money. Live payments require the store owner’s live merchant credentials.',
        bn: 'চেকআউটে bKash, Nagad, ব্যাংক কার্ড অথবা Cash on Delivery বেছে নিতে পারবেন। পাবলিক ডেমোটি বর্তমানে SSLCommerz sandbox ব্যবহার করে, তাই অনলাইন পেমেন্ট পরীক্ষামূলক—আসল টাকা কাটে না। লাইভ পেমেন্টের জন্য মালিকের লাইভ মার্চেন্ট তথ্য প্রয়োজন।'
      },
      link: { href: 'order.html', en: 'Go to checkout', bn: 'চেকআউটে যান' }
    },
    {
      id: 'whatsapp',
      phrases: ['whatsapp order', 'order confirmation', 'contact number', 'talk to person', 'হোয়াটসঅ্যাপ', 'অর্ডার কনফার্ম', 'যোগাযোগ'],
      keywords: ['whatsapp', 'contact', 'person', 'support', 'যোগাযোগ', 'কনফার্ম'],
      answer: {
        en: 'After COD confirmation or successful online payment, WhatsApp opens with the completed order details. For privacy and security, a website cannot silently send a WhatsApp message—you must press Send. You can also contact the team directly here.',
        bn: 'COD নিশ্চিত করার পর অথবা অনলাইন পেমেন্ট সফল হলে সম্পূর্ণ অর্ডারের তথ্যসহ WhatsApp খুলবে। গোপনীয়তা ও নিরাপত্তার কারণে ওয়েবসাইট নিজে থেকে WhatsApp বার্তা পাঠাতে পারে না—আপনাকে Send চাপতে হবে। এখান থেকেও সরাসরি যোগাযোগ করতে পারেন।'
      },
      link: { href: WHATSAPP_URL, en: 'Open WhatsApp', bn: 'WhatsApp খুলুন', external: true }
    },
    {
      id: 'map',
      phrases: ['select location', 'map not working', 'location picker', 'full screen map', 'ম্যাপে লোকেশন', 'ম্যাপ কাজ করছে না', 'লোকেশন নির্বাচন'],
      keywords: ['map', 'location', 'address', 'pin', 'ম্যাপ', 'লোকেশন', 'ঠিকানা'],
      answer: {
        en: 'On the Order page, open the map and click or drag the pin to your delivery point. You can use current location and fullscreen view. The readable place name is copied to the address field. Browser location permission and an internet connection are required for current-location and address lookup.',
        bn: 'অর্ডার পেজে ম্যাপ খুলে ডেলিভারি স্থানে ক্লিক করুন অথবা পিন টেনে নিন। Current location ও fullscreen ব্যবহার করা যায়। জায়গার পাঠযোগ্য নাম ঠিকানার ঘরে বসবে। Current location ও ঠিকানা খোঁজার জন্য ব্রাউজারের location permission এবং ইন্টারনেট প্রয়োজন।'
      }
    },
    {
      id: 'store-fresh',
      phrases: ['how to store mushrooms', 'keep fresh', 'mushroom storage', 'fridge life', 'মাশরুম কীভাবে রাখব', 'সংরক্ষণ', 'ফ্রিজে কতদিন'],
      keywords: ['store', 'storage', 'fresh', 'fridge', 'refrigerator', 'সংরক্ষণ', 'ফ্রিজ', 'তাজা'],
      answer: {
        en: 'For best quality, keep fresh mushrooms refrigerated in breathable packaging such as a paper or perforated bag; do not wash before storing. The site’s guide recommends using them within 3–7 days. FDA guidance says mushrooms should be kept in a clean refrigerator at 4°C (40°F) or below. Discard mushrooms that are moldy, slimy, or smell suspicious.',
        bn: 'ভালো মানের জন্য তাজা মাশরুম না ধুয়ে কাগজের বা ছিদ্রযুক্ত বাতাস চলাচল করে এমন ব্যাগে ফ্রিজে রাখুন। সাইটের গাইড অনুযায়ী ৩–৭ দিনের মধ্যে ব্যবহার করুন। FDA মাশরুম পরিষ্কার ফ্রিজে ৪°C (৪০°F) বা কম তাপমাত্রায় রাখতে বলে। ছাঁচ, অতিরিক্ত পিচ্ছিলভাব বা সন্দেহজনক গন্ধ হলে ফেলে দিন।'
      },
      source: SOURCES.fdaStorage,
      link: { href: 'storage.html', en: 'Read storage guide', bn: 'সংরক্ষণ গাইড দেখুন' }
    },
    {
      id: 'dried-storage',
      phrases: ['store dried mushroom', 'dried mushroom shelf life', 'শুকনা মাশরুম রাখব', 'শুকনা কতদিন'],
      keywords: ['dried', 'dry', 'shelf', 'শুকনা', 'শুকনো'],
      answer: {
        en: 'The site’s guide recommends keeping fully dried mushrooms in an airtight glass jar in a cool, dry place for about 6–12 months. Discard them if moisture, mold, insects, or an unusual odor appears.',
        bn: 'সাইটের গাইড অনুযায়ী সম্পূর্ণ শুকনা মাশরুম বায়ুরোধী কাচের জারে ঠান্ডা ও শুকনা জায়গায় প্রায় ৬–১২ মাস রাখা যায়। আর্দ্রতা, ছাঁচ, পোকা বা অস্বাভাবিক গন্ধ দেখা দিলে ফেলে দিন।'
      },
      link: { href: 'storage.html', en: 'Read storage guide', bn: 'সংরক্ষণ গাইড দেখুন' }
    },
    {
      id: 'recipes',
      phrases: ['mushroom recipe', 'how to cook', 'what can i make', 'মাশরুম রান্না', 'রেসিপি', 'কী রান্না করব'],
      keywords: ['recipe', 'cook', 'soup', 'salad', 'রেসিপি', 'রান্না', 'স্যুপ'],
      answer: {
        en: 'The Recipes page includes mushroom soup, steamed mushroom, salad, and stir-fry ideas with ingredients and steps. Clean cultivated mushrooms before preparation and cook them according to the recipe.',
        bn: 'রেসিপি পেজে উপকরণ ও ধাপসহ মাশরুম স্যুপ, ভাপা মাশরুম, সালাদ এবং স্টার-ফ্রাই আছে। চাষ করা মাশরুম প্রস্তুতির আগে পরিষ্কার করুন এবং রেসিপি অনুযায়ী রান্না করুন।'
      },
      link: { href: 'recipes.html', en: 'See recipes', bn: 'রেসিপি দেখুন' }
    },
    {
      id: 'oyster-info',
      phrases: ['what is oyster mushroom', 'oyster mushroom nutrition', 'benefits of mushroom', 'অয়েস্টার মাশরুম কী', 'মাশরুমের উপকারিতা', 'পুষ্টিগুণ'],
      keywords: ['oyster', 'nutrition', 'benefit', 'fiber', 'অয়েস্টার', 'পুষ্টি', 'উপকার'],
      answer: {
        en: 'Oyster mushrooms are edible cultivated fungi from the Pleurotus group. They provide fiber and several micronutrients, while exact values vary by variety and growing conditions. They are nutritious food, not a treatment or cure for disease; use a clinician for personal medical advice.',
        bn: 'অয়েস্টার মাশরুম Pleurotus গোষ্ঠীর চাষযোগ্য ও খাওয়ার উপযোগী ছত্রাক। এতে আঁশ ও বিভিন্ন মাইক্রোনিউট্রিয়েন্ট থাকে; জাত ও চাষের পরিবেশে সঠিক পরিমাণ বদলায়। এটি পুষ্টিকর খাবার, কোনো রোগের চিকিৎসা বা নিরাময় নয়—ব্যক্তিগত চিকিৎসা পরামর্শের জন্য চিকিৎসকের সঙ্গে কথা বলুন।'
      },
      source: SOURCES.usdaNutrition
    },
    {
      id: 'wild-safety',
      phrases: ['is wild mushroom safe', 'identify mushroom', 'can i eat this mushroom', 'poison mushroom', 'বুনো মাশরুম খাওয়া যাবে', 'মাশরুম চিনে দিন', 'বিষাক্ত মাশরুম'],
      keywords: ['wild', 'identify', 'poison', 'safe', 'forage', 'বুনো', 'বিষাক্ত', 'চিনে', 'নিরাপদ'],
      answer: {
        en: 'Do not eat a wild mushroom based on a chatbot, photo, color, or an online description. Toxic species can closely resemble edible ones, and cooking does not reliably remove every mushroom toxin. Identification should be done by a qualified local expert. If anyone has eaten an unknown mushroom or feels ill, seek urgent medical help now.',
        bn: 'চ্যাটবট, ছবি, রং বা অনলাইন বর্ণনার ওপর ভরসা করে বুনো মাশরুম খাবেন না। বিষাক্ত প্রজাতি দেখতে খাওয়ার উপযোগী প্রজাতির মতো হতে পারে এবং রান্না সব ধরনের বিষ নষ্ট করে না। যোগ্য স্থানীয় বিশেষজ্ঞ দিয়ে শনাক্ত করান। কেউ অজানা মাশরুম খেলে বা অসুস্থ হলে এখনই জরুরি চিকিৎসা নিন।'
      },
      source: SOURCES.cdcWild,
      urgent: true
    },
    {
      id: 'mushroom-illness',
      phrases: ['sick after mushroom', 'mushroom poisoning symptoms', 'ate bad mushroom', 'মাশরুম খেয়ে অসুস্থ', 'বিষক্রিয়া', 'পেট খারাপ'],
      keywords: ['sick', 'ill', 'vomit', 'poisoning', 'emergency', 'অসুস্থ', 'বমি', 'বিষক্রিয়া', 'জরুরি'],
      answer: {
        en: 'Mushroom poisoning can be serious and symptoms may be delayed. Do not wait for this chatbot to diagnose it. Contact local emergency medical services or a poison-information service immediately, and follow their instructions. Do not induce vomiting unless a medical professional tells you to.',
        bn: 'মাশরুমের বিষক্রিয়া গুরুতর হতে পারে এবং লক্ষণ দেরিতে শুরু হতে পারে। এই চ্যাটবট দিয়ে রোগ নির্ণয়ের অপেক্ষা করবেন না। এখনই স্থানীয় জরুরি চিকিৎসাসেবা বা বিষ-তথ্যসেবায় যোগাযোগ করে তাদের নির্দেশনা মানুন। চিকিৎসক না বললে বমি করানোর চেষ্টা করবেন না।'
      },
      source: SOURCES.cdcWild,
      urgent: true
    },
    {
      id: 'cleaning',
      phrases: ['how to clean mushroom', 'wash mushrooms', 'মাশরুম ধোয়া', 'পরিষ্কার করব'],
      keywords: ['clean', 'wash', 'rinse', 'ধুতে', 'ধোয়া', 'পরিষ্কার'],
      answer: {
        en: 'Before cooking cultivated mushrooms, remove visible dirt and rinse gently under clean running water; do not use soap or produce wash. Dry them with a clean towel and prepare promptly. Wash your hands and keep produce separate from raw meat and its utensils.',
        bn: 'চাষ করা মাশরুম রান্নার আগে দৃশ্যমান ময়লা সরিয়ে পরিষ্কার প্রবাহমান পানিতে আলতো করে ধুয়ে নিন; সাবান বা produce wash ব্যবহার করবেন না। পরিষ্কার কাপড়ে শুকিয়ে দ্রুত রান্না করুন। হাত ধুয়ে নিন এবং কাঁচা মাংস ও তার বাসন থেকে আলাদা রাখুন।'
      },
      source: SOURCES.fdaStorage
    }
  ];

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[’'`]/g, '')
      .replace(/[^a-z0-9\u0980-\u09ff]+/g, ' ')
      .trim();
  }

  function tokens(value) {
    return normalize(value).split(/\s+/).filter((token) => token.length > 1);
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const saved = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = saved;
      }
    }
    return row[b.length];
  }

  function similar(a, b) {
    if (a === b) return true;
    if (a.length < 4 || b.length < 4) return false;
    return levenshtein(a, b) <= (Math.max(a.length, b.length) >= 8 ? 2 : 1);
  }

  function scoreEntry(query, entry) {
    const normalized = normalize(query);
    const queryTokens = tokens(normalized);
    let score = 0;
    entry.phrases.forEach((phrase) => {
      const p = normalize(phrase);
      if (normalized === p) score += 16;
      else if (normalized.includes(p) || p.includes(normalized)) score += 9;
      const pTokens = tokens(p);
      const matched = pTokens.filter((pt) => queryTokens.some((qt) => similar(qt, pt))).length;
      if (matched >= Math.min(2, pTokens.length)) score += matched * 2;
    });
    entry.keywords.forEach((keyword) => {
      const key = normalize(keyword);
      if (normalized.includes(key)) score += key.length > 4 ? 4 : 3;
      else if (queryTokens.some((token) => similar(token, key))) score += 2;
    });
    return score;
  }

  function findAnswer(query) {
    const normalized = normalize(query);
    if (!normalized) return null;
    const ranked = entries
      .map((entry) => ({ entry, score: scoreEntry(normalized, entry) }))
      .sort((a, b) => b.score - a.score);
    return ranked[0] && ranked[0].score >= 5 ? { ...ranked[0].entry, score: ranked[0].score } : null;
  }

  function detectLanguage(text) {
    return /[\u0980-\u09ff]/.test(text) ? 'bn' : ((document.documentElement.dataset.lang === 'bn') ? 'bn' : 'en');
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function init() {
    const oldLauncher = document.querySelector('.fab');
    if (!oldLauncher || document.querySelector('.chat-launcher')) return;

    const launcher = createElement('button', 'chat-launcher');
    launcher.type = 'button';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = '<span class="chat-launcher__icon" aria-hidden="true">🍄</span><span class="chat-launcher__pulse" aria-hidden="true"></span>';
    oldLauncher.replaceWith(launcher);

    const panel = createElement('section', 'chat-panel');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.innerHTML = [
      '<header class="chat-header">',
      '  <div class="chat-avatar" aria-hidden="true">🍄</div>',
      '  <div><h2 class="chat-title"></h2><p class="chat-status"></p></div>',
      '  <button class="chat-close" type="button" aria-label="Close">×</button>',
      '</header>',
      '<div class="chat-messages" aria-live="polite" aria-relevant="additions"></div>',
      '<div class="chat-quick" aria-label="Suggested questions"></div>',
      '<a class="chat-human" target="_blank" rel="noopener">💬 <span></span></a>',
      '<form class="chat-form">',
      '  <label class="sr-only" for="chatQuestion">Ask a question</label>',
      '  <input id="chatQuestion" class="chat-input" autocomplete="off" maxlength="240">',
      '  <button class="chat-send" type="submit"></button>',
      '</form>'
    ].join('');
    document.body.appendChild(panel);

    const title = panel.querySelector('.chat-title');
    const status = panel.querySelector('.chat-status');
    const close = panel.querySelector('.chat-close');
    const messages = panel.querySelector('.chat-messages');
    const quick = panel.querySelector('.chat-quick');
    const human = panel.querySelector('.chat-human');
    const humanText = human.querySelector('span');
    const form = panel.querySelector('.chat-form');
    const input = panel.querySelector('.chat-input');
    const send = panel.querySelector('.chat-send');
    human.href = WHATSAPP_URL;
    let welcomed = false;
    let currentLang = document.documentElement.dataset.lang === 'bn' ? 'bn' : 'en';

    function addMessage(kind, text, details) {
      const row = createElement('div', `chat-message chat-message--${kind}`);
      const bubble = createElement('div', 'chat-bubble', text);
      row.appendChild(bubble);
      if (details && details.urgent) bubble.classList.add('chat-bubble--urgent');
      if (details && details.source) {
        const source = createElement('a', 'chat-source', `↗ ${copy[currentLang].source}`);
        source.href = details.source;
        source.target = '_blank';
        source.rel = 'noopener';
        bubble.appendChild(source);
      }
      if (details && details.link) {
        const action = createElement('a', 'chat-action', details.link[currentLang]);
        action.href = details.link.href;
        if (details.link.external) { action.target = '_blank'; action.rel = 'noopener'; }
        bubble.appendChild(action);
      }
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }

    function renderQuick(items) {
      quick.replaceChildren();
      items.forEach((question) => {
        const button = createElement('button', 'chat-chip', question);
        button.type = 'button';
        button.addEventListener('click', () => ask(question));
        quick.appendChild(button);
      });
    }

    function translateUi(lang) {
      currentLang = lang;
      const t = copy[lang];
      title.textContent = t.title;
      status.textContent = t.status;
      close.setAttribute('aria-label', t.close);
      launcher.setAttribute('aria-label', t.open);
      launcher.title = t.open;
      input.placeholder = t.placeholder;
      send.textContent = t.send;
      humanText.textContent = t.whatsapp;
      renderQuick(t.quick);
    }

    function ask(question) {
      const clean = String(question || '').trim();
      if (!clean) return;
      currentLang = detectLanguage(clean);
      translateUi(currentLang);
      addMessage('user', clean);
      input.value = '';
      const match = findAnswer(clean);
      window.setTimeout(() => {
        if (match) {
          addMessage('bot', match.answer[currentLang], match);
          if (match.urgent) addMessage('bot', copy[currentLang].safety);
        } else {
          addMessage('bot', copy[currentLang].fallback);
          renderQuick(copy[currentLang].quick);
        }
      }, 180);
    }

    function openPanel() {
      panel.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      if (!welcomed) {
        addMessage('bot', copy[currentLang].welcome);
        welcomed = true;
      }
      window.setTimeout(() => input.focus(), 50);
    }

    function closePanel() {
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    }

    translateUi(currentLang);
    close.addEventListener('click', closePanel);
    form.addEventListener('submit', (event) => { event.preventDefault(); ask(input.value); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) closePanel();
    });
    document.addEventListener('mw:languagechange', (event) => {
      translateUi(event.detail && event.detail.lang === 'bn' ? 'bn' : 'en');
    });

    let pointerStart = null;
    let dragged = false;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    function savePosition() {
      try {
        localStorage.setItem('mw-chat-position', JSON.stringify({
          left: parseFloat(launcher.style.left),
          top: parseFloat(launcher.style.top)
        }));
      } catch (_) {}
    }

    function place(left, top) {
      const size = launcher.getBoundingClientRect();
      launcher.style.right = 'auto';
      launcher.style.bottom = 'auto';
      launcher.style.left = `${clamp(left, 8, window.innerWidth - size.width - 8)}px`;
      launcher.style.top = `${clamp(top, 8, window.innerHeight - size.height - 8)}px`;
    }

    try {
      const saved = JSON.parse(localStorage.getItem('mw-chat-position'));
      if (Number.isFinite(saved.left) && Number.isFinite(saved.top)) window.setTimeout(() => place(saved.left, saved.top), 0);
    } catch (_) {}

    launcher.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const rect = launcher.getBoundingClientRect();
      pointerStart = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      dragged = false;
      launcher.setPointerCapture(event.pointerId);
      launcher.classList.add('is-dragging');
    });

    launcher.addEventListener('pointermove', (event) => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      if (Math.hypot(dx, dy) > 6) dragged = true;
      if (dragged) place(pointerStart.left + dx, pointerStart.top + dy);
    });

    launcher.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      launcher.releasePointerCapture(event.pointerId);
      launcher.classList.remove('is-dragging');
      if (dragged) {
        const rect = launcher.getBoundingClientRect();
        const left = rect.left + rect.width / 2 < window.innerWidth / 2 ? 8 : window.innerWidth - rect.width - 8;
        place(left, rect.top);
        savePosition();
      } else if (panel.hidden) openPanel();
      else closePanel();
      pointerStart = null;
    });

    launcher.addEventListener('pointercancel', () => {
      pointerStart = null;
      launcher.classList.remove('is-dragging');
    });

    launcher.addEventListener('click', (event) => {
      if (event.detail !== 0) return;
      if (panel.hidden) openPanel();
      else closePanel();
    });

    window.addEventListener('resize', () => {
      if (launcher.style.left) {
        const rect = launcher.getBoundingClientRect();
        place(rect.left, rect.top);
        savePosition();
      }
    });
  }

  const api = { findAnswer, normalize, scoreEntry, entries };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root && root.document) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
}(typeof window !== 'undefined' ? window : null));
