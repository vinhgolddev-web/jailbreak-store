const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

exports.sendOrderNotification = async (order) => {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.warn("SMTP credentials missing. Email not sent.");
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL, // Send to Admin (default to sender)
        subject: `New Order #${order._id.toString().slice(-6)} - Jailbreak Store`,
        html: `
            <h2>New Order Received</h2>
            <p><strong>User:</strong> ${order.userId}</p>
            <p><strong>Total:</strong> $${order.totalAmount.toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Code:</strong> ${order.secretCode || 'N/A'}</p>
            <h3>Items:</h3>
            <ul>
                ${order.items.map(item => `<li>Product ID: ${item.productId} (x${item.quantity})</li>`).join('')}
            </ul>
        `
    };

    try {
        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error("Error sending email:", error);
    }
};
