import ThesisEditor from '@/components/ThesisEditor';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // In a real app, we would fetch the document data here based on resolvedParams.id
  return <ThesisEditor documentId={resolvedParams.id || 'new'} />;
}
