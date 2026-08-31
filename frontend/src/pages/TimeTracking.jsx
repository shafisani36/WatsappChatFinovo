
import { useEffect, useState } from "react";
import {
  Play,
  Square,
  Clock3,
  CheckCircle2,
  Coffee,
} from "lucide-react";

function TimeTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(
      2,
      "0"
    )}m`;
  };

  const formatDateTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadTodayData = async () => {
    try {
      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/time/today",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Today Response:", data);

      if (!response.ok) {
        setError(data.message || "Unable to load today's data");
        return;
      }

      setTotalMinutes(data.totalMinutes || 0);
      setSessions(data.entries || []);

      if (data.isTracking && data.activeEntry) {
        setIsTracking(true);

        const startTime = new Date(
          data.activeEntry.startTime
        ).getTime();

        const currentTime = Date.now();

        const elapsedSeconds = Math.floor(
          (currentTime - startTime) / 1000
        );

        setSeconds(elapsedSeconds > 0 ? elapsedSeconds : 0);
      } else {
        setIsTracking(false);
        setSeconds(0);
      }
    } catch (error) {
      console.error("Load Today Error:", error);
      setError("Unable to connect to the server");
    }
  };

  const loadHistory = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/time/history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("History Response:", data);

      if (!response.ok) {
        setError(data.message || "Unable to load history");
        return;
      }

      setSessions(data.entries || []);
    } catch (error) {
      console.error("History Error:", error);
    }
  };

  useEffect(() => {
    loadTodayData();
    loadHistory();
  }, []);

  useEffect(() => {
    let interval;

    if (isTracking) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking]);

  const handleStart = async () => {
    setError("");
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/time/start",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Start Response:", data);

      if (!response.ok) {
        setError(data.message || "Unable to start tracking");
        return;
      }

      setIsTracking(true);
      setSeconds(0);

      await loadTodayData();
      await loadHistory();
    } catch (error) {
      console.error("Start Time Error:", error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setError("");
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/time/stop",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Stop Response:", data);

      if (!response.ok) {
        setError(data.message || "Unable to stop tracking");
        return;
      }

      setIsTracking(false);
      setSeconds(0);

      await loadTodayData();
      await loadHistory();
    } catch (error) {
      console.error("Stop Time Error:", error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Time Tracking
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track your working hours and manage your work sessions.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Current Task
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Dashboard Development
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Frontend Development
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <Clock3 className="h-6 w-6 text-slate-700" />
            </div>
          </div>

          <div className="py-14 text-center">
            <p className="text-6xl font-bold tracking-tight text-slate-900">
              {formatTime(seconds)}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isTracking ? "bg-green-500" : "bg-slate-300"
                }`}
              />

              <p className="text-sm text-slate-500">
                {isTracking
                  ? "Work session is active"
                  : "Timer stopped"}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            {!isTracking ? (
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Play className="h-5 w-5" />

                {loading ? "Starting..." : "Start Work"}
              </button>
            ) : (
              <button
                onClick={handleStop}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Square className="h-5 w-5" />

                {loading ? "Stopping..." : "Stop Work"}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">
            Today's Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your work activity today
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Total Tracked
                </p>

                <Clock3 className="h-4 w-4 text-slate-500" />
              </div>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatMinutes(totalMinutes)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Productive Time
                </p>

                <CheckCircle2 className="h-4 w-4 text-slate-500" />
              </div>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatMinutes(totalMinutes)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Break Time
                </p>

                <Coffee className="h-4 w-4 text-slate-500" />
              </div>

              <p className="mt-2 text-xl font-bold text-slate-900">
                00h 00m
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="font-bold text-slate-900">
            Today's Sessions
          </h2>

          <p className="text-sm text-slate-500">
            Your recent work sessions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-medium">Task</th>
                <th className="pb-3 font-medium">Start</th>
                <th className="pb-3 font-medium">End</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    No work sessions found for today.
                  </td>
                </tr>
              ) : (
                sessions.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100"
                  >
                    <td className="py-4 text-sm font-medium text-slate-900">
                      Dashboard Development
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {formatDateTime(entry.startTime)}
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {formatDateTime(entry.endTime)}
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {entry.duration
                        ? formatMinutes(entry.duration)
                        : "Active"}
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          entry.endTime
                            ? "bg-slate-100 text-slate-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {entry.endTime ? "Completed" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TimeTracking;