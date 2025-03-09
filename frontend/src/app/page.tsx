import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  try {
    // Add a small delay to ensure proper handling
    await new Promise(resolve => setTimeout(resolve, 100));
    redirect('/students');
  } catch (error) {
    console.error('Redirect error:', error);
    // Fallback redirect using client-side navigation
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: 'window.location.href = "/students"',
        }}
      />
    );
  }
}
