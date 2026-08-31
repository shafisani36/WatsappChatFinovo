import {
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const SessionHistory = () => {
  const [
    sessions,
    setSessions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    total,
    setTotal,
  ] = useState(0);

  const limit = 20;

  const [
    offset,
    setOffset,
  ] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [offset]);

  const fetchHistory = async () => {
    setLoading(true);

    try {
      const response =
        await api.get(
          `/sessions/history?limit=${limit}&offset=${offset}`
        );

      setSessions(
        response.data.data.sessions ||
          []
      );

      setTotal(
        response.data.data.total ||
          0
      );
    } catch (error) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "ACTIVE":
        return "badge badge-active";

      case "PAUSED":
        return "badge badge-paused";

      case "COMPLETED":
        return "badge badge-completed";

      default:
        return "badge badge-completed";
    }
  };

  const totalPages =
    Math.ceil(total / limit);

  const currentPage =
    Math.floor(offset / limit) + 1;

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setOffset(
      (page - 1) * limit
    );
  };

  return (
    <div className="history-page">

      <div className="page-header animate-in">

        <div>

          <h1>
            Session History
          </h1>

          <p>
            Review your previous
            working sessions
          </p>

        </div>

      </div>

      {loading ? (

        <div className="loading-card">

          <div className="loader-spinner"></div>

          <p>
            Loading sessions...
          </p>

        </div>

      ) : sessions.length === 0 ? (

        <div className="empty-card animate-card">

          <div className="empty-icon">
            ◷
          </div>

          <h3>
            No session history
          </h3>

          <p>
            Your tracked sessions
            will appear here.
          </p>

        </div>

      ) : (

        <div className="history-card animate-card">

          <div className="table-header">

            <div>

              <h2>
                Your Sessions
              </h2>

              <p>
                {total} total sessions
              </p>

            </div>

          </div>

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Start
                  </th>

                  <th>
                    End
                  </th>

                  <th>
                    Duration
                  </th>

                  <th>
                    Working Time
                  </th>

                  <th>
                    Productivity
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {sessions.map(
                  (session) => (

                    <tr
                      key={
                        session.id
                      }
                    >

                      <td>
                        {new Date(
                          session.startedAt
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        {new Date(
                          session.startedAt
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </td>

                      <td>
                        {session.endedAt
                          ? new Date(
                              session.endedAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )
                          : "-"}
                      </td>

                      <td>
                        {session.totalTrackedTimeFormatted ||
                          "-"}
                      </td>

                      <td>
                        {session.workingTimeFormatted ||
                          "-"}
                      </td>

                      <td>
                        {session.productivityPercentage !==
                        undefined
                          ? `${session.productivityPercentage.toFixed(
                              1
                            )}%`
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            session.status
                          )}
                        >
                          {session.status}
                        </span>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {totalPages > 1 && (

            <div className="pagination">

              <span>
                Showing{" "}
                {offset + 1} -{" "}
                {Math.min(
                  offset + limit,
                  total
                )}{" "}
                of {total}
              </span>

              <div className="pagination-controls">

                <button
                  onClick={() =>
                    goToPage(
                      currentPage - 1
                    )
                  }
                  disabled={
                    currentPage === 1
                  }
                >
                  Previous
                </button>

                <span>
                  Page{" "}
                  {currentPage}{" "}
                  of{" "}
                  {totalPages}
                </span>

                <button
                  onClick={() =>
                    goToPage(
                      currentPage + 1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                >
                  Next
                </button>

              </div>

            </div>

          )}

        </div>

      )}

    </div>
  );
};

export default SessionHistory;