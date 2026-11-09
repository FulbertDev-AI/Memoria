import { createServer, type Socket } from "node:net";

export class SmtpSink {
  readonly messages: string[] = [];
  private readonly server = createServer((socket) => this.handle(socket));

  async listen(): Promise<number> {
    await new Promise<void>((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(0, "127.0.0.1", () => {
        this.server.removeListener("error", reject);
        resolve();
      });
    });
    const address = this.server.address();
    if (!address || typeof address === "string") {
      throw new Error("Le serveur SMTP de test n’a pas obtenu de port local.");
    }
    return address.port;
  }

  async close(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  private handle(socket: Socket) {
    socket.setEncoding("utf8");
    socket.write("220 localhost Memooria test mail sink\r\n");
    let buffered = "";
    let inData = false;
    let currentMessage: string[] = [];

    socket.on("data", (chunk: string) => {
      buffered += chunk;
      let end = buffered.indexOf("\r\n");
      while (end >= 0) {
        const line = buffered.slice(0, end);
        buffered = buffered.slice(end + 2);

        if (inData) {
          if (line === ".") {
            inData = false;
            this.messages.push(currentMessage.join("\r\n"));
            currentMessage = [];
            socket.write("250 2.0.0 Message accepted for test capture\r\n");
          } else {
            currentMessage.push(line.startsWith("..") ? line.slice(1) : line);
          }
        } else {
          const command = line.split(" ", 1)[0]?.toUpperCase();
          if (command === "EHLO" || command === "HELO") {
            socket.write("250-localhost\r\n250 AUTH PLAIN LOGIN\r\n");
          } else if (command === "AUTH") {
            socket.write("235 2.7.0 Authentication successful\r\n");
          } else if (command === "MAIL" || command === "RCPT" || command === "RSET") {
            socket.write("250 2.1.0 OK\r\n");
          } else if (command === "DATA") {
            inData = true;
            socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
          } else if (command === "QUIT") {
            socket.write("221 2.0.0 Closing connection\r\n");
            socket.end();
          } else {
            socket.write("250 2.0.0 OK\r\n");
          }
        }

        end = buffered.indexOf("\r\n");
      }
    });
  }
}

export function extractLink(message: string, pathPart: string): URL {
  const decoded = message
    .replace(/=\r?\n/g, "")
    .replace(/=([A-Fa-f0-9]{2})/g, (_match, byte: string) =>
      String.fromCharCode(Number.parseInt(byte, 16)),
    );
  const links = decoded.match(/https?:\/\/[^\s<>"']+/g) ?? [];
  const link = links
    .map((candidate) => candidate.replace(/[.,;)]$/, ""))
    .find((candidate) => candidate.includes(pathPart));
  if (!link) throw new Error(`Lien ${pathPart} introuvable dans le message SMTP de test.`);
  return new URL(link);
}
