import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import {
  ConnectContactLensClient,
  ListRealtimeContactAnalysisSegmentsCommand,
} from '@aws-sdk/client-connect-contact-lens';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());

const angularApp = new AngularNodeAppEngine();

// ── Contact Lens client ────────────────────────────────────────────────────────
const contactLensClient = new ConnectContactLensClient({
  region: process.env['AWS_REGION'] || 'us-east-1',
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY']!,
  },
});

const INSTANCE_ID = process.env['CONNECT_INSTANCE_ID']!;

// Active polling intervals keyed by contactId
const activePolls = new Map<string, ReturnType<typeof setInterval>>();
// Segment IDs already broadcast, keyed by contactId (avoids re-sending)
const sentSegments = new Map<string, Set<string>>();
// Connected WebSocket clients
const wsClients = new Set<WebSocket>();

function broadcast(data: object): void {
  const json = JSON.stringify(data);
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// ── REST: start transcript polling ────────────────────────────────────────────
app.post('/api/start-transcript', (req, res) => {
  const { contactId } = req.body as { contactId: string };
  if (!contactId) {
    res.status(400).json({ error: 'contactId required' });
    return;
  }
  if (activePolls.has(contactId)) {
    res.json({ status: 'already polling' });
    return;
  }

  sentSegments.set(contactId, new Set());

  const interval = setInterval(async () => {
    try {
      const response = await contactLensClient.send(
        new ListRealtimeContactAnalysisSegmentsCommand({
          InstanceId: INSTANCE_ID,
          ContactId: contactId,
          MaxResults: 100,
        }),
      );

      const seen = sentSegments.get(contactId)!;
      for (const segment of response.Segments ?? []) {
        const t = segment.Transcript;
        if (t && t.Id && !seen.has(t.Id)) {
          seen.add(t.Id);
          broadcast({
            type: 'transcript',
            speaker: t.ParticipantRole, // 'AGENT' | 'CUSTOMER' | 'SYSTEM'
            text: t.Content,
          });
        }
      }
    } catch (err) {
      console.error('[Contact Lens] Polling error:', err);
    }
  }, 2000);

  activePolls.set(contactId, interval);
  console.log(`[Contact Lens] Started polling for contact: ${contactId}`);
  res.json({ status: 'started' });
});

// ── REST: stop transcript polling ─────────────────────────────────────────────
app.post('/api/stop-transcript', (req, res) => {
  const { contactId } = req.body as { contactId: string };
  if (contactId && activePolls.has(contactId)) {
    clearInterval(activePolls.get(contactId)!);
    activePolls.delete(contactId);
    sentSegments.delete(contactId);
    console.log(`[Contact Lens] Stopped polling for contact: ${contactId}`);
  }
  res.json({ status: 'stopped' });
});

// ── Serve static files from /browser ──────────────────────────────────────────
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ── Handle all other requests via Angular SSR ─────────────────────────────────
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// ── Start server ──────────────────────────────────────────────────────────────
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  const httpServer = createServer(app);

  // Attach WebSocket server to the same http.Server instance
  const wss = new WebSocketServer({ server: httpServer });
  wss.on('connection', (ws) => {
    wsClients.add(ws);
    ws.on('close', () => wsClients.delete(ws));
  });

  httpServer.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (dev-server and during build)
 * or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
