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
      { zh: "妈 mā", py: "mā (tone 1) = mother" },
      { zh: "麻 má", py: "má (tone 2) = hemp" },
      { zh: "马 mǎ", py: "mǎ (tone 3) = horse" },
      { zh: "骂 mà", py: "mà (tone 4) = scold" },
    ],
  },
  {
    title: "zh / ch / sh vs z / c / s",
    body: "zh, ch, sh are retroflex (tongue curled back). z, c, s are flat (tongue behind teeth). This is a key distinction foreigners miss.",
    icon: IC.talk,
    ex: [
      { zh: "中国", py: "zhōngguó", id: 76 },
      { zh: "谢谢", py: "xièxie", id: 9 },
    ],
  },
  {
    title: "x / q / j sounds",
    body: "These sounds don't exist in English. x is like 'sh' but with tongue flat, q is like 'ch' but sharper, j is like 'j' but lighter. Practice with 请 (qǐng).",
    icon: IC.ear,
    ex: [
      { zh: "请", py: "qǐng", id: 23 },
      { zh: "谢谢", py: "xièxie", id: 9 },
    ],
  },
  {
    title: "Use 请 (qǐng) for politeness",
    body: "请 means 'please' and makes any request polite. Add it before verbs to be courteous.",
    icon: IC.star,
    ex: [
      { zh: "请等一下", py: "qǐng děng yīxià", id: 27 },
    ],
  },
  {
    title: "WeChat is everything",
    body: "WeChat (微信 wēixìn) is messaging, social media, and payment all in one. Download it before your trip — you'll need it for WeChat Pay.",
    icon: IC.phone,
    ex: [
      { zh: "加我微信吧", py: "jiā wǒ wēixìn ba", id: 85 },
    ],
  },
  {
    title: "Mobile payment is king",
    body: "Cash is rarely used in Chinese cities. WeChat Pay and Alipay are accepted everywhere — even street vendors.",
    icon: IC.shop,
    ex: [
      { zh: "可以用微信支付吗？", py: "kěyǐ yòng wēixìn zhīfù ma?", id: 72 },
    ],
  },
  {
    title: "Market bargaining",
    body: "At markets, start at 30-50% of asking price. Say 太贵了! then counter-offer. Stay friendly and smile.",
    icon: IC.shop,
    ex: [
      { zh: "太贵了！", py: "tài guì le!", id: 66 },
      { zh: "可以便宜一点吗？", py: "kěyǐ piányi yīdiǎn ma?", id: 67 },
    ],
  },
  {
    title: "Tea culture",
    body: "茶 (chá) is central to Chinese culture. Tea is served at every meal. Tap the table twice to say thank you when someone pours you tea.",
    icon: IC.coffee,
    ex: [
      { zh: "一杯茶", py: "yī bēi chá", id: 38 },
    ],
  },
];
