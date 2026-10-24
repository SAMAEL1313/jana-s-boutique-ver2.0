import nodemailer from "nodemailer";
import type { OrderDTO } from "@/types";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error("GMAIL_USER and GMAIL_PASS must be set to send email");
  }
  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string) {
  return getTransporter().sendMail({
    from: `"Jana Boutique" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

/** Shared branded wrapper used by every email. */
export function emailLayout(body: string) {
  return `
  <div style="background: #f2e9e4; padding: 40px; font-family: 'Segoe UI', sans-serif;">
    <div style="max-width: 560px; margin: auto; background: #ffffff; padding: 40px 30px; border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); border: 1px solid #f0d9cb;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: 700; color: #b88e5a; letter-spacing: 1px; margin: 0;">Jana’s Boutique</h1>
        <p style="color: #d6a77a; margin-top: 5px; font-size: 14px;">Elegance made personal.</p>
      </div>
      ${body}
      <hr style="margin: 35px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.5;">
        This is an automated email — kindly do not reply. <br>
        © ${new Date().getFullYear()} Jana’s Boutique • All Rights Reserved
      </p>
    </div>
  </div>`;
}

export function resetPasswordEmail(link: string) {
  return emailLayout(`
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        We received a request to reset your password. Click the button below to choose a new one.
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${escapeHtml(link)}" style="background: #800000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none;">Reset Password</a>
      </p>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        This link expires in <b>1 hour</b>. If you didn’t request this, you can ignore this email.
      </p>`);
}

export function receiptEmail(order: OrderDTO) {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 6px 0;">${escapeHtml(item.name)}${item.size ? ` (${escapeHtml(item.size)})` : ""} × ${item.quantity}</td>
          <td style="padding: 6px 0; text-align: right;">${peso(item.unitPrice * item.quantity)}</td>
        </tr>`
    )
    .join("");

  return emailLayout(`
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Hi ${escapeHtml(order.firstName)}, thank you for your order!
      </p>
      <p style="font-size: 14px; color: #666;">
        Order ID: <b>${escapeHtml(order.orderNumber)}</b><br>
        Date: ${new Date(order.createdAt).toLocaleString("en-PH")}<br>
        Payment: ${escapeHtml(order.paymentMethod)}
      </p>
      <table style="width: 100%; font-size: 14px; color: #444; border-collapse: collapse;">
        ${rows}
        <tr><td style="padding: 6px 0; border-top: 1px solid #eee;">Shipping</td><td style="padding: 6px 0; text-align: right; border-top: 1px solid #eee;">${peso(order.shippingCost)}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Total</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${peso(order.totalAmount)}</td></tr>
      </table>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Shipping to: ${escapeHtml(`${order.address}, ${order.city}, ${order.province} ${order.zip}`)}
      </p>`);
}
