import { createFileRoute } from "@tanstack/react-router";
import disavowContent from "../../../../public/disavow.txt?raw";

export const Route = createFileRoute("/api/public/disavow")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(disavowContent, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": 'attachment; filename="disavow.txt"',
          },
        });
      },
    },
  },
});
