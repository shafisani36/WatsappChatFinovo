import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../api/axios";

const RecordingContext = createContext(null);

export function RecordingProvider({ children }) {
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const recordingTimerRef = useRef(null);



  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  };



  const startTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    recordingStartTimeRef.current = Date.now();

    setRecordingSeconds(0);

    recordingTimerRef.current = setInterval(() => {
      if (!recordingStartTimeRef.current) {
        return;
      }

      const elapsed = Math.floor(
        (Date.now() - recordingStartTimeRef.current) / 1000
      );

      setRecordingSeconds(elapsed);
    }, 1000);
  };


  const stopTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);

      recordingTimerRef.current = null;
    }
  };



  const uploadRecording = async (blob, durationSeconds) => {
    try {
      setUploading(true);
      setError("");

      const formData = new FormData();

      const file = new File(
        [blob],
        `recording-${Date.now()}.webm`,
        {
          type: "video/webm",
        }
      );

      formData.append("video", file);

      formData.append(
        "duration",
        String(durationSeconds)
      );

      await api.post(
        "/recordings/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error(
        "Upload recording error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to upload recording."
      );
    } finally {
      setUploading(false);
    }
  };


  const startRecording = async () => {
    try {
      setError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getDisplayMedia
      ) {
        setError(
          "Screen recording is not supported by this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: 30,
          },
          audio: true,
        });

      streamRef.current = stream;

      chunksRef.current = [];


      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];

      const supportedMimeType =
        mimeTypes.find((type) =>
          MediaRecorder.isTypeSupported(type)
        );

      const recorder = supportedMimeType
        ? new MediaRecorder(stream, {
            mimeType: supportedMimeType,
          })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

   

      recorder.ondataavailable = (event) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          chunksRef.current.push(event.data);
        }
      };

  

      recorder.onstop = async () => {
        const durationSeconds =
          recordingStartTimeRef.current
            ? Math.floor(
                (Date.now() -
                  recordingStartTimeRef.current) /
                  1000
              )
            : 0;

        stopTimer();

        const blob = new Blob(
          chunksRef.current,
          {
            type:
              recorder.mimeType ||
              "video/webm",
          }
        );

        stopStream();

        mediaRecorderRef.current = null;

        chunksRef.current = [];

        recordingStartTimeRef.current = null;

        setRecordingSeconds(0);

        setIsRecording(false);


        if (blob.size > 0) {
          await uploadRecording(
            blob,
            durationSeconds
          );
        }
      };



      const videoTrack =
        stream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.onended = () => {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state ===
              "recording"
          ) {
            mediaRecorderRef.current.stop();
          }
        };
      }


      recorder.start(1000);

      setIsRecording(true);

      startTimer();

    } catch (error) {
      console.error(
        "Start recording error:",
        error
      );

      stopStream();

      stopTimer();

      setIsRecording(false);

      if (
        error.name === "NotAllowedError"
      ) {
        setError(
          "Screen sharing permission was cancelled."
        );
      } else {
        setError(
          error.message ||
            "Unable to start screen recording."
        );
      }
    }
  };



  const stopRecording = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state ===
          "recording"
      ) {
        mediaRecorderRef.current.stop();
      } else {
        stopStream();

        stopTimer();

        setIsRecording(false);
      }
    } catch (error) {
      console.error(
        "Stop recording error:",
        error
      );

      stopStream();

      stopTimer();

      setIsRecording(false);
    }
  };


  const clearError = () => {
    setError("");
  };
  useEffect(() => {
    return () => {

      stopTimer();

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state ===
          "recording"
      ) {
        mediaRecorderRef.current.stop();
      }

      stopStream();
    };
  }, []);

  return (
    <RecordingContext.Provider
      value={{
        isRecording,
        uploading,
        recordingSeconds,
        error,

        startRecording,
        stopRecording,
        clearError,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context =
    useContext(RecordingContext);

  if (!context) {
    throw new Error(
      "useRecording must be used inside RecordingProvider"
    );
  }

  return context;
}