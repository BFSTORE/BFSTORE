import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const games = [
  {
    name: "Mobile Legends",
    slug: "mobile-legends",
    publisher: "Moonton",
    digiBrand: "MOBILE LEGENDS",
    image: "/games/mobile-legends.svg",
    fieldLabel: "User ID",
    fieldLabel2: "Zone ID",
    isPopular: true,
    instructions:
      "Masukkan User ID dan Zone ID kamu. Contoh: 12345678 (1234). Temukan di menu profil dalam game.",
    products: [
      ["86 Diamonds", 21500],
      ["172 Diamonds", 42500],
      ["257 Diamonds", 63000],
      ["344 Diamonds", 84500],
      ["429 Diamonds", 105000],
      ["514 Diamonds", 126000],
      ["706 Diamonds", 168500],
      ["1050 Diamonds", 250000],
      ["2195 Diamonds", 505000],
      ["Twilight Pass", 145000],
      ["Weekly Diamond Pass", 28500],
    ],
  },
  {
    name: "Free Fire",
    slug: "free-fire",
    publisher: "Garena",
    digiBrand: "FREE FIRE",
    image: "/games/free-fire.svg",
    isPopular: true,
    instructions: "Masukkan User ID Free Fire kamu. Cek di menu profil pojok kiri atas.",
    products: [
      ["70 Diamonds", 10500],
      ["140 Diamonds", 20500],
      ["355 Diamonds", 49500],
      ["720 Diamonds", 99000],
      ["1450 Diamonds", 197000],
      ["2180 Diamonds", 295000],
      ["Membership Mingguan", 29500],
      ["Membership Bulanan", 89500],
    ],
  },
  {
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    publisher: "Tencent Games",
    digiBrand: "PUBG MOBILE",
    image: "/games/pubg-mobile.svg",
    isPopular: true,
    instructions: "Masukkan Character ID PUBG Mobile kamu (angka di bawah nama profil).",
    products: [
      ["60 UC", 14500],
      ["325 UC", 72500],
      ["660 UC", 145000],
      ["1800 UC", 362000],
      ["3850 UC", 725000],
      ["8100 UC", 1450000],
    ],
  },
  {
    name: "Genshin Impact",
    slug: "genshin-impact",
    publisher: "HoYoverse",
    digiBrand: "GENSHIN IMPACT",
    image: "/games/genshin-impact.svg",
    fieldLabel: "UID",
    fieldLabel2: "Server",
    isPopular: true,
    instructions: "Masukkan UID dan pilih server (Asia/America/Europe/TW-HK-MO).",
    products: [
      ["60 Genesis Crystals", 15500],
      ["330 Genesis Crystals", 75500],
      ["1090 Genesis Crystals", 235000],
      ["2240 Genesis Crystals", 465000],
      ["3880 Genesis Crystals", 749000],
      ["Blessing of the Welkin Moon", 75000],
    ],
  },
  {
    name: "Honkai: Star Rail",
    slug: "honkai-star-rail",
    publisher: "HoYoverse",
    digiBrand: "HONKAI STAR RAIL",
    image: "/games/honkai-star-rail.svg",
    fieldLabel: "UID",
    fieldLabel2: "Server",
    instructions: "Masukkan UID dan pilih server kamu.",
    products: [
      ["60 Oneiric Shards", 15500],
      ["330 Oneiric Shards", 75500],
      ["1090 Oneiric Shards", 235000],
      ["2240 Oneiric Shards", 465000],
      ["Express Supply Pass", 75000],
    ],
  },
  {
    name: "Valorant",
    slug: "valorant",
    publisher: "Riot Games",
    digiBrand: "VALORANT",
    image: "/games/valorant.svg",
    fieldLabel: "Riot ID",
    isPopular: true,
    instructions: "Masukkan Riot ID lengkap dengan tagline. Contoh: BFStore#1234.",
    products: [
      ["475 Points", 55000],
      ["1000 Points", 109000],
      ["2050 Points", 215000],
      ["3650 Points", 375000],
      ["5350 Points", 545000],
    ],
  },
  {
    name: "Roblox",
    slug: "roblox",
    publisher: "Roblox Corporation",
    digiBrand: "ROBLOX",
    image: "/games/roblox.svg",
    fieldLabel: "Username",
    instructions: "Masukkan username Roblox kamu (bukan display name).",
    products: [
      ["80 Robux", 15500],
      ["400 Robux", 72500],
      ["800 Robux", 142000],
      ["1700 Robux", 285000],
      ["4500 Robux", 715000],
    ],
  },
  {
    name: "Call of Duty Mobile",
    slug: "cod-mobile",
    publisher: "Activision",
    digiBrand: "CALL OF DUTY MOBILE",
    image: "/games/cod-mobile.svg",
    fieldLabel: "Open ID",
    instructions: "Masukkan Open ID CODM kamu. Cek di pengaturan akun dalam game.",
    products: [
      ["53 CP", 12500],
      ["106 CP", 24500],
      ["264 CP", 59500],
      ["530 CP", 118000],
      ["1080 CP", 235000],
      ["2400 CP", 475000],
    ],
  },
];

async function main() {
  const adminPass = await bcrypt.hash("admin123", 10);
  const custPass = await bcrypt.hash("customer123", 10);

  await db.user.upsert({
    where: { email: "admin@bfstore.id" },
    update: {},
    create: { name: "Admin BFSTORE", email: "admin@bfstore.id", password: adminPass, role: "ADMIN" },
  });
  await db.user.upsert({
    where: { email: "demo@bfstore.id" },
    update: {},
    create: { name: "Demo Customer", email: "demo@bfstore.id", password: custPass, role: "CUSTOMER" },
  });

  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    const game = await db.game.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        name: g.name,
        slug: g.slug,
        publisher: g.publisher,
        digiBrand: g.digiBrand,
        image: g.image,
        fieldLabel: g.fieldLabel ?? "User ID",
        fieldLabel2: g.fieldLabel2 ?? "",
        instructions: g.instructions ?? "",
        isPopular: g.isPopular ?? false,
        sortOrder: i,
      },
    });
    const count = await db.product.count({ where: { gameId: game.id } });
    if (count === 0) {
      await db.product.createMany({
        data: g.products.map(([name, price], j) => ({
          gameId: game.id,
          name: name as string,
          price: price as number,
          basePrice: Math.round((price as number) * 0.95),
          sortOrder: j,
        })),
      });
    }
  }

  const banners = [
    {
      title: "Top Up Instan 24 Jam",
      subtitle: "Proses otomatis, diamond masuk dalam hitungan detik",
      image: "/banners/banner-1.svg",
      sortOrder: 0,
    },
    {
      title: "Promo BFSTORE10",
      subtitle: "Diskon 10% untuk semua game, s.d. Rp10.000",
      image: "/banners/banner-2.svg",
      sortOrder: 1,
    },
    {
      title: "Harga Termurah Se-Indonesia",
      subtitle: "Jaminan harga terbaik langsung dari distributor resmi",
      image: "/banners/banner-3.svg",
      sortOrder: 2,
    },
  ];
  if ((await db.banner.count()) === 0) {
    await db.banner.createMany({ data: banners });
  }

  await db.promoCode.upsert({
    where: { code: "BFSTORE10" },
    update: {},
    create: { code: "BFSTORE10", type: "PERCENT", value: 10, maxDiscount: 10000, minPurchase: 20000 },
  });
  await db.promoCode.upsert({
    where: { code: "HEMAT5K" },
    update: {},
    create: { code: "HEMAT5K", type: "FIXED", value: 5000, minPurchase: 50000, usageLimit: 100 },
  });

  const defaults: Record<string, string> = {
    storeName: "BFSTORE",
    storeTagline: "Top up game favoritmu, cepat & terpercaya",
    whatsapp: "6281234567890",
    markupPercent: "5",
    digiflazzUsername: "",
    digiflazzApiKey: "",
    digiflazzMode: "dev",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log("Seed selesai ✔");
}

main().finally(() => db.$disconnect());
