import {
  decodeWebSocketEvents,
  encodeWebSocketEvents,
  WebSocketContext,
  WebSocketMessageFormat,
} from "@fanoutio/grip";
import { Publisher } from "@fastly/grip-compute-js";
import { GRIP_URL } from "./env";

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));
async function handleRequest(event) {
  const url = new URL(event.request.url);

  if (url.pathname === "/ws") {
    // Make sure we have a connection ID
    let cid = event.request.headers.get("connection-id");

    const msg = await event.request.text();
    const inEvents = decodeWebSocketEvents(msg);
    const wsContext = new WebSocketContext(cid, {}, inEvents);
    console.log(JSON.stringify(wsContext));

    let responseString = "";
    if (wsContext.isOpening()) {
      // Open the WebSocket and subscribe it to a channel:
      wsContext.accept();
      wsContext.subscribe("/ws");
      // The above commands made to the wsContext are buffered in the wsContext as "outgoing events".
      // Obtain them and write them to the response.
      const outEvents = wsContext.getOutgoingEvents();
      responseString += encodeWebSocketEvents(outEvents);

      // Set the headers required by the GRIP proxy:
      const headers = wsContext.toHeaders();
      return new Response(responseString, { status: 200, headers });
    }

    try {
      const messagesToPublish = [];
      while (wsContext.canRecv()) {
        let message;
        try {
          message = wsContext.recv();
          console.log("message " + message);
        } catch (e) {
          console.log("client disconnected");
          message = null;
        }

        if (message == null) {
          console.log("client closed");
          wsContext.close();
        }

        messagesToPublish.push({
          channel: "/ws",
          messageFormat: new WebSocketMessageFormat(message),
        });

        if (messagesToPublish.length > 0) {
          console.log("Publishing " + messagesToPublish.length + " message(s)");
          const publisher = new Publisher(GRIP_URL);

          for (const messageToPublish of messagesToPublish) {
            const { channel, messageFormat } = messageToPublish;
            await publisher.publishFormats(channel, messageFormat);
          }
        } else {
          console.log("No messages queued");
        }

        // Set the headers required by the GRIP proxy:
        const headers = wsContext.toHeaders();
        return new Response("", { status: 200, headers });
      }
    } catch ({ message, context }) {
      console.log("Returning 500...");
      return new Response(
        "Publish failed!\n" + message + "\n" + JSON.stringify(context, null, 2) + "\n",
        { status: 500, headers: { "Content-Type": "text/plain" } }
      );
    }
  }
  console.log("Returning 404...");
  return new Response("Not found.\n", { status: 404, headers: { "Content-Type": "text/plain" } });
}
