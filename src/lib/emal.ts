import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        const data = await resend.emails.send({
            from: "Authify <noreply@qasimjd.tech>",
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Email error:", error);
        return { success: false, error };
    }
}
