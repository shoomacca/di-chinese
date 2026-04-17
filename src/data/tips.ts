import { IC } from "./categories";

export interface Tip {
  title: string;
  body: string;
  icon: string;
  ex: { zh: string; py: string; id?: number }[];
}

export const TIPS: Tip[] = [
  {
    title: "4 Tones + Neutral",
    body: "Mandarin has 4 tones plus a neutral (light) tone. Tone 1 is high and flat, Tone 2 rises, Tone 3 dips then rises, Tone 4 falls sharply. Getting tones right is the #1 key to being understood.",
    icon: IC.music,
    ex: [
      { zh: "\u5988 m\u0101", py: "m\u0101 (tone 1) = mother" },
      { zh: "\u9EBB m\u00E1", py: "m\u00E1 (tone 2) = hemp" },
      { zh: "\u9A6C m\u01CE", py: "m\u01CE (tone 3) = horse" },
      { zh: "\u9A82 m\u00E0", py: "m\u00E0 (tone 4) = scold" },
    ],
  },
  {
    title: "zh / ch / sh vs z / c / s",
    body: "zh, ch, sh are retroflex (tongue curled back). z, c, s are flat (tongue behind teeth). This is a key distinction foreigners miss.",
    icon: IC.talk,
    ex: [
      { zh: "\u4E2D\u56FD", py: "zh\u014Dnggu\u00F3", id: 76 },
      { zh: "\u8C22\u8C22", py: "xi\u00E8xie", id: 9 },
    ],
  },
  {
    title: "x / q / j sounds",
    body: "These sounds don't exist in English. x is like 'sh' but with tongue flat, q is like 'ch' but sharper, j is like 'j' but lighter. Practice with \u8BF7 (q\u01D0ng).",
    icon: IC.ear,
    ex: [
      { zh: "\u8BF7", py: "q\u01D0ng", id: 23 },
      { zh: "\u8C22\u8C22", py: "xi\u00E8xie", id: 9 },
    ],
  },
  {
    title: "Use \u8BF7 (q\u01D0ng) for politeness",
    body: "\u8BF7 means 'please' and makes any request polite. Add it before verbs to be courteous.",
    icon: IC.star,
    ex: [
      { zh: "\u8BF7\u7B49\u4E00\u4E0B", py: "q\u01D0ng d\u011Bng y\u012Bxi\u00E0", id: 27 },
    ],
  },
  {
    title: "WeChat is everything",
    body: "WeChat (\u5FAE\u4FE1 w\u0113ix\u00ECn) is messaging, social media, and payment all in one. Download it before your trip — you'll need it for WeChat Pay.",
    icon: IC.phone,
    ex: [
      { zh: "\u52A0\u6211\u5FAE\u4FE1\u5427", py: "ji\u0101 w\u01D2 w\u0113ix\u00ECn ba", id: 85 },
    ],
  },
  {
    title: "Mobile payment is king",
    body: "Cash is rarely used in Chinese cities. WeChat Pay and Alipay are accepted everywhere — even street vendors.",
    icon: IC.shop,
    ex: [
      { zh: "\u53EF\u4EE5\u7528\u5FAE\u4FE1\u652F\u4ED8\u5417\uFF1F", py: "k\u011By\u01D0 y\u00F2ng w\u0113ix\u00ECn zh\u012Bf\u00F9 ma?", id: 72 },
    ],
  },
  {
    title: "Market bargaining",
    body: "At markets, start at 30-50% of asking price. Say \u592A\u8D35\u4E86! then counter-offer. Stay friendly and smile.",
    icon: IC.shop,
    ex: [
      { zh: "\u592A\u8D35\u4E86\uFF01", py: "t\u00E0i gu\u00EC le!", id: 66 },
      { zh: "\u53EF\u4EE5\u4FBF\u5B9C\u4E00\u70B9\u5417\uFF1F", py: "k\u011By\u01D0 pi\u00E1nyi y\u012Bdi\u01CEn ma?", id: 67 },
    ],
  },
  {
    title: "Tea culture",
    body: "\u8336 (ch\u00E1) is central to Chinese culture. Tea is served at every meal. Tap the table twice to say thank you when someone pours you tea.",
    icon: IC.coffee,
    ex: [
      { zh: "\u4E00\u676F\u8336", py: "y\u012B b\u0113i ch\u00E1", id: 38 },
    ],
  },
];
