import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import api from "../api/axios";

import {
  useAuth,
} from "../contexts/AuthContext";

const TeamReport = () => {
  const {
    isManager,
  } = useAuth();

  const [
    date,
    setDate,
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  const [
    data,
    setData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  useEffect(() => {
    if (isManager) {
      fetchReport();
    }
  }, [date, isManager]);

  const fetchReport = async () => {
    setLoading(true);

    try {
      const response =
        await api.get(
          `/reports/team?date=${date}`
        );

      setData(
        response.data.data
      );
    } catch (error) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isManager) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <div className="team-page">

      <div className="page-header animate-in">

        <div>

          <h1>
            Employees
          </h1>

          <p>
            Monitor team productivity
            and working time
          </p>

        </div>

      </div>

      <div className="report-controls animate-card">

        <div className="date-control">

          <label>
            Report Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value
              )
            }
          />

        </div>

        <button
          onClick={fetchReport}
          className="refresh-button"
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>

      {loading ? (

        <div className="loading-card">

          <div className="loader-spinner"></div>

          <p>
            Loading team report...
          </p>

        </div>

      ) : data ? (

        <>

          <div className="team-stat-grid">

            <TeamStat
              label="Team Size"
              value={
                data.teamSize || 0
              }
            />

            <TeamStat
              label="Average Productivity"
              value={`${(
                data.averages
                  ?.productivityPercentage ||
                0
              ).toFixed(1)}%`}
              variant="success"
            />

            <TeamStat
              label="Average Tracked Time"
              value={
                data.averages
                  ?.totalTrackedTimeFormatted ||
                "00:00:00"
              }
            />

          </div>


          <section className="history-card animate-card">

            <div className="table-header">

              <div>

                <h2>
                  Team Performance
                </h2>

                <p>
                  Employee productivity
                  for {date}
                </p>

              </div>

            </div>

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Employee
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
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

                  {data.teamMembers
                    ?.length > 0 ? (

                    data.teamMembers.map(
                      (member) => (

                        <tr
                          key={
                            member
                              .employee
                              ?.id
                          }
                        >

                          <td>

                            <div className="employee-cell">

                              <div className="employee-avatar">

                                {member.employee?.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "U"}

                              </div>

                              <strong>
                                {member
                                  .employee
                                  ?.name ||
                                  "-"}
                              </strong>

                            </div>

                          </td>

                          <td>
                            {member
                              .employee
                              ?.email ||
                              "-"}
                          </td>

                          <td>
                            {member
                              .employee
                              ?.role ||
                              "-"}
                          </td>

                          <td>

                            <span className="percentage-value">
                              {member.productivityPercentage !==
                              undefined
                                ? `${member.productivityPercentage.toFixed(
                                    1
                                  )}%`
                                : "-"}
                            </span>

                          </td>

                          <td>

                            {member.progressPercentage !==
                            undefined
                              ? `${member.progressPercentage.toFixed(
                                  1
                                )}%`
                              : "-"}

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="table-empty"
                      >
                        No employees found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </>

      ) : (

        <div className="empty-card animate-card">

          <div className="empty-icon">
            ♧
          </div>

          <h3>
            No team data
          </h3>

          <p>
            No team data available
            for this date.
          </p>

        </div>

      )}

    </div>
  );
};

function TeamStat({
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

export default TeamReport;