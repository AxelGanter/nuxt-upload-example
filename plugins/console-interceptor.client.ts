// plugins/console-interceptor.client.ts
import { usePageLogger } from '~/composables/usePageLogger';

export default defineNuxtPlugin(() => {
    // Nur im Browser ausführen (ist durch .client.ts sichergestellt)
    if (process.client) {
        const { addLog } = usePageLogger();
        const originalLog = console.log; // Originale Funktion speichern

        // console.log überschreiben
        console.log = (...args: any[]) => {
            // 1. Log zur Anzeige auf der Seite hinzufügen
            addLog(...args);

            // 2. Originale console.log aufrufen (für die Entwicklerkonsole)
            originalLog.apply(console, args);
        };

        // Optional: Dasselbe für console.error, console.warn etc. tun
        // const originalError = console.error;
        // console.error = (...args: any[]) => {
        //     addLog('ERROR:', ...args); // Markieren als Fehler
        //     originalError.apply(console, args);
        // };
    }
});