const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "priyankramani301@gmail.com",
    pass: "knkvwtwemwzobhtz",
  },
});

const sendInvoice = async (email, plan, amount) => {
  await transporter.sendMail({
    from: "InternArea",
    to: email,
    subject: "Subscription Invoice",
    html: `
      <h2>Subscription Successful 🎉</h2>
      <p>Plan: <b>${plan}</b></p>
      <p>Amount Paid: ₹${amount}</p>
      <p>Valid for 1 month</p>
    `,
  });
};

module.exports = sendInvoice;
