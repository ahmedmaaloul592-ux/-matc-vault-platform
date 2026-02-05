const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    phone: String,
    country: String,
    isActive: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    enrolledLearners: { type: Number, default: 0 },
    plusPoints: { type: Number, default: 0 },
    expiryDate: Date,
    plainPassword: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkAndSeedUsers() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully!\n');

        // Check existing users
        const users = await User.find({}).select('name email role isActive');

        console.log('📊 Current Users in Database:');
        console.log('═══════════════════════════════════════════════════════');

        if (users.length === 0) {
            console.log('⚠️  No users found in database!\n');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
                console.log('───────────────────────────────────────────────────────');
            });
            console.log(`\nTotal Users: ${users.length}\n`);
        }

        // Create test users if needed
        console.log('🔧 Creating/Updating Test Users...\n');

        const testUsers = [
            {
                name: 'Admin MATC',
                email: 'admin@matc.com',
                password: 'admin123',
                role: 'ADMIN',
                phone: '+21612345678',
                country: 'Tunisia',
                isActive: true
            },
            {
                name: 'Salome Makoueta',
                email: 'makouetasalome@gmail.com',
                password: 'salome2026',
                role: 'RESELLER_T1', // Master
                phone: '+21698765432',
                country: 'Tunisia',
                isActive: true,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            },
            {
                name: 'Lando M Joel',
                email: 'lando@matc.com',
                password: 'lando2026',
                role: 'RESELLER_T2', // Partner
                phone: '+21655555555',
                country: 'Tunisia',
                isActive: true,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Student Test',
                email: 'student@test.com',
                password: 'student123',
                role: 'STUDENT',
                phone: '+21644444444',
                country: 'Tunisia',
                isActive: true,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months
            }
        ];

        for (const userData of testUsers) {
            try {
                // Check if user exists
                const existingUser = await User.findOne({ email: userData.email });

                if (existingUser) {
                    console.log(`ℹ️  User ${userData.email} already exists - Updating password...`);

                    // Hash new password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(userData.password, salt);

                    // Update user
                    existingUser.password = hashedPassword;
                    existingUser.plainPassword = userData.password; // Store plain for admin view
                    existingUser.isActive = true;
                    await existingUser.save();

                    console.log(`   ✅ Updated: ${userData.name} (${userData.role})`);
                    console.log(`   📧 Email: ${userData.email}`);
                    console.log(`   🔑 Password: ${userData.password}\n`);
                } else {
                    // Hash password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(userData.password, salt);

                    // Create new user
                    const newUser = new User({
                        ...userData,
                        password: hashedPassword,
                        plainPassword: userData.password
                    });

                    await newUser.save();

                    console.log(`   ✅ Created: ${userData.name} (${userData.role})`);
                    console.log(`   📧 Email: ${userData.email}`);
                    console.log(`   🔑 Password: ${userData.password}\n`);
                }
            } catch (err) {
                console.error(`   ❌ Error with ${userData.email}:`, err.message);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ All test users are ready!');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('📝 Login Credentials Summary:');
        console.log('───────────────────────────────────────────────────────');
        console.log('1. ADMIN:');
        console.log('   Email: admin@matc.com');
        console.log('   Password: admin123\n');

        console.log('2. MASTER (Salome):');
        console.log('   Email: makouetasalome@gmail.com');
        console.log('   Password: salome2026\n');

        console.log('3. PARTNER (Lando):');
        console.log('   Email: lando@matc.com');
        console.log('   Password: lando2026\n');

        console.log('4. STUDENT:');
        console.log('   Email: student@test.com');
        console.log('   Password: student123\n');

        console.log('5. DEMO:');
        console.log('   Email: demo@matcvault.com');
        console.log('   Password: demo2026 (Hardcoded, no DB needed)\n');

        console.log('═══════════════════════════════════════════════════════');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

checkAndSeedUsers();
