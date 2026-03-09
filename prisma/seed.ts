import { PrismaClient, QrCodeType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@qrgen.local" },
    create: { email: "admin@qrgen.local", name: "Admin", password, role: Role.ADMIN },
    update: {}
  });

  const user = await prisma.user.upsert({
    where: { email: "user@qrgen.local" },
    create: { email: "user@qrgen.local", name: "User Test", password },
    update: {}
  });

  const folders = await Promise.all(["Marketing", "Événements", "Produits"].map((name) =>
    prisma.folder.create({ data: { name, userId: user.id } })
  ));

  const types = [QrCodeType.DYNAMIC_URL, QrCodeType.STATIC_URL, QrCodeType.WIFI, QrCodeType.SMS, QrCodeType.EMAIL, QrCodeType.PLAIN_TEXT, QrCodeType.VCARD_PLUS, QrCodeType.COUPON, QrCodeType.EVENT, QrCodeType.SOCIAL_MEDIA];
  const created = [];
  for (let i = 0; i < 12; i++) {
    const qr = await prisma.qrCode.create({
      data: {
        name: `QR Demo ${i + 1}`,
        type: types[i % types.length],
        isDynamic: i % 2 === 0,
        shortCode: `demo${i + 1}`,
        content: { url: `https://example.com/${i + 1}`, text: `Contenu ${i + 1}` },
        userId: user.id,
        folderId: folders[i % folders.length].id,
        foregroundColor: "#1A3C6E",
        backgroundColor: "#FFFFFF"
      }
    });
    created.push(qr);
  }

  for (let i = 0; i < 600; i++) {
    await prisma.scan.create({
      data: {
        qrCodeId: created[i % created.length].id,
        ip: `192.168.1.${i % 255}`,
        device: ["mobile", "desktop", "tablet"][i % 3],
        os: ["iOS", "Android", "Windows", "macOS"][i % 4],
        browser: ["Chrome", "Safari", "Firefox", "Edge"][i % 4],
        country: ["France", "Belgique", "Canada"][i % 3],
        city: ["Paris", "Lyon", "Montréal", "Bruxelles"][i % 4],
        scannedAt: subDays(new Date(), i % 30)
      }
    });
  }

  console.log({ admin: admin.email, user: user.email });
}

main().finally(() => prisma.$disconnect());
