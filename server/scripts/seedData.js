const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/userModel")
const Product = require("../models/product-model")
const Coupon = require("../models/couponModel")
require("dotenv").config()

const connectDB = async () => {
  try {

    
    
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/ekart"
    await mongoose.connect(mongoUri)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("Error connecting to the database:", error.message)
    process.exit(1)
  }
}

// Sample users data
const users = [
  {
    name: "Admin User",
    email: "admin@ekart.com",
    password: "admin123",
    phoneNo: 9876543210,
    role: "admin",
    isVerified: true,
    profilePic: {
      url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      publicId: "admin_profile_pic",
    },
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    phoneNo: 9876543211,
    role: "user",
    isVerified: true,
    profilePic: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      publicId: "john_profile_pic",
    },
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    phoneNo: 9876543212,
    role: "user",
    isVerified: true,
    profilePic: {
      url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      publicId: "jane_profile_pic",
    },
  },
]

// Sample products data with real images
const products = [
  {
    name: "iPhone 15 Pro Max",
    description: "The most advanced iPhone with titanium design, A17 Pro chip, and professional camera system. Features Dynamic Island, Action Button, and USB-C connectivity for the ultimate iPhone experience.",
    price: 134900,
    discountPrice: 129900,
    category: "Electronics",
    brand: "Apple",
    stock: 50,
    size: "6.7 inch",
    specification: "A17 Pro chip, 256GB storage, Pro camera system, Titanium build, Dynamic Island",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop",
      publicId: "iphone_15_pro_max_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop",
        public_id: "iphone_15_pro_max_1",
      },
      {
        url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop",
        public_id: "iphone_15_pro_max_2",
      },
    ],
    ratings: 4.8,
    totalReviews: 245,
    isActive: true,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android smartphone with S Pen and AI features. Built-in Galaxy AI for enhanced productivity and creativity with advanced camera system.",
    price: 124999,
    discountPrice: 119999,
    category: "Electronics",
    brand: "Samsung",
    stock: 30,
    size: "6.8 inch",
    specification: "Snapdragon 8 Gen 3, 512GB storage, S Pen included, 200MP camera, Galaxy AI",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop",
      publicId: "samsung_s24_ultra_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop",
        public_id: "samsung_s24_ultra_1",
      },
    ],
    ratings: 4.7,
    totalReviews: 189,
    isActive: true,
  },
  {
    name: "MacBook Air M3",
    description: "Ultra-thin laptop with M3 chip for incredible performance and all-day battery life. Perfect for students and professionals with stunning Liquid Retina display.",
    price: 114900,
    discountPrice: 109900,
    category: "Electronics",
    brand: "Apple",
    stock: 25,
    size: "13.6 inch",
    specification: "M3 chip, 8GB RAM, 256GB SSD, Liquid Retina display, 18-hour battery life",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop",
      publicId: "macbook_air_m3_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop",
        public_id: "macbook_air_m3_1",
      },
    ],
    ratings: 4.9,
    totalReviews: 156,
    isActive: true,
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling wireless headphones with exceptional sound quality and comfort for long listening sessions. Perfect for music lovers and professionals.",
    price: 29990,
    discountPrice: 24990,
    category: "Electronics",
    brand: "Sony",
    stock: 100,
    specification: "30-hour battery, Hi-Res Audio, Touch controls, Quick Attention mode, Multipoint connection",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      publicId: "sony_wh1000xm5_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop",
        public_id: "sony_wh1000xm5_1",
      },
    ],
    ratings: 4.6,
    totalReviews: 324,
    isActive: true,
  },
  {
    name: "Nike Air Jordan 1 Retro High",
    description: "Classic basketball sneakers with iconic design and premium leather construction. A timeless style statement that never goes out of fashion.",
    price: 12995,
    discountPrice: 9995,
    category: "Fashion",
    brand: "Nike",
    stock: 75,
    size: "US 8-12",
    specification: "Leather upper, Air-Sole unit, Rubber outsole, Classic colorway, High-top design",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop",
      publicId: "air_jordan_1_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
        public_id: "air_jordan_1_1",
      },
    ],
    ratings: 4.4,
    totalReviews: 567,
    isActive: true,
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Premium running shoes with responsive Boost cushioning and Primeknit upper for ultimate comfort and performance during your runs.",
    price: 16999,
    discountPrice: 13999,
    category: "Fashion",
    brand: "Adidas",
    stock: 60,
    size: "US 7-13",
    specification: "Boost midsole, Primeknit upper, Continental rubber outsole, Energy return technology",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
      publicId: "adidas_ultraboost_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop",
        public_id: "adidas_ultraboost_1",
      },
    ],
    ratings: 4.5,
    totalReviews: 423,
    isActive: true,
  },
  {
    name: "Levi's 501 Original Jeans",
    description: "Classic straight-fit jeans with authentic vintage appeal. The original blue jean since 1873, crafted with quality denim for lasting durability.",
    price: 4999,
    discountPrice: 3999,
    category: "Fashion",
    brand: "Levi's",
    stock: 120,
    size: "28-38 waist",
    specification: "100% cotton denim, Button fly, Classic 5-pocket styling, Straight fit, Vintage wash",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop",
      publicId: "levis_501_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
        public_id: "levis_501_1",
      },
    ],
    ratings: 4.3,
    totalReviews: 789,
    isActive: true,
  },
  {
    name: "The North Face Resolve Jacket",
    description: "Waterproof outdoor jacket for all weather conditions. Features DryVent technology for reliable protection during outdoor adventures.",
    price: 8999,
    discountPrice: 7499,
    category: "Fashion",
    brand: "The North Face",
    stock: 40,
    size: "S-XXL",
    specification: "DryVent technology, Adjustable hood, Multiple pockets, Packable design, Wind resistant",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
      publicId: "north_face_resolve_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
        public_id: "north_face_resolve_1",
      },
    ],
    ratings: 4.6,
    totalReviews: 234,
    isActive: true,
  },
  {
    name: "Instant Pot Duo 7-in-1",
    description: "Multi-functional electric pressure cooker that replaces 7 kitchen appliances. Perfect for quick and healthy meals with smart cooking programs.",
    price: 7999,
    discountPrice: 6499,
    category: "Home & Kitchen",
    brand: "Instant Pot",
    stock: 80,
    size: "6 Quart",
    specification: "7 appliances in 1, 13 smart programs, Stainless steel, Safety features, App control",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop",
      publicId: "instant_pot_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1585515656973-a0b8b2a4e4c7?w=500&h=500&fit=crop",
        public_id: "instant_pot_1",
      },
    ],
    ratings: 4.5,
    totalReviews: 1234,
    isActive: true,
  },
  {
    name: "Dyson V15 Detect Cordless Vacuum",
    description: "Advanced cordless vacuum with laser dust detection and powerful suction. Reveals microscopic dust for thorough cleaning of your home.",
    price: 54900,
    discountPrice: 49900,
    category: "Home & Kitchen",
    brand: "Dyson",
    stock: 20,
    specification: "60 minutes runtime, LCD screen, 5 cleaning modes, Laser dust detection, HEPA filtration",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
      publicId: "dyson_v15_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
        public_id: "dyson_v15_1",
      },
    ],
    ratings: 4.7,
    totalReviews: 234,
    isActive: true,
  },
  {
    name: "KitchenAid Artisan Stand Mixer",
    description: "Professional-grade stand mixer for baking enthusiasts. Iconic design with powerful motor and versatile attachments for all your baking needs.",
    price: 32999,
    discountPrice: 28999,
    category: "Home & Kitchen",
    brand: "KitchenAid",
    stock: 15,
    size: "5 Quart",
    specification: "10 speeds, Tilt-head design, Multiple attachments, Durable construction, 325W motor",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop",
      publicId: "kitchenaid_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop",
        public_id: "kitchenaid_1",
      },
    ],
    ratings: 4.9,
    totalReviews: 445,
    isActive: true,
  },
  {
    name: "Nespresso Vertuo Next Coffee Machine",
    description: "Premium coffee machine with one-touch brewing system. Delivers barista-quality coffee with rich crema using Centrifusion technology.",
    price: 14999,
    discountPrice: 12999,
    category: "Home & Kitchen",
    brand: "Nespresso",
    stock: 35,
    specification: "5 cup sizes, Bluetooth connectivity, Auto shut-off, Centrifusion technology, Capsule system",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop",
      publicId: "nespresso_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop",
        public_id: "nespresso_1",
      },
    ],
    ratings: 4.5,
    totalReviews: 345,
    isActive: true,
  },
  {
    name: "Fitbit Charge 5 Advanced Fitness Tracker",
    description: "Advanced fitness tracker with built-in GPS, stress management tools, and comprehensive health monitoring for active lifestyles.",
    price: 19999,
    discountPrice: 16999,
    category: "Health & Fitness",
    brand: "Fitbit",
    stock: 90,
    specification: "7-day battery, Heart rate monitoring, Sleep tracking, Built-in GPS, ECG app, Stress management",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop",
      publicId: "fitbit_charge5_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop",
        public_id: "fitbit_charge5_1",
      },
    ],
    ratings: 4.4,
    totalReviews: 678,
    isActive: true,
  },
  {
    name: "Manduka PRO Yoga Mat",
    description: "Professional-grade yoga mat with superior grip and cushioning. Lifetime guarantee for serious practitioners with eco-friendly materials.",
    price: 2999,
    discountPrice: 2499,
    category: "Health & Fitness",
    brand: "Manduka",
    stock: 150,
    size: "68 x 24 inches",
    specification: "6mm thickness, Eco-friendly material, Lifetime guarantee, Non-slip surface, Closed-cell surface",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop",
      publicId: "manduka_yoga_mat_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop",
        public_id: "manduka_yoga_mat_1",
      },
    ],
    ratings: 4.3,
    totalReviews: 456,
    isActive: true,
  },
  {
    name: "Optimum Nutrition Gold Standard Whey",
    description: "Premium whey protein powder for muscle building and recovery. Trusted by athletes worldwide for quality and taste with fast absorption.",
    price: 3499,
    discountPrice: 2999,
    category: "Health & Fitness",
    brand: "Optimum Nutrition",
    stock: 200,
    size: "2 lbs",
    specification: "24g protein per serving, Multiple flavors, Fast absorption, BCAA enriched, Gluten-free",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=500&fit=crop",
      publicId: "optimum_whey_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=500&fit=crop",
        public_id: "optimum_whey_1",
      },
    ],
    ratings: 4.6,
    totalReviews: 789,
    isActive: true,
  },
  {
    name: "TRX ALL-IN-ONE Suspension Trainer",
    description: "Complete resistance training system for full-body workouts anywhere. Used by military and professional athletes for functional fitness.",
    price: 1999,
    discountPrice: 1499,
    category: "Health & Fitness",
    brand: "TRX",
    stock: 100,
    specification: "5 resistance levels, Door anchor included, Exercise guide, Portable design, Military-grade materials",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
      publicId: "trx_suspension_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
        public_id: "trx_suspension_1",
      },
    ],
    ratings: 4.4,
    totalReviews: 234,
    isActive: true,
  },
  {
    name: "Secretlab TITAN Evo Gaming Chair",
    description: "Premium ergonomic gaming chair with lumbar support and premium materials. Designed for extended gaming sessions with maximum comfort.",
    price: 24999,
    discountPrice: 19999,
    category: "Furniture",
    brand: "Secretlab",
    stock: 25,
    specification: "NEO Hybrid Leatherette, 4D armrests, Tilt mechanism, Weight capacity 130kg, Lumbar support",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
      publicId: "secretlab_titan_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
        public_id: "secretlab_titan_1",
      },
    ],
    ratings: 4.4,
    totalReviews: 234,
    isActive: true,
  },
  {
    name: "UPLIFT V2 Standing Desk",
    description: "Premium height-adjustable standing desk for healthy work habits. Smooth electric adjustment with memory presets and cable management.",
    price: 34999,
    discountPrice: 29999,
    category: "Furniture",
    brand: "UPLIFT",
    stock: 15,
    size: "48 x 30 inches",
    specification: "Electric height adjustment, Memory presets, Cable management, 15-year warranty, Bamboo top",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop",
      publicId: "uplift_desk_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop",
        public_id: "uplift_desk_1",
      },
    ],
    ratings: 4.7,
    totalReviews: 123,
    isActive: true,
  },
  {
    name: "IKEA HEMNES Bookshelf",
    description: "Classic 5-tier wooden bookshelf with timeless design. Perfect for organizing books and displaying decorative items in any room.",
    price: 12999,
    discountPrice: 9999,
    category: "Furniture",
    brand: "IKEA",
    stock: 30,
    size: "70 x 35 x 175 cm",
    specification: "Solid wood construction, 5 adjustable shelves, Easy assembly, Classic design, White stain finish",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
      publicId: "ikea_hemnes_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
        public_id: "ikea_hemnes_1",
      },
    ],
    ratings: 4.2,
    totalReviews: 567,
    isActive: true,
  },
  {
    name: "Herman Miller Aeron Office Chair",
    description: "Iconic ergonomic office chair with breathable mesh design. Engineered for comfort and productivity during long work hours with PostureFit support.",
    price: 18999,
    discountPrice: 14999,
    category: "Furniture",
    brand: "Herman Miller",
    stock: 40,
    specification: "Pellicle mesh, PostureFit SL, Adjustable height, 12-year warranty, Tilt mechanism",
    primaryImg: {
      url: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=500&fit=crop",
      publicId: "herman_miller_primary",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=500&fit=crop",
        public_id: "herman_miller_1",
      },
    ],
    ratings: 4.8,
    totalReviews: 345,
    isActive: true,
  },
]

// Create users
const createUsers = async () => {
  try {
    console.log("Creating users...")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@ekart.com" })
    if (existingAdmin) {
      console.log("Admin user already exists")
      return existingAdmin
    }

    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      })),
    )

    const createdUsers = await User.insertMany(hashedUsers)
    console.log(`✅ Created ${createdUsers.length} users`)
    return createdUsers[0] // Return admin user
  } catch (error) {
    console.error("Error creating users:", error)
    throw error
  }
}

// Create products
const createProducts = async () => {
  try {
    console.log("Creating products...")

    // Clear existing products
    await Product.deleteMany({})

    const createdProducts = await Product.insertMany(products)
    console.log(`✅ Created ${createdProducts.length} products`)
    return createdProducts
  } catch (error) {
    console.error("Error creating products:", error)
    throw error
  }
}

// Create coupons
const createCoupons = async (adminUser) => {
  try {
    console.log("Creating coupons...")

    // Clear existing coupons
    await Coupon.deleteMany({})

    const sampleCoupons = [
      {
        code: "WELCOME10",
        description: "Welcome discount for new users",
        discountType: "percentage",
        discountValue: 10,
        minimumAmount: 1000,
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdBy: adminUser._id,
      },
      {
        code: "SAVE500",
        description: "Flat ₹500 off on orders above ₹5000",
        discountType: "fixed",
        discountValue: 500,
        minimumAmount: 5000,
        usageLimit: 50,
        usedCount: 0,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        createdBy: adminUser._id,
      },
      {
        code: "ELECTRONICS20",
        description: "20% off on electronics category",
        discountType: "percentage",
        discountValue: 20,
        minimumAmount: 2000,
        applicableCategory: "Electronics",
        usageLimit: 75,
        usedCount: 0,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdBy: adminUser._id,
      },
    ]

    const createdCoupons = await Coupon.insertMany(sampleCoupons)
    console.log(`✅ Created ${createdCoupons.length} coupons`)
    return createdCoupons
  } catch (error) {
    console.error("Error creating coupons:", error)
    throw error
  }
}

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB()
    console.log("🌱 Starting database seeding...")

    const adminUser = await createUsers()
    await createProducts()
    await createCoupons(adminUser)

    console.log("🎉 Database seeding completed successfully!")
    console.log("👤 Admin Login: admin@ekart.com / admin123")
    console.log("👤 User Login: john@example.com / password123")
    process.exit(0)
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    process.exit(1)
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
