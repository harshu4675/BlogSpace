import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Category from "./models/Category.js";

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create Admin
    const adminExists = await User.findOne({
      email: process.env.ADMIN_EMAIL || "admin@blogspace.com",
    });
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: process.env.ADMIN_EMAIL || "admin@blogspace.com",
        password: "Admin@1234",
        role: "superadmin",
        username: "admin",
        isVerified: true,
      });
      console.log("✅ Admin user created: admin@blogspace.com / Admin@1234");
    }

    // Create Categories
    const categoryData = [
      {
        name: "Technology",
        icon: "💻",
        color: "#3b82f6",
        description: "Latest in tech, programming & gadgets",
        order: 1,
      },
      {
        name: "Lifestyle",
        icon: "🌟",
        color: "#ec4899",
        description: "Life hacks, wellness & daily inspiration",
        order: 2,
      },
      {
        name: "Travel",
        icon: "✈️",
        color: "#22c55e",
        description: "Destinations, tips & travel stories",
        order: 3,
      },
      {
        name: "Food",
        icon: "🍕",
        color: "#f97316",
        description: "Recipes, reviews & culinary adventures",
        order: 4,
      },
      {
        name: "Health",
        icon: "❤️",
        color: "#ef4444",
        description: "Fitness, mental health & nutrition",
        order: 5,
      },
      {
        name: "Business",
        icon: "💰",
        color: "#eab308",
        description: "Entrepreneurship, startups & finance",
        order: 6,
      },
      {
        name: "Entertainment",
        icon: "🎬",
        color: "#8b5cf6",
        description: "Movies, music, gaming & pop culture",
        order: 7,
      },
      {
        name: "Sports",
        icon: "⚽",
        color: "#06b6d4",
        description: "Sports news, analysis & highlights",
        order: 8,
      },
      {
        name: "Science",
        icon: "🔬",
        color: "#6366f1",
        description: "Discoveries, research & innovation",
        order: 9,
      },
      {
        name: "Education",
        icon: "📚",
        color: "#14b8a6",
        description: "Learning resources & study tips",
        order: 10,
      },
    ];

    for (const cat of categoryData) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      }
    }

    console.log("\n🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedDB();
