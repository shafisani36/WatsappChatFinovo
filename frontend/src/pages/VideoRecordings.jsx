import {
  useEffect,
  useState,
} from "react";

import {
  Video,
  Search,
  Filter,
  Play,
  Calendar,
  Clock,
  Monitor,
  X,
  Loader2,
} from "lucide-react";

import api from "../api/axios";

import "../assets/styles/VideoRecordings.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const SERVER_URL =
  API_URL.replace(/\/api\/?$/, "");

export default function VideoRecordings() {
  const [recordings, setRecordings] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedRecording, setSelectedRecording] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadRecordings();

    const interval =
      setInterval(
        loadRecordings,
        30000
      );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadRecordings = async () => {
    try {
      setError("");

      const response =
        await api.get(
          "/recordings"
        );

      const data =
        response.data?.data ||
        response.data?.recordings ||
        [];

      setRecordings(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load recordings:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load recordings."
      );
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (
    recording
  ) => {
    if (
      !recording?.filePath
    ) {
      return "";
    }

    if (
      recording.filePath.startsWith(
        "http://"
      ) ||
      recording.filePath.startsWith(
        "https://"
      )
    ) {
      return recording.filePath;
    }

    return `${SERVER_URL}${recording.filePath}`;
  };

  const formatDuration = (
    seconds
  ) => {
    const total =
      Number(seconds) || 0;

    const hours =
      Math.floor(
        total / 3600
      );

    const minutes =
      Math.floor(
        (total % 3600) / 60
      );

    const secs =
      total % 60;

    if (hours > 0) {
      return `${String(
        hours
      ).padStart(
        2,
        "0"
      )}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        secs
      ).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;
  };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(
      date
    ).toLocaleString();
  };

  const filteredRecordings =
    recordings.filter(
      (recording) =>
        String(
          recording.fileName || ""
        )
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const todayCount =
    recordings.filter(
      (recording) => {
        if (
          !recording.createdAt
        ) {
          return false;
        }

        return (
          new Date(
            recording.createdAt
          ).toDateString() ===
          new Date().toDateString()
        );
      }
    ).length;

  return (
    <div className="video-recordings-page">

      <div className="recordings-header">

        <div className="title-row">

          <div className="title-icon">
            <Video size={22} />
          </div>

          <div>
            <h1>
              Screen Recordings
            </h1>

            <p>
              Automatically captured
              desktop screen activity.
            </p>
          </div>

        </div>

      </div>

      {error && (
        <div className="error-box">
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            <Video size={20} />
          </div>

          <div>
            <span>
              Total Recordings
            </span>

            <strong>
              {recordings.length}
            </strong>

            <small>
              Automatically uploaded
            </small>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            <Calendar size={20} />
          </div>

          <div>
            <span>
              Recorded Today
            </span>

            <strong>
              {todayCount}
            </strong>

            <small>
              Recordings today
            </small>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            <Monitor size={20} />
          </div>

          <div>
            <span>
              System
            </span>

            <strong className="system-status">
              Automatic
            </strong>

            <small>
              Desktop agent recording
            </small>
          </div>

        </div>

      </div>

      <div className="search-section">

        <div className="search-box">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search recordings..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              <X size={15} />
            </button>
          )}

        </div>

        <button
          type="button"
          className="filter-button"
        >
          <Filter size={17} />
          Filter
        </button>

      </div>

      {loading ? (
        <div className="state-box">

          <Loader2
            size={36}
            className="spin"
          />

          <h3>
            Loading recordings...
          </h3>

          <p>
            Please wait while recordings
            are loaded.
          </p>

        </div>
      ) : filteredRecordings.length === 0 ? (
        <div className="state-box empty">

          <div className="empty-icon">
            <Video size={35} />
          </div>

          <h3>
            No recordings found
          </h3>

          <p>
            Recordings created by the
            desktop agent will appear here.
          </p>

        </div>
      ) : (
        <div className="recordings-grid">

          {filteredRecordings.map(
            (recording) => {

              const fileUrl =
                getFileUrl(
                  recording
                );

              return (
                <div
                  key={recording.id}
                  className="recording-card"
                >

                  <div className="recording-preview">

                    {fileUrl ? (
                      <video
                        src={fileUrl}
                        preload="metadata"
                      />
                    ) : (
                      <div className="no-preview">
                        <Video size={35} />
                      </div>
                    )}

                    <div className="preview-overlay">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRecording(
                            recording
                          )
                        }
                        className="play-button"
                      >
                        <Play
                          size={24}
                          fill="currentColor"
                        />
                      </button>

                    </div>

                    <span className="duration-badge">
                      {formatDuration(
                        recording.duration
                      )}
                    </span>

                  </div>

                  <div className="recording-details">

                    <div className="recording-name">

                      <div className="monitor-icon">
                        <Monitor size={18} />
                      </div>

                      <div>
                        <h3>
                          {recording.fileName ||
                            "Screen Recording"}
                        </h3>

                        <span>
                          Desktop screen recording
                        </span>
                      </div>

                    </div>

                    <div className="recording-meta">

                      <span>
                        <Calendar size={14} />

                        {formatDate(
                          recording.createdAt
                        )}
                      </span>

                      <span>
                        <Clock size={14} />

                        {formatDuration(
                          recording.duration
                        )}
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRecording(
                          recording
                        )
                      }
                      className="watch-button"
                    >
                      <Play
                        size={15}
                        fill="currentColor"
                      />

                      Watch Recording
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

      {selectedRecording && (
        <div
          className="recording-modal"
          onClick={() =>
            setSelectedRecording(null)
          }
        >

          <div
            className="modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Screen Recording
                </h2>

                <p>
                  {selectedRecording.fileName ||
                    "Screen Recording"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRecording(
                    null
                  )
                }
                className="modal-close"
              >
                <X size={21} />
              </button>

            </div>

            <div className="modal-video">

              <video
                src={getFileUrl(
                  selectedRecording
                )}
                controls
                autoPlay
              />

            </div>

            <div className="modal-footer">

              <div>

                <strong>
                  {selectedRecording.fileName ||
                    "Screen Recording"}
                </strong>

                <span>
                  {formatDate(
                    selectedRecording.createdAt
                  )}

                  {" • "}

                  {formatDuration(
                    selectedRecording.duration
                  )}
                </span>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRecording(
                    null
                  )
                }
                className="close-button"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}