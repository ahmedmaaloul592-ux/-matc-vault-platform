
const mongoose = require('mongoose');

const uri = "mongodb+srv://matc592_db_user:matc%40g441555@cluster0.yxcjyk9.mongodb.net/paymendt?retryWrites=true&w=majority&appName=Cluster0";

console.log("Connecting to MongoDB...");

mongoose.connect(uri)
    .then(() => {
        console.log("✅ SUCCESS! Connected to MongoDB Atlas.");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ ERROR: Connection failed.");
        console.error(err.message);
        process.exit(1);
    });
