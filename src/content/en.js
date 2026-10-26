// English copy. SAMPLE = placeholder numbers/quotes/prices to replace before launch.
const en = {
  lang: 'en',
  dir: 'ltr',
  city: 'Alexandria',
  ui: {
    bookCall: 'Book a call',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLang: 'عربي',
    switchLangLabel: 'اقرأ الموقع بالعربي',
    play: 'Play',
    drag: 'Drag',
    nowPlaying: 'Now playing',
    modalNote: 'Produced by TIME LINE. Press Esc or click outside to close.',
    closeVideo: 'Close video',
    loading: 'Loading your timeline',
    scrollCue: 'Scroll to start the clock',
    watchReel: 'Watch the reel',
    service: 'Service',
    motionOn: 'Motion on',
    motionOff: 'Motion off',
    motionNotice: 'Your device asks for reduced motion. This site is built around movement — keep it, or switch it off?',
    motionKeep: 'Keep motion',
    motionTurnOff: 'Turn it off',
    playShowreel: 'Play showreel'
  },
  nav: ['Work', 'Services', 'Process', 'Pricing', 'FAQ'],
  chapters: ['The beginning', 'Why we exist', 'Showreel', 'What we do', 'Selected work', 'The timeline', 'Results', 'Packages', 'Questions', 'Your next chapter'],
  mediaTitles: {
    zatPour: 'zat — The pour',
    zatStir: 'zat — Slow stir',
    zatIced: 'zat — Iced latte',
    zatFinal: 'zat — Hero cut',
    mamoBite: 'Mamo Fried Chicken — Crunch test',
    mamoBowl: 'Mamo Fried Chicken — Bowl challenge',
    santos: 'Santos — Service as content',
    alexVlog: 'Alexandria spots — City guide',
    talk: 'Founder-led content — Strategy talk',
    zatCup: 'zat — Same place, better mood',
    zatWall: 'zat — Interior'
  },
  hero: {
    badge: 'Now booking — 2 spots left this month',
    lines: ['Make every', 'second of your'],
    accent: 'brand count.',
    rotating: ['remembered', 'shared', 'craved', 'sold out', 'talked about'],
    sub: 'TIME LINE is a content-first marketing agency. We make reels, run pages, design posts and launch sponsored ads — so your brand stops the scroll.',
    focusLabel: 'Built to be',
    primary: 'Book a free strategy call',
    secondary: 'Watch the showreel',
    proof: 'Trusted by cafés, restaurants & lifestyle brands across Egypt',
    card: { label: 'zat café · reach', note: 'Organic reach, first 60 days' },
    reel: 'Showreel ’26'
  },
  manifesto: {
    text: 'Attention is the most expensive currency on earth. Your audience gives you three seconds. We make sure they give you the next thirty — and then come back for more.',
    stats: [
      ['3 sec', 'to earn the stop'],
      ['30 sec', 'to earn the follow'],
      ['3 visits', 'to earn a regular']
    ]
  },
  showreel: {
    title: ['Content that', 'stops the scroll.'],
    wallLabel: 'The wall',
    caption: 'Every frame below was planned, shot and edited in-house. Tap any reel to watch it with sound.',
    stats: [
      { value: '900+', label: 'reels & posts shipped' },
      { value: '120M', label: 'organic views generated' }
    ]
  },
  services: {
    title: 'Everything your brand needs to',
    accent: 'own the feed.',
    sub: 'One team for strategy, production and paid. No hand-offs, no lost-in-translation.',
    items: [
      { title: 'Reel Production', text: 'Reels people watch to the end — idea, hook, script, shoot and edit, all in-house.', tags: ['Scripts', 'Filming', 'Editing', 'UGC', 'Food reviews'] },
      { title: 'Page Management', text: 'Calendars, captions, replies and community — a feed that finally feels like a brand.', tags: ['Content calendar', 'Captions', 'Community', 'Performance reports'] },
      { title: 'Post Design', text: 'Posts and stories in your brand identity that complete the reels and keep the feed consistent.', tags: ['Posts', 'Stories', 'Offers', 'Menus'] },
      { title: 'Sponsored Ads', text: 'Meta & TikTok ads on creative that sells — budget and targeting set with you around your goal.', tags: ['Meta', 'TikTok', 'Targeting', 'Retargeting'] },
      { title: 'Packages', text: save => `Reels + page management + posts in one package — up to ${save} EGP less than ordering separately.`, tags: ['8 reels', '12 reels', '20 reels'], cta: 'See packages' }
    ],
    priceTags: {
      reel: n => `${n} EGP / reel`,
      page: n => `${n} EGP`,
      posts5: n => `5 posts · ${n} EGP`,
      sponsor: 'Price on request',
      packages: n => `From ${n} EGP`
    },
    dashboard: { label: 'ROAS · last 8 weeks', ctr: 'CTR', cpa: 'CPA', hooks: 'Hooks' },
    endTitle: 'Not sure what you need?',
    endText: 'Tell us about your brand and goal — we’ll pick the right package or service.',
    endLink: 'Talk to us →'
  },
  cases: {
    title: 'Stories we',
    accent: 'timed perfectly.',
    sub: 'Real brands, real footage. Every reel on this page was scripted, shot and edited by the TIME LINE team.',
    // SAMPLE results
    items: [
      {
        client: 'zat',
        type: 'Specialty café · Content & photography',
        headline: 'Same place, better mood.',
        text: 'We turned a neighbourhood café into a mood people want to be part of — cinematic product reels, warm editorial photography and a feed that smells like coffee.',
        results: [['3.2x', 'reach in 60 days'], ['+41%', 'weekend visits'], ['18', 'reels shipped']]
      },
      {
        client: 'Mamo Fried Chicken',
        type: 'QSR · UGC & food reviews',
        headline: 'The crunch heard across Alexandria.',
        text: 'A food-review and challenge series built on real reactions. Unscripted bites, loud crunches and a format people started copying.',
        results: [['2.4M', 'organic views'], ['+63%', 'delivery orders'], ['9.1%', 'avg. engagement']]
      },
      {
        client: 'Santos',
        type: 'Café & restaurant · Experience content',
        headline: 'Service as content.',
        text: 'Skits filmed on location that show the experience, not just the plate — the server, the surprise, the second visit.',
        results: [['780K', 'views per month'], ['+29%', 'table bookings'], ['4.9★', 'new reviews']]
      },
      {
        client: 'Founder series',
        type: 'Personal brand · Talking-head strategy',
        headline: 'Talk like the leader you are.',
        text: 'Weekly founder-led videos that turn expertise into trust — scripted hooks, studio setup, subtitles and a clear call to action.',
        results: [['+12K', 'followers in 90 days'], ['41', 'inbound leads'], ['62%', 'avg. watch time']]
      }
    ]
  },
  process: {
    title: 'From first call to',
    accent: 'a feed full',
    tail: 'of content that sells.',
    steps: [
      { when: 'Step 01', title: 'Meet', text: 'A short call to understand your brand, audience and goal — then we pick the right package or service together.', points: ['Intro call', 'Brand deep-dive', 'Pick a package'] },
      { when: 'Step 02', title: 'Plan', text: 'Ideas, scripts and hooks for the reels plus a post plan — every piece has a job before it is shot.', points: ['Ideas & scripts', 'Hook bank', 'Post plan'] },
      { when: 'Step 03', title: 'Produce', text: 'Filming on location, editing and post design in your brand identity.', points: ['Filming', 'Editing', 'Design'] },
      { when: 'Step 04', title: 'Publish & manage', text: 'Publishing, page management and community replies — the moment the clock really starts.', points: ['Publishing', 'Page management', 'Community'] },
      { when: 'Step 05', title: 'Scale', text: 'Sponsored ads on the content that proved itself, plus a performance report on what worked.', points: ['Sponsored ads', 'Performance report', 'Next step'] }
    ]
  },
  results: {
    title: 'Numbers that make',
    accent: 'the clock worth it.',
    statLabels: ['organic views generated', 'brands on the timeline', 'pieces of content shipped', 'average return on ad spend'],
    marquee: ['Reels', 'Page management', 'Posts', 'Sponsored ads', 'UGC', 'Filming'],
    marquee2: 'TIME LINE  ✦  MARKETING  ✦  ALEXANDRIA  ✦',
    testimonialsLabel: 'Kind words',
    // SAMPLE testimonials
    testimonials: [
      { quote: 'They don’t post for us — they think for us. Our reels finally sound like us.', name: 'Café owner', role: 'Specialty coffee, Alexandria' },
      { quote: 'One video did more than three months of ads. The team just gets food.', name: 'Marketing lead', role: 'Fried chicken chain' },
      { quote: 'Fast, organised and honestly fun to shoot with. Every month gets better.', name: 'Founder', role: 'Lifestyle brand' }
    ],
    clientsLabel: 'Brands on the timeline',
    clients: ['zat', 'Mamo Fried Chicken', 'Santos', 'Your brand next']
  },
  pricing: {
    title: 'Clear packages,',
    accent: 'every second covered.',
    sub: 'No surprises, no hidden fees. Pick the package that fits your brand — or order a single service on its own.',
    currency: 'EGP',
    featured: 'Our pick',
    names: { start: 'Starter', growth: 'Growth', scale: 'Scale' },
    notes: {
      start: 'For a brand starting to build its presence.',
      growth: 'The best balance of volume and polish.',
      scale: 'For brands ready to own their city.'
    },
    reels: n => `${n} reels`,
    posts: n => `${n} designed posts`,
    page: 'Full page management',
    insteadBefore: 'instead of',
    insteadAfter: 'separately',
    save: n => `Save ${n} EGP`,
    choose: 'Choose package',
    singlesTitle: 'Single services',
    singlesSub: 'Need just one thing? Order it on its own.',
    singles: { reel: 'One reel', page: 'Page management', posts5: '5 posts', pagePlus10: 'Page management + 10 posts' },
    perReel: '/reel',
    sponsorChip: 'Paid ads',
    sponsorTitle: 'Sponsored',
    sponsorAccent: 'built around your campaign.',
    sponsorText: 'Meta & TikTok campaigns — budget and targeting set with you around your goal. Priced after a short call.',
    sponsorPrice: 'Price on request',
    whatsapp: 'WhatsApp us',
    pickTime: 'Book a call'
  },
  faq: {
    title: 'Good',
    accent: 'questions.',
    sub: 'Can’t find what you’re looking for? Our team answers in minutes on WhatsApp.',
    cta: 'Ask us anything',
    items: [
      { q: 'How fast can we start?', a: 'As soon as we agree on a package: an intro call, a content plan, then the shoot days.' },
      { q: 'What’s the difference between a package and single services?', a: save => `A package bundles reels, page management and posts for less than ordering them separately — up to ${save} EGP less. Single services are for when you need just one thing.` },
      { q: 'Do you only work with food & beverage brands?', a: 'F&B is where we are strongest, but our process works for any brand that sells an experience — retail, beauty, real estate, fitness and personal brands.' },
      { q: 'Who owns the content?', a: 'You do. Every reel and post we make for you is yours to keep and use however you like.' },
      { q: 'Can we change our package?', a: 'Of course. Move up or down a package as you need, or add a single service — like an extra reel — anytime.' },
      { q: 'Do you run sponsored ads?', a: 'Yes. We set up the campaign, targeting and creative with you; pricing depends on your goal and budget — message us for a quote.' }
    ]
  },
  contact: {
    loop: 'TIME LINE ✦ MARKETING ✦ MAKE EVERY SECOND COUNT ✦ ',
    title: 'Your next chapter',
    accent: 'starts now.',
    sub: 'Tell us about your brand. We reply within one working day and suggest the right package.',
    email: 'Email',
    whatsapp: 'WhatsApp',
    studioTime: 'Studio time',
    formTitle: 'Start a project',
    name: 'Your name',
    namePh: 'Mohamed',
    brand: 'Brand',
    brandPh: 'Your café, shop or brand',
    reach: 'Phone or email',
    reachPh: 'So we can reach you',
    need: 'What do you need?',
    budget: 'Budget',
    pkgLabel: 'Selected package',
    pkgRemove: 'Remove package',
    services: ['Reels', 'Page management', 'Post design', 'Sponsored ads', 'Full package'],
    budgets: ['< 5K EGP', '5–8K EGP', '8–12K EGP', '12K+ EGP'],
    send: 'Send via WhatsApp',
    reply: 'Replies in under 24h',
    msg: {
      hello: (name, company) => `Hi TIME LINE 👋 I'm ${name} from ${company}.`,
      pkg: p => `Interested in the ${p} package.`,
      interested: list => `Interested in: ${list}.`,
      budget: b => `Budget: ${b}.`,
      reach: c => `Reach me at: ${c}`
    },
    sitemap: 'Sitemap',
    social: 'Social',
    studio: 'Studio',
    address: 'Alexandria, Egypt',
    hours: 'Sun – Thu · 10:00 – 19:00',
    backTo: 'Back to',
    beginning: 'The beginning',
    rights: 'TIME LINE Marketing. All rights reserved.',
    made: 'Made with time in Alexandria.'
  }
};

export default en;
