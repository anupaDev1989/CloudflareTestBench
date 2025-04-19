import { useState, useEffect } from "react";

interface StatusPanelProps {
  status?: "success" | "error" | "idle";
  message?: string;
  time?: Date;
}

export default function StatusPanel({
  status = "idle",
  message = "Ready to test",
  time
}: StatusPanelProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [lastTestedTime, setLastTestedTime] = useState<Date | null>(time || null);

  // Subscribe to window-level custom events for status updates
  useEffect(() => {
    const updateStatus = (event: CustomEvent) => {
      const { status, message, time } = event.detail;
      setCurrentStatus(status);
      setCurrentMessage(message);
      if (time) setLastTestedTime(new Date(time));
    };

    window.addEventListener('workerStatusUpdate' as any, updateStatus);
    
    return () => {
      window.removeEventListener('workerStatusUpdate' as any, updateStatus);
    };
  }, []);

  // Listen for changes from props
  useEffect(() => {
    if (status !== currentStatus) setCurrentStatus(status);
    if (message !== currentMessage) setCurrentMessage(message);
    if (time && (!lastTestedTime || time.getTime() !== lastTestedTime.getTime())) {
      setLastTestedTime(time);
    }
  }, [status, message, time]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case "success":
        return "bg-[#4CAF50]";
      case "error":
        return "bg-[#F44336]";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex items-center justify-between rounded-md bg-[#F5F5F5] p-3 text-sm">
      <div className="flex items-center">
        <span 
          className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor()}`} 
        />
        <span>{currentMessage}</span>
      </div>
      {lastTestedTime && (
        <div className="text-gray-500">
          {formatTime(lastTestedTime)}
        </div>
      )}
    </div>
  );
}
