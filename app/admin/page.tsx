export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 tracking-tight">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border/40 rounded-sm p-8 hover:border-border/60 transition-colors">
          <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70">
            Books
          </h3>
          <p className="text-4xl font-bold mt-4 tracking-tight">0</p>
        </div>

        <div className="border border-border/40 rounded-sm p-8 hover:border-border/60 transition-colors">
          <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70">
            Currently Reading
          </h3>
          <p className="text-4xl font-bold mt-4 tracking-tight">0</p>
        </div>

        <div className="border border-border/40 rounded-sm p-8 hover:border-border/60 transition-colors">
          <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70">
            Reading Streak
          </h3>
          <p className="text-4xl font-bold mt-4 tracking-tight">0 days</p>
        </div>
      </div>
    </div>
  );
}

