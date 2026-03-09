import { PrismaClient, QrCodeType } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "owner@qrgen.local" },
    create: { email: "owner@qrgen.local", name: "Owner" },
    update: {},
  });

  const qrs = [];
  const urls = [
    "https://monportfolio.dev",
    "https://monportfolio.dev/projets",
    "https://monportfolio.dev/contact",
    "https://linkedin.com/in/monprofil",
    "https://github.com/monprofil",
  ];
  for (let i = 0; i < urls.length; i++) {
    const qr = await prisma.qrCode.create({
      data: {
        name: `Flyer ${i + 1}`,
        type: QrCodeType.DYNAMIC_URL,
        isDynamic: true,
        shortCode: `flyer${i + 1}`,
        content: { url: urls[i] },
        userId: owner.id,
      },
    });
    qrs.push(qr);
  }

  const devices = ["mobile", "desktop", "tablet"];
  const oses = ["iOS", "Android", "Windows", "macOS"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
  for (let i = 0; i < 200; i++) {
    await prisma.scan.create({
      data: {
        qrCodeId: qrs[i % qrs.length].id,
        ip: `192.168.1.${i % 255}`,
        device: devices[i % 3],
        os: oses[i % 4],
        browser: browsers[i % 4],
        scannedAt: subDays(new Date(), i % 30),
      },
    });
  }

  console.log(`Seeded: ${owner.email}, ${qrs.length} QR codes, 200 scans`);
}

main().finally(() => prisma.$disconnect());
