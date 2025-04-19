import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

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

  const getStatusIcon = () => {
    switch (currentStatus) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-[#F44336]" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusClasses = () => {
    switch (currentStatus) {
      case "success":
        return "bg-[#4CAF50]/10 border-[#4CAF50]/20 text-[#4CAF50]";
      case "error":
        return "bg-[#F44336]/10 border-[#F44336]/20 text-[#F44336]";
      default:
        return "bg-gray-100 border-gray-200 text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      default:
        return "Ready";
    }
  };

  return (
    <div className={`flex items-center justify-between rounded-md p-3 text-sm border ${getStatusClasses()}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <div>
          <div className="font-medium">{getStatusText()}</div>
          <div className="text-xs opacity-80">{currentMessage}</div>
        </div>
      </div>
      {lastTestedTime && (
        <div className="text-xs opacity-70 flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          {formatTime(lastTestedTime)}
        </div>
      )}
    </div>
  );
}
