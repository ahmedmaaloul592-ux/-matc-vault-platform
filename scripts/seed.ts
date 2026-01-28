import mongoose from 'mongoose';
import User from '../src/models/User';
import TrainingBundle from '../src/models/TrainingBundle';
import License from '../src/models/License';

const MONGODB_URI = 'mongodb+srv://matc592_db_user:matc%40g441555@cluster0.yxcjyk9.mongodb.net/paymendt?retryWrites=true&w=majority&appName=Cluster0';

async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await TrainingBundle.deleteMany({});
        await License.deleteMany({});
        console.log('✅ Data cleared');

        // Create Admin
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Direction MATC',
            email: 'admin@matcvault.com',
            password: 'admin123',
            role: 'ADMIN',
            isActive: true
        });
        console.log('✅ Admin created');

        // Create Provider
        console.log('👤 Creating provider user...');
        const provider = await User.create({
            name: 'QHSE Elite Institute',
            email: 'provider@matcvault.com',
            password: 'provider123',
            role: 'PROVIDER',
            plusPoints: 15.5,
            isActive: true
        });
        console.log('✅ Provider created');

        // Create Master Reseller
        console.log('👤 Creating master reseller...');
        const master = await User.create({
            name: 'Ahmed Ben Salem',
            email: 'master@matcvault.com',
            password: 'master123',
            role: 'RESELLER_T1',
            walletBalance: 14700,
            enrolledLearners: 0,
            phone: '+21699000111',
            country: 'Tunisia',
            isActive: true
        });
        console.log('✅ Master reseller created');

        // Create Partner Reseller
        console.log('👤 Creating partner reseller...');
        const partner = await User.create({
            name: 'Sami Mansour',
            email: 'partner@matcvault.com',
            password: 'partner123',
            role: 'RESELLER_T2',
            walletBalance: 620,
            enrolledLearners: 0,
            phone: '+21622333444',
            country: 'Tunisia',
            isActive: true
        });
        console.log('✅ Partner reseller created');

        // Create Student
        console.log('👤 Creating student user...');
        const student = await User.create({
            name: 'Anis Khanchouch',
            email: 'student@matcvault.com',
            password: 'student123',
            role: 'STUDENT',
            isActive: true
        });
        console.log('✅ Student created');

        // Create Training Bundles
        console.log('📚 Creating training bundles...');

        const bundle1 = await TrainingBundle.create({
            title: 'Devenir Responsable QHSE',
            provider: {
                name: 'QHSE Academy Europe',
                type: 'Institute'
            },
            contentType: 'Archive de Workshop',
            description: 'Masterclass complète sur le pilotage stratégique et opérationnel d\'un système QHSE.',
            thumbnail: '/qhse_manager.png',
            stats: {
                videoHours: 24,
                documentCount: 45,
                hasLiveSupport: true
            },
            price: 35,
            rating: 5,
            category: 'QHSE',
            isActive: true,
            createdBy: provider._id
        });

        const bundle2 = await TrainingBundle.create({
            title: 'Superviseur HSE',
            provider: {
                name: 'Dr. Mansour Professionals',
                type: 'Expert'
            },
            contentType: 'Série Technique Archivée',
            description: 'Compétences opérationnelles pour la supervision de la sécurité sur site industriel.',
            thumbnail: '/hse_supervisor.png',
            stats: {
                videoHours: 12,
                documentCount: 10,
                hasLiveSupport: false
            },
            price: 35,
            rating: 4,
            category: 'Safety',
            isActive: true,
            createdBy: provider._id
        });

        const bundle3 = await TrainingBundle.create({
            title: 'ISO 9001:2015 Quality Management Systems',
            provider: {
                name: 'Safety Masters',
                type: 'Agency'
            },
            contentType: 'Archive Intensive',
            description: 'Pilotage complet d\'un système de management de la qualité.',
            thumbnail: '/iso_audit.png',
            stats: {
                videoHours: 20,
                documentCount: 50,
                hasLiveSupport: true
            },
            price: 35,
            rating: 5,
            category: 'ISO',
            isActive: true,
            createdBy: provider._id
        });

        console.log('✅ Training bundles created');

        // Create Licenses for Master
        console.log('🎫 Creating licenses...');
        for (let i = 0; i < 5; i++) {
            await License.create({
                ownedBy: master._id,
                price: 5,
                status: 'AVAILABLE',
                key: `MATC-2026-M${i}X9Y`
            });
        }
        console.log('✅ 5 licenses created for master');

        // Create Licenses for Partner
        for (let i = 0; i < 3; i++) {
            await License.create({
                ownedBy: partner._id,
                price: 5,
                status: 'AVAILABLE',
                key: `MATC-2026-P${i}A7B`
            });
        }
        console.log('✅ 3 licenses created for partner');

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('📝 Login credentials:');
        console.log('   Admin:    admin@matcvault.com / admin123');
        console.log('   Provider: provider@matcvault.com / provider123');
        console.log('   Master:   master@matcvault.com / master123');
        console.log('   Partner:  partner@matcvault.com / partner123');
        console.log('   Student:  student@matcvault.com / student123\n');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
