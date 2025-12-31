export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Books</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Currently Reading
          </h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Reading Streak
          </h3>
          <p className="text-3xl font-bold mt-2">0 days</p>
        </div>
      </div>
    </div>
  );
}
