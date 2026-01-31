const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    masterId: mongoose.Schema.Types.ObjectId
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkPartners() {
    try {
        const MONGODB_URI = "mongodb+srv://matc592_db_user:matc%40g441555@cluster0.yxcjyk9.mongodb.net/paymendt?retryWrites=true&w=majority&appName=Cluster0";

        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const allUsers = await User.find({});
        console.log(`Total users in DB: ${allUsers.length}`);

        const partners = await User.find({ role: 'RESELLER_T2' });
        console.log(`Total partners (RESELLER_T2) in DB: ${partners.length}`);

        partners.forEach(p => {
            console.log(`- Partner: ${p.name}, Email: ${p.email}, MasterId: ${p.masterId || 'NONE'}`);
        });

        const masters = await User.find({ role: 'RESELLER_T1' });
        console.log(`Total masters (RESELLER_T1) in DB: ${masters.length}`);
        masters.forEach(m => {
            console.log(`- Master: ${m.name}, Email: ${m.email}, Id: ${m._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPartners();
