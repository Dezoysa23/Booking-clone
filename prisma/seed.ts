import { PrismaClient } from "@prisma/client";
import { properties } from "../data/properties";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear old data first so you don't get duplicates
  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();

  for (const property of properties) {
    await prisma.property.create({
      data: {
        name: property.name,
        location: property.location,
        rating: property.rating,
        price: property.price,
        image: property.image,
        gallery: property.gallery,
        description: property.description,
        amenities: property.amenities,
        reviews: property.reviews,
      },
    });
  }

  console.log(`Seeded ${properties.length} properties.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });