import { useEffect, useRef, useState } from "react";
import {
Video,
Search,
Filter,
Play,
Calendar,
Clock,
Monitor,
MoreVertical,
X,
Square,
} from "lucide-react";

function VideoRecordings() {
const [search, setSearch] = useState("");
const [recordings, setRecordings] = useState([]);
const [selectedRecording, setSelectedRecording] = useState(null);
const [isRecording, setIsRecording] = useState(false);
const [loading, setLoading] = useState(false);
const [uploading, setUploading] = useState(false);
const [error, setError] = useState("");

const mediaRecorderRef = useRef(null);
const streamRef = useRef(null);
const chunksRef = useRef([]);
const startTimeRef = useRef(null);

const token = localStorage.getItem("token");

const fetchRecordings = async () => {
try {
setLoading(true);
setError("");

  const response = await fetch(
    "http://localhost:5000/api/recordings",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Failed to load recordings");
    return;
  }

  setRecordings(data.recordings || []);
} catch (error) {
  console.error("Fetch Recordings Error:", error);
  setError("Unable to connect to the server");
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchRecordings();


return () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => {
      track.stop();
    });
  }
};

}, []);

const startRecording = async () => {
try {
setError("");


  if (!token) {
    setError("Please login first.");
    return;
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });

  streamRef.current = stream;
  chunksRef.current = [];
  startTimeRef.current = Date.now();

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorderRef.current = mediaRecorder;

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunksRef.current, {
      type: "video/webm",
    });

    const duration = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );

    await uploadRecording(blob, duration);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    streamRef.current = null;
  };

  stream.getVideoTracks()[0].addEventListener("ended", () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  });

  mediaRecorder.start();

  setIsRecording(true);
} catch (error) {
  console.error("Start Recording Error:", error);

  if (error.name === "NotAllowedError") {
    setError("Screen recording permission was cancelled.");
  } else {
    setError("Unable to start screen recording.");
  }
}

};

const stopRecording = () => {
if (
mediaRecorderRef.current &&
mediaRecorderRef.current.state === "recording"
) {
mediaRecorderRef.current.stop();
setIsRecording(false);
}
};

const uploadRecording = async (blob, duration) => {
try {
setUploading(true);
setError("");


  const formData = new FormData();

  const file = new File(
    [blob],
    `screen-recording-${Date.now()}.webm`,
    {
      type: "video/webm",
    }
  );

  formData.append("video", file);

  const response = await fetch(
    "http://localhost:5000/api/recordings/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Failed to upload recording");
    return;
  }

  console.log("Upload Recording Response:", data);

  await fetchRecordings();
} catch (error) {
  console.error("Upload Recording Error:", error);
  setError("Unable to upload recording.");
} finally {
  setUploading(false);
}

};

const formatDuration = (seconds) => {
if (!seconds) {
return "00:00";
}


const hours = Math.floor(seconds / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
const secs = seconds % 60;

if (hours > 0) {
  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

return `${String(minutes).padStart(2, "0")}:${String(
  secs
).padStart(2, "0")}`;

};

const formatDate = (date) => {
return new Date(date).toLocaleString();
};

const filteredRecordings = recordings.filter((recording) =>
recording.fileName.toLowerCase().includes(search.toLowerCase())
);

return ( <div className="space-y-6">

  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Video Recordings
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Record and review employee screen activity.
      </p>
    </div>

    {!isRecording ? (
      <button
        onClick={startRecording}
        disabled={uploading}
        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Video className="h-4 w-4" />
        Start Recording
      </button>
    ) : (
      <button
        onClick={stopRecording}
        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        <Square className="h-4 w-4" />
        Stop Recording
      </button>
    )}
  </div>

  {isRecording && (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
      Screen recording is active
    </div>
  )}

  {uploading && (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      Uploading recording...
    </div>
  )}

  {error && (
    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
      {error}
    </div>
  )}

  <div className="grid gap-5 md:grid-cols-3">
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">
        Total Recordings
      </p>

      <h2 className="mt-2 text-3xl font-bold text-slate-900">
        {recordings.length}
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        Your recordings
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">
        Recorded Today
      </p>

      <h2 className="mt-2 text-3xl font-bold text-slate-900">
        {recordings.filter((recording) => {
          const today = new Date().toDateString();
          return (
            new Date(recording.createdAt).toDateString() === today
          );
        }).length}
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        Sessions recorded today
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">
        Status
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        {isRecording ? "Recording" : "Ready"}
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        Recording system status
      </p>
    </div>
  </div>

  <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row">
    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
      <Search className="h-5 w-5 text-slate-400" />

      <input
        type="text"
        placeholder="Search recordings..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full py-3 text-sm outline-none"
      />
    </div>

    <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
      <Filter className="h-4 w-4" />
      Filter
    </button>
  </div>

  {loading ? (
    <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
      <p className="text-sm text-slate-500">
        Loading recordings...
      </p>
    </div>
  ) : filteredRecordings.length === 0 ? (
    <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
      <Video className="mx-auto h-10 w-10 text-slate-300" />

      <h3 className="mt-4 font-semibold text-slate-900">
        No recordings found
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Click Start Recording to create your first recording.
      </p>
    </div>
  ) : (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {filteredRecordings.map((recording) => {
        const videoUrl = `http://localhost:5000${recording.filePath}`;

        return (
          <div
            key={recording.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-lg"
          >
            <div className="relative flex h-44 items-center justify-center bg-slate-900">
              <Monitor className="h-12 w-12 text-slate-500" />

              <button
                onClick={() => setSelectedRecording(recording)}
                className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 transition hover:scale-105"
              >
                <Play className="ml-1 h-6 w-6 fill-current" />
              </button>

              <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-xs font-medium text-white">
                {formatDuration(recording.duration)}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {recording.fileName
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Screen Recording
                    </h3>

                    <p className="max-w-48 truncate text-xs text-slate-500">
                      {recording.fileName}
                    </p>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(recording.createdAt)}
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(recording.duration)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}

  {selectedRecording && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Screen Recording
            </h2>

            <p className="text-sm text-slate-500">
              {selectedRecording.fileName}
            </p>
          </div>

          <button
            onClick={() => setSelectedRecording(null)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-slate-950">
          <video
            src={`http://localhost:5000${selectedRecording.filePath}`}
            controls
            autoPlay
            className="aspect-video w-full"
          />
        </div>

        <div className="flex items-center justify-between p-5">
          <div>
            <p className="font-semibold text-slate-900">
              Recording
            </p>

            <p className="text-sm text-slate-500">
              Duration: {formatDuration(selectedRecording.duration)}
            </p>
          </div>

          <button
            onClick={() => setSelectedRecording(null)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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

export default VideoRecordings;