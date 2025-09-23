import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to organization selection
  redirect('/select-organization')
}
