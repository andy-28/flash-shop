import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

function getHubUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
  return `${apiUrl.replace(/\/api\/?$/, "")}/hubs/dashboard`;
}

export function useSignalR() {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connectionRef.current = connection;
    void connection
      .start()
      .then(() => setIsConnected(true))
      .catch((error) => {
        console.error("SignalR connection error", error);
        setIsConnected(false);
      });

    return () => {
      setIsConnected(false);
      connectionRef.current = null;
      void connection.stop();
    };
  }, [accessToken]);

  const on = useCallback((eventName: string, callback: (...args: unknown[]) => void) => {
    const connection = connectionRef.current;
    connection?.on(eventName, callback);
    return () => connection?.off(eventName, callback);
  }, []);

  return { isConnected, on, connection: connectionRef.current };
}
