import NavigationRail from '@/components/NavigationRail';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NavigationRail>{children}</NavigationRail>;
}
