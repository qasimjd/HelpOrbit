import { redirect } from 'next/navigation';

export default function OrgPage({params}: {params: {slug: string}}) {
    redirect(`/org/${params.slug}/dashboard`);
}