import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import "../assets/styles/report.css"
import api from "../api/axios";

const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) {
    return "00:00:00";
  }

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const secs =
    Math.floor(seconds % 60);

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

export default function Reports() {
  const [
    reportType,
    setReportType,
  ] = useState("daily");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  const [
    reportData,
    setReportData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);

      try {
        const response =
          await api.get(
            `/reports/${reportType}?date=${selectedDate}`
          );

        setReportData(
          response.data?.data ||
            response.data ||
            null
        );
      } catch (error) {
        console.error(
          `Error fetching ${reportType} report:`,
          error
        );

        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [
    reportType,
    selectedDate,
  ]);

  const productivity = Math.round(
    reportData?.productivityPercentage ||
      0
  );


  const downloadExcel = () => {
    if (!reportData) {
      toast.error("No report data available");
      return;
    }

    setDownloading(true);

    try {
      const reportRows = [
        {
          "Report Type":
            reportType.charAt(0).toUpperCase() +
            reportType.slice(1),

          "Report Date":
            reportData.date ||
            selectedDate,

          "Total Tracked":
            reportData.totalTrackedTimeFormatted ||
            formatDuration(
              reportData.totalTrackedTime
            ),

          "Productive Time":
            reportData.workingTimeFormatted ||
            formatDuration(
              reportData.workingTime
            ),

          "Non-Productive Time":
            reportData.nonProductiveTimeFormatted ||
            formatDuration(
              reportData.nonProductiveTime
            ),

          "Idle Time":
            reportData.idleTimeFormatted ||
            formatDuration(
              reportData.idleTime
            ),

          "Productivity":
            `${productivity}%`,

          "Expected Working Hours":
            `${reportData.expectedHours || 0} hrs`,

          "Sessions Recorded":
            reportData.sessionsCount || 0,

          "Progress Toward Expected":
            `${Math.round(
              reportData.progressPercentage || 0
            )}%`,

          "Week Start":
            reportData.weekStart || "",

          "Week End":
            reportData.weekEnd || "",

          "Month":
            reportData.month || "",
        },
      ];

      const worksheet =
        XLSX.utils.json_to_sheet(
          reportRows
        );

      worksheet["!cols"] = [
        { wch: 25 },
        { wch: 25 },
        { wch: 22 },
        { wch: 22 },
        { wch: 25 },
        { wch: 18 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Report"
      );

      const fileName =
        `Time-Tracking-${reportType}-${selectedDate}.xlsx`;

      XLSX.writeFile(
        workbook,
        fileName
      );

      toast.success(
        "Report downloaded successfully"
      );
    } catch (error) {
      console.error(
        "Excel download error:",
        error
      );

      toast.error(
        "Could not download report"
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="reports-page">

      <div className="page-header animate-in">

        <div>

          <div className="page-title-row">

            <h1>
              Reports
            </h1>

          </div>

          <p>
            Analyze your working time
            and productivity
          </p>

        </div>

        {reportData && (
          <button
            className="report-download-button"
            onClick={downloadExcel}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <span className="button-spinner"></span>
                Preparing...
              </>
            ) : (
              <>
                <span className="download-icon">
                  ↓
                </span>
                Download Excel
              </>
            )}
          </button>
        )}

      </div>



      <div className="report-controls animate-card">

        <div className="report-tabs">

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
              className={`report-tab ${
                reportType === type
                  ? "active"
                  : ""
              }`}
            >
              {type}
            </button>

          ))}

        </div>

        <div className="date-control">

          <label>
            Date
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

      </div>


      {loading ? (

        <div className="loading-card">

          <div className="loader-spinner"></div>

          <p>
            Loading report...
          </p>

        </div>

      ) : reportData ? (

        <>


          <div className="metrics-grid">

            <ReportMetric
              label="Total Tracked"
              value={
                reportData.totalTrackedTimeFormatted ||
                formatDuration(
                  reportData.totalTrackedTime
                )
              }
            />

            <ReportMetric
              label="Productive Time"
              value={
                reportData.workingTimeFormatted ||
                formatDuration(
                  reportData.workingTime
                )
              }
              variant="success"
            />

            <ReportMetric
              label="Non-Productive"
              value={
                reportData.nonProductiveTimeFormatted ||
                formatDuration(
                  reportData.nonProductiveTime
                )
              }
              variant="danger"
            />

            <ReportMetric
              label="Idle Time"
              value={
                reportData.idleTimeFormatted ||
                formatDuration(
                  reportData.idleTime
                )
              }
              variant="warning"
            />

            <ReportMetric
              label="Productivity"
              value={`${productivity}%`}
              variant="success"
            />

          </div>


          <section className="dashboard-card report-summary animate-card">

            <div className="card-header">

              <div>

                <h2>
                  {reportType
                    .charAt(0)
                    .toUpperCase() +
                    reportType.slice(1)}{" "}
                  Summary
                </h2>

                <p>
                  Detailed performance
                  information
                </p>

              </div>

            </div>

            <div className="summary-grid">

              <SummaryItem
                label="Target Period"
                value={
                  reportData.weekStart
                    ? `${reportData.weekStart} → ${reportData.weekEnd}`
                    : reportData.month ||
                      reportData.date ||
                      selectedDate
                }
              />

              <SummaryItem
                label="Expected Working Hours"
                value={`${reportData.expectedHours || 0} hrs`}
              />

              <SummaryItem
                label="Sessions Recorded"
                value={
                  reportData.sessionsCount ||
                  0
                }
              />

              <SummaryItem
                label="Progress Toward Expected"
                value={`${Math.round(
                  reportData.progressPercentage ||
                    0
                )}%`}
              />

            </div>

          </section>

        </>

      ) : (

        <div className="empty-card animate-card">

          <div className="empty-icon">
            ▤
          </div>

          <h3>
            No report data
          </h3>

          <p>
            No report data found for
            this selection.
          </p>

        </div>

      )}

    </div>
  );
}

function ReportMetric({
  label,
  value,
  variant = "",
}) {
  return (
    <div className="metric-card animate-card">

      <span className="metric-label">
        {label}
      </span>

      <strong
        className={`metric-value ${variant}`}
      >
        {value}
      </strong>

    </div>
  );
}

function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="summary-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}