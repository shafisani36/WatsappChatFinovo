import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import toast from "react-hot-toast";
import "../assets/styles/employeeProgress.css"
import * as XLSX from "xlsx";

import api from "../api/axios";

import {
  useAuth,
} from "../contexts/AuthContext";

import "../assets/styles/report.css";


const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) {
    return "00:00:00";
  }

  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const secs = Math.floor(
    seconds % 60
  );

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(
    2,
    "0"
  )}`;
};


const getToday = () => {
  return new Date()
    .toISOString()
    .split("T")[0];
};


const getInitials = (name) => {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};


const getRoleLabel = (role) => {
  if (!role) {
    return "Employee";
  }

  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


const getProgressClass = (value) => {
  const progress = Number(value) || 0;

  if (progress >= 80) {
    return "progress-high";
  }

  if (progress >= 50) {
    return "progress-medium";
  }

  return "progress-low";
};


const getProductivityClass = (value) => {
  const productivity =
    Number(value) || 0;

  if (productivity >= 80) {
    return "productivity-high";
  }

  if (productivity >= 50) {
    return "productivity-medium";
  }

  return "productivity-low";
};



export default function EmployeeProgress() {
  const {
    isManager,
    isAdmin,
  } = useAuth();

  const [
    reportType,
    setReportType,
  ] = useState("daily");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(getToday());

  const [
    data,
    setData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const canView =
    isManager || isAdmin;

  useEffect(() => {
    if (canView) {
      fetchProgress();
    }
  }, [
    reportType,
    selectedDate,
    canView,
  ]);


  const fetchProgress = async () => {
    setLoading(true);

    try {
      const response =
        await api.get(
          `/reports/employee-progress?type=${reportType}&date=${selectedDate}`
        );

      setData(
        response.data?.data || null
      );
    } catch (error) {
      console.error(
        "Employee progress error:",
        error
      );

      setData(null);

      toast.error(
        error.response?.data?.message ||
          "Could not load employee progress"
      );
    } finally {
      setLoading(false);
    }
  };


  const downloadExcel = () => {
    if (
      !data ||
      !data.employees?.length
    ) {
      toast.error(
        "No employee data available"
      );

      return;
    }

    setDownloading(true);

    try {
      const employeeRows =
        data.employees.map(
          (employee) => ({
            Employee:
              employee.employee?.name ||
              "-",

            Email:
              employee.employee?.email ||
              "-",

            Role:
              employee.employee?.role ||
              "-",

            "Period Start":
              data.period?.start || "",

            "Period End":
              data.period?.end || "",

            "Total Tracked":
              employee.totalTrackedTimeFormatted ||
              formatDuration(
                employee.totalTrackedTime
              ),

            "Productive Time":
              employee.workingTimeFormatted ||
              formatDuration(
                employee.workingTime
              ),

            "Idle Time":
              employee.idleTimeFormatted ||
              formatDuration(
                employee.idleTime
              ),

            "Non-Productive Time":
              employee.nonProductiveTimeFormatted ||
              formatDuration(
                employee.nonProductiveTime
              ),

            "Paused Time":
              employee.pausedTimeFormatted ||
              formatDuration(
                employee.pausedTime
              ),

            "Productivity %":
              Number(
                employee.productivityPercentage ||
                  0
              ),

            "Progress %":
              Number(
                employee.progressPercentage ||
                  0
              ),

            Sessions:
              employee.sessionsCount || 0,

            "Days Worked":
              employee.daysWorked || 0,
          })
        );


      const worksheet =
        XLSX.utils.json_to_sheet(
          employeeRows
        );


      worksheet["!cols"] = [
        { wch: 25 },
        { wch: 30 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 },
        { wch: 24 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
      ];


      const workbook =
        XLSX.utils.book_new();


      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Employees"
      );


      const fileName =
        `Employee-Progress-${reportType}-${selectedDate}.xlsx`;


      XLSX.writeFile(
        workbook,
        fileName
      );


      toast.success(
        "Excel report downloaded successfully"
      );

    } catch (error) {
      console.error(
        "Excel export error:",
        error
      );

      toast.error(
        "Could not create Excel report"
      );

    } finally {
      setDownloading(false);
    }
  };

  if (!canView) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return (
    <div className="employee-progress-page">


      <div className="employee-progress-header">

        <div className="employee-progress-heading">
          <div>

            <h1>
              Employee Progress
            </h1>

            <p>
              Track employee productivity,
              activity and working time.
            </p>

          </div>

        </div>


        <button
          className="employee-excel-button"
          onClick={downloadExcel}
          disabled={
            downloading ||
            !data?.employees?.length
          }
        >

          {downloading ? (
            <>
              <span className="excel-spinner"></span>

              Preparing...
            </>
          ) : (
            <>
              <span className="excel-icon">
                ↓
              </span>

              Download Excel
            </>
          )}

        </button>

      </div>


      <div className="employee-progress-toolbar">

        <div className="period-selector">

          <span className="toolbar-label">
            Period
          </span>

          <div className="period-buttons">

            {[
              "daily",
              "weekly",
              "monthly",
            ].map((type) => (

              <button
                key={type}
                onClick={() =>
                  setReportType(type)
                }
                className={
                  reportType === type
                    ? "period-button active"
                    : "period-button"
                }
              >
                {type
                  .charAt(0)
                  .toUpperCase() +
                  type.slice(1)}
              </button>

            ))}

          </div>

        </div>


        <div className="employee-date-control">

          <label>
            {reportType === "daily"
              ? "Date"
              : reportType === "weekly"
              ? "Week"
              : "Month"}
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
          />

        </div>


        <button
          className="employee-refresh-button"
          onClick={fetchProgress}
          disabled={loading}
        >

          <span
            className={
              loading
                ? "refresh-icon spinning"
                : "refresh-icon"
            }
          >
            ↻
          </span>

          {loading
            ? "Loading..."
            : "Refresh"}

        </button>

      </div>

      {!loading && data && (
        <div className="employee-report-info">

          <div>

            <span className="report-info-label">
              Reporting Period
            </span>

            <strong>
              {data.period?.start ||
                selectedDate}

              <span>
                →
              </span>

              {data.period?.end ||
                selectedDate}
            </strong>

          </div>


          <div className="employee-count-badge">

            <span className="employee-count-dot"></span>

            {data.employees?.length || 0}

            <span>
              Employees
            </span>

          </div>

        </div>
      )}
    {loading && (

        <div className="employee-progress-loading">

          <div className="large-loader"></div>

          <h3>
            Loading employee progress
          </h3>

          <p>
            Fetching the latest employee
            activity data...
          </p>

        </div>

      )}

      {!loading && data && (

        <section className="employee-table-card">

          <div className="employee-table-header">

            <div>

              <h2>
                Employee Performance
              </h2>

              <p>
                Detailed productivity and
                activity breakdown
              </p>

            </div>

            <span className="table-period-badge">
              {reportType
                .charAt(0)
                .toUpperCase() +
                reportType.slice(1)}
            </span>

          </div>


          <div className="employee-table-wrapper">

            <table className="employee-progress-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Tracked
                  </th>

                  <th>
                    Productive
                  </th>

                  <th>
                    Idle
                  </th>

                  <th>
                    Non-Productive
                  </th>

                  <th>
                    Productivity
                  </th>

                  <th>
                    Progress
                  </th>

                </tr>

              </thead>


              <tbody>

                {data.employees?.length > 0 ? (

                  data.employees.map(
                    (employee) => {

                      const productivity =
                        Number(
                          employee
                            .productivityPercentage ||
                            0
                        );

                      const progress =
                        Number(
                          employee
                            .progressPercentage ||
                            0
                        );


                      return (

                        <tr
                          key={
                            employee.employee
                              ?.id
                          }
                        >

{/*  */}

                          <td>

                            <div className="employee-profile">

                              <div className="employee-avatar-modern">

                                {getInitials(
                                  employee
                                    .employee
                                    ?.name
                                )}

                              </div>

                              <div className="employee-details">

                                <strong>
                                  {employee
                                    .employee
                                    ?.name ||
                                    "Unknown Employee"}
                                </strong>

                                <span>
                                  {employee
                                    .employee
                                    ?.email ||
                                    "-"}
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* ROLE */}

                          <td>

                            <span className="role-badge">

                              {getRoleLabel(
                                employee
                                  .employee
                                  ?.role
                              )}

                            </span>

                          </td>


                          {/* TRACKED */}

                          <td>

                            <span className="time-value">

                              {employee
                                .totalTrackedTimeFormatted ||
                                formatDuration(
                                  employee.totalTrackedTime
                                )}

                            </span>

                          </td>


                          {/* PRODUCTIVE */}

                          <td>

                            <span className="time-value productive-time">

                              {employee
                                .workingTimeFormatted ||
                                formatDuration(
                                  employee.workingTime
                                )}

                            </span>

                          </td>


                          {/* IDLE */}

                          <td>

                            <span className="time-value idle-time">

                              {employee
                                .idleTimeFormatted ||
                                formatDuration(
                                  employee.idleTime
                                )}

                            </span>

                          </td>


                          {/* NON PRODUCTIVE */}

                          <td>

                            <span className="time-value nonproductive-time">

                              {employee
                                .nonProductiveTimeFormatted ||
                                formatDuration(
                                  employee.nonProductiveTime
                                )}

                            </span>

                          </td>


                          {/* PRODUCTIVITY */}

                          <td>

                            <div className="percentage-cell">

                              <div className="percentage-top">

                                <span
                                  className={`percentage-number ${getProductivityClass(
                                    productivity
                                  )}`}
                                >
                                  {productivity.toFixed(
                                    1
                                  )}
                                  %
                                </span>

                              </div>

                              <div className="mini-progress">

                                <div
                                  className={`mini-progress-fill ${getProductivityClass(
                                    productivity
                                  )}`}
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        productivity,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>


                          {/* PROGRESS */}

                          <td>

                            <div className="percentage-cell">

                              <div className="percentage-top">

                                <span
                                  className={`percentage-number ${getProgressClass(
                                    progress
                                  )}`}
                                >
                                  {progress.toFixed(
                                    1
                                  )}
                                  %
                                </span>

                              </div>

                              <div className="mini-progress">

                                <div
                                  className={`mini-progress-fill ${getProgressClass(
                                    progress
                                  )}`}
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        progress,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="8"
                      className="employee-empty-state"
                    >

                      <div className="empty-state-icon">
                        ◫
                      </div>

                      <strong>
                        No employees found
                      </strong>

                      <span>
                        There is no employee
                        activity available
                        for this period.
                      </span>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      )}


      {/* =================================================
          NO DATA
      ================================================= */}

      {!loading && !data && (

        <div className="employee-no-data">

          <div className="no-data-icon">
            ◫
          </div>

          <h3>
            No employee data
          </h3>

          <p>
            Employee progress could not
            be loaded for this period.
          </p>

          <button
            onClick={fetchProgress}
            className="no-data-refresh"
          >
            Try Again
          </button>

        </div>

      )}

    </div>
  );
}