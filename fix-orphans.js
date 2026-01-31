const mongoose = require('mongoose');

async function fixOrphans() {
    try {
        const MONGODB_URI = "mongodb+srv://matc592_db_user:matc%40g441555@cluster0.yxcjyk9.mongodb.net/paymendt?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(MONGODB_URI);

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String,
            masterId: mongoose.Schema.Types.ObjectId
        }));

        // Ahmed Maaloul's ID
        const masterId = new mongoose.Types.ObjectId("697bd84408a7a2f6daeaf1eb");

        // Update all partners (RESELLER_T2) that have no masterId
        const result = await User.updateMany(
            { role: 'RESELLER_T2', masterId: { $exists: false } },
            { $set: { masterId: masterId } }
        );

        console.log(`Updated ${result.modifiedCount} orphaned partners to belong to Ahmed Maaloul.`);

        // Also update the ones where masterId is null (just in case)
        const result2 = await User.updateMany(
            { role: 'RESELLER_T2', masterId: null },
            { $set: { masterId: masterId } }
        );
        console.log(`Updated ${result2.modifiedCount} partners with null masterId.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixOrphans();
