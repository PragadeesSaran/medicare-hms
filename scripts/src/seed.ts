import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const users = [
    { username: "admin", password: "admin123", email: "admin@medicare.com", role: "admin", fullName: "Admin User" },
    { username: "doctor1", password: "doctor123", email: "doctor1@medicare.com", role: "doctor", fullName: "Dr. John Smith" },
    { username: "patient1", password: "patient123", email: "patient1@medicare.com", role: "patient", fullName: "Jane Doe" },
    { username: "receptionist1", password: "rec123", email: "receptionist1@medicare.com", role: "receptionist", fullName: "Mary Johnson" },
  ];

  for (const user of users) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, user.username));
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.insert(usersTable).values({ ...user, password: hashedPassword });
      console.log(`Created user: ${user.username}`);
    } else {
      console.log(`User already exists: ${user.username}`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
