/**
 * Table Detail Page
 * 
 * Single table management
 * - Current orders for table
 * - Take new order
 * - Update order status
 * - Process payment
 * - Table status management
 */

export default async function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1>Table Details: {id}</h1>
    </div>
  );
}
