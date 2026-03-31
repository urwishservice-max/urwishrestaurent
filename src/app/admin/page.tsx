import { redirect } from 'next/navigation';

export default function AdminPage() {
    // Redirect to the dashboard by default
    redirect('/admin/dashboard');
}
