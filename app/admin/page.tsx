'use client'

import { AdminRoute } from '@/components/AdminRoute';

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Welcome to the admin area. This page is protected by:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Client-side protection (AdminRoute component)</li>
          <li>Server-side middleware protection</li>
          <li>Session-based authentication</li>
          <li>Firebase custom claims</li>
        </ul>
      </div>
    </AdminRoute>
  );
} 