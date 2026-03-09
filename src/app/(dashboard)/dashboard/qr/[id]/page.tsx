export default function QrDetailPage({ params }: { params: { id: string } }) {
  return <div className="rounded-lg border border-border bg-white p-4">Edition QR: {params.id}</div>;
}
