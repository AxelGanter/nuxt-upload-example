// composables/usePageLogger.ts
import { ref } from 'vue';

// Ein reaktives Array, um die Log-Nachrichten zu speichern
const logs = ref<string[]>([]);
const MAX_LOGS = 100; // Maximale Anzahl an Logs (optional)

export const usePageLogger = () => {

    // Funktion zum Hinzufügen einer Log-Nachricht
    const addLog = (...args: any[]) => {
        // Argumente in einen String umwandeln (vereinfachte Formatierung)
        const message = args.map(arg => {
            if (arg instanceof Error) {
                return `Error: ${arg.message}`;
            }
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return '[Unserializable Object]';
                }
            }
            return String(arg);
        }).join(' ');

        // Zeitstempel hinzufügen und zum Array hinzufügen
        logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`);

        // Optional: Alte Logs entfernen, wenn das Limit erreicht ist
        if (logs.value.length > MAX_LOGS) {
            logs.value.shift();
        }
    };

    // Funktion zum Löschen aller Logs
    const clearLogs = () => {
        logs.value = [];
    };

    // Das reaktive Array und die Funktionen zurückgeben
    return { logs, addLog, clearLogs };
};