import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const testEmail = async () => {
    console.log("🧪 Testing email configuration...\n");
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✅ Set" : "❌ Not set");
    console.log("");

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        console.log("📧 Sending test email...");

        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to yourself for testing
            subject: "✅ Elegant Mart - Email Test",
            html: `
        <h2>Email Configuration Test Successful!</h2>
        <p>Your SMTP settings are working correctly.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
        });

        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
        console.log("\n🎉 Check your inbox at:", process.env.SMTP_USER);
    } catch (error) {
        console.error("❌ Email sending failed:");
        console.error(error.message);

        if (error.message.includes("Invalid login")) {
            console.log("\n💡 Tips:");
            console.log("1. Make sure you're using an App Password, not your regular Gmail password");
            console.log("2. Enable 2-Step Verification: https://myaccount.google.com/security");
            console.log("3. Generate App Password: https://myaccount.google.com/apppasswords");
            console.log("4. Remove spaces from the password in .env file");
        }
    }
};

testEmail();
