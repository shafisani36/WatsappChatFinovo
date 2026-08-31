import { useState } from "react";
import {
  Save,
  Shield,
  Clock3,
  Camera,
  Bell,
  Users,
  Lock,
} from "lucide-react";

function Settings() {
  const [settings, setSettings] = useState({
    screenshotInterval: "10",
    idleThreshold: "15",
    workdayStart: "09:00",
    workdayEnd: "18:00",
    screenshotEnabled: true,
    idleAlerts: true,
    productivityAlerts: true,
    emailNotifications: true,
    autoPause: false,
  });

  const handleChange = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure workspace, monitoring and notification settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/* Monitoring */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start gap-4 border-b border-slate-200 p-6">
          <div className="rounded-xl bg-slate-100 p-3">
            <Shield className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Monitoring Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure how employee activity is monitored.
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          {/* Screenshot Interval */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Screenshot Interval
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="60"
                value={settings.screenshotInterval}
                onChange={(e) =>
                  handleChange(
                    "screenshotInterval",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <span className="text-sm text-slate-500">
                minutes
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              How frequently screenshots are captured during active work.
            </p>
          </div>

          {/* Idle Threshold */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Idle Threshold
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="120"
                value={settings.idleThreshold}
                onChange={(e) =>
                  handleChange("idleThreshold", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <span className="text-sm text-slate-500">
                minutes
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Time after which an employee can be considered idle.
            </p>
          </div>

          {/* Workday Start */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Workday Start
            </label>

            <input
              type="time"
              value={settings.workdayStart}
              onChange={(e) =>
                handleChange("workdayStart", e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          {/* Workday End */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Workday End
            </label>

            <input
              type="time"
              value={settings.workdayEnd}
              onChange={(e) =>
                handleChange("workdayEnd", e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>
        </div>
      </section>

      {/* Tracking */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start gap-4 border-b border-slate-200 p-6">
          <div className="rounded-xl bg-slate-100 p-3">
            <Clock3 className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Time Tracking
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure employee time tracking behavior.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <SettingToggle
            icon={Clock3}
            title="Auto Pause"
            description="Automatically pause tracking when the employee becomes idle."
            enabled={settings.autoPause}
            onChange={(value) =>
              handleChange("autoPause", value)
            }
          />

          <SettingToggle
            icon={Camera}
            title="Screenshot Capture"
            description="Allow screenshots to be captured during active tracked sessions."
            enabled={settings.screenshotEnabled}
            onChange={(value) =>
              handleChange("screenshotEnabled", value)
            }
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start gap-4 border-b border-slate-200 p-6">
          <div className="rounded-xl bg-slate-100 p-3">
            <Bell className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Notifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose which workforce events generate notifications.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <SettingToggle
            icon={Bell}
            title="Idle Time Alerts"
            description="Notify administrators when employees exceed the idle threshold."
            enabled={settings.idleAlerts}
            onChange={(value) =>
              handleChange("idleAlerts", value)
            }
          />

          <SettingToggle
            icon={Shield}
            title="Productivity Alerts"
            description="Notify administrators when productivity falls below configured limits."
            enabled={settings.productivityAlerts}
            onChange={(value) =>
              handleChange("productivityAlerts", value)
            }
          />

          <SettingToggle
            icon={Bell}
            title="Email Notifications"
            description="Send important alerts and reports through email."
            enabled={settings.emailNotifications}
            onChange={(value) =>
              handleChange("emailNotifications", value)
            }
          />
        </div>
      </section>

      {/* Permissions */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start gap-4 border-b border-slate-200 p-6">
          <div className="rounded-xl bg-slate-100 p-3">
            <Lock className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Security & Permissions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage workspace access and employee permissions.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-slate-600" />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Employee Access
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Employees can access their own tasks and time data.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-600" />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Admin Access
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Administrators can manage monitoring and reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-6 p-6">
      <div className="flex items-start gap-4">
        <div className="mt-1 rounded-lg bg-slate-100 p-2">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-slate-900" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default Settings;