// Language-independent data: media files, contact details, structure.
// Copy lives in en.js / ar.js. Numbers, prices and testimonials there marked SAMPLE are placeholders.

const m = (name, full) => ({
  loop: `/media/${name}.mp4`,
  tile: `/media/${name}-tile.mp4`,
  poster: `/media/${name}.webp`,
  full: full ? `/media/${name}-full.mp4` : `/media/${name}.mp4`
});

export const mediaFiles = {
  zatPour: m('zat-pour'),
  zatStir: m('zat-stir'),
  zatIced: m('zat-iced'),
  zatFinal: m('zat-final'),
  mamoBite: m('mamo-bite', true),
  mamoBowl: m('mamo-bowl', true),
  santos: m('santos', true),
  alexVlog: m('alex-vlog', true),
  talk: m('talk', true),
  zatCup: { poster: '/media/zat-cup.webp' },
  zatWall: { poster: '/media/zat-wall.webp' }
};

export const brand = {
  name: 'TIME LINE',
  timezone: 'Africa/Cairo',
  email: 'hello@timeline-marketing.com',
  phone: '+20 100 000 0000',
  whatsapp: 'https://wa.me/201000000000',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/',
  linkedin: 'https://linkedin.com/'
};

// 5 columns x 3 rows; the centre tile (index 7) is the one the showreel zooms out from.
export const showreelWall = [
  'zatPour', 'mamoBite', 'santos', 'talk', 'zatStir',
  'alexVlog', 'zatIced', 'zatFinal', 'mamoBowl', 'santos',
  'talk', 'zatStir', 'mamoBowl', 'zatPour', 'alexVlog'
];

// visual settings per service / case (copy comes from the dictionaries, same order)
export const serviceLooks = [
  { no: '01', media: 'mamoBite', tone: 'light', price: 'reel' },
  { no: '02', image: 'zatWall', tone: 'sky', price: 'page' },
  { no: '03', image: 'zatCup', tone: 'light', price: 'posts5' },
  { no: '04', dashboard: true, tone: 'night', price: 'sponsor' },
  { no: '05', media: 'santos', tone: 'sky', price: 'packages', cta: '#pricing' }
];

export const caseLooks = [
  { id: 'zat', media: ['zatPour', 'zatIced'], image: 'zatCup', tone: 'light', script: true },
  { id: 'mamo', media: ['mamoBite', 'mamoBowl'], tone: 'night' },
  { id: 'santos', media: ['santos', 'alexVlog'], tone: 'sky' },
  { id: 'founder', media: ['talk', 'zatFinal'], tone: 'light' }
];

export const navTargets = ['#work', '#services', '#process', '#pricing', '#faq'];
export const chapterIds = ['top', 'manifesto', 'showreel', 'services', 'work', 'process', 'results', 'pricing', 'faq', 'contact'];
export const chapterTimes = ['00:00', '00:30', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00'];

// Real price list (EGP). Edit numbers here; package values and savings are computed from them.
export const prices = {
  reel: 700, // one reel
  page: 2000, // page management
  posts5: 500, // 5 designed posts
  pagePlus10: 2500 // page management + 10 posts
};

export const packages = [
  { id: 'start', reels: 8, posts: 10, price: 6500 },
  { id: 'growth', reels: 12, posts: 10, price: 8000, featured: true },
  { id: 'scale', reels: 20, posts: 15, price: 12000 }
];

// What the same package would cost if ordered service by service (cheapest combination).
export const aLaCarte = pkg => pkg.reels * prices.reel + prices.pagePlus10 + ((pkg.posts - 10) / 5) * prices.posts5;

export const egp = n => n.toLocaleString('en-US');

// largest saving any package gives over ordering separately
export const maxSaving = () => Math.max(...packages.map(p => aLaCarte(p) - p.price));

// SAMPLE numbers
export const statValues = [
  { to: 120, suffix: 'M+' },
  { to: 60, suffix: '+' },
  { to: 900, suffix: '+' },
  { to: 4.6, suffix: 'x', decimals: 1 }
];
