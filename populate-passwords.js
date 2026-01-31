const mongoose = require('mongoose');

async function populatePasswords() {
    try {
        const MONGODB_URI = "mongodb+srv://matc592_db_user:matc%40g441555@cluster0.yxcjyk9.mongodb.net/paymendt?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(MONGODB_URI);

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            plainPassword: String
        }));

        const updates = [
            { email: 'admin@matcvault.com', pass: 'admin123456' },
            { email: 'master@matcvault.com', pass: 'master123456' },
            { email: 'partner@matcvault.com', pass: 'partner123456' },
            { email: 'student@matcvault.com', pass: 'student123456' },
            { email: 'provider@matcvault.com', pass: 'provider123456' }
        ];

        for (const up of updates) {
            await User.updateOne({ email: up.email }, { $set: { plainPassword: up.pass } });
        }

        console.log('Populated plainPasswords for test accounts.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

populatePasswords();
