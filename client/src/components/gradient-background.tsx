export default function GradientBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
