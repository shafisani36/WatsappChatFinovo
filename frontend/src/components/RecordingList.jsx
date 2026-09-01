import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getRecordings } from "../api/recording.api";

import "../assets/styles/VideoRecordings.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

export default function RecordingList() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setLoading(true);

      const response = await getRecordings();

      setRecordings(response?.data || []);
    } catch (error) {
      console.error(
        "Failed to load recordings:",
        error
      );

      toast.error("Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        Loading recordings...
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div>
        No recordings available.
      </div>
    );
  }

  return (
    <div>
      <h2>Recordings</h2>

      {recordings.map((recording) => {
        const videoUrl =
          `${SERVER_URL}${recording.filePath}`;

        return (
          <div
            key={recording.id}
            style={{
              marginBottom: "24px",
            }}
          >
            <p>
              {recording.fileName}
            </p>

            {recording.duration && (
              <p>
                Duration:{" "}
                {recording.duration} seconds
              </p>
            )}

            <video
              src={videoUrl}
              controls
              width="600"
            />

            <p>
              {new Date(
                recording.createdAt
              ).toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}