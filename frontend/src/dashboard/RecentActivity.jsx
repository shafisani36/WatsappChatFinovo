function RecentActivity() {
  const activities = [
    "Ali Khan started Dashboard UI task",
    "Sara Ahmed completed API Integration",
    "Usman Ali became idle",
    "New alert generated for excessive idle time",
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-bold text-slate-900">
        Recent Activity
      </h2>

      <div className="mt-5 space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b border-slate-100 pb-4 last:border-0"
          >
            <div className="h-2 w-2 rounded-full bg-slate-900" />

            <p className="text-sm text-slate-600">
              {activity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;