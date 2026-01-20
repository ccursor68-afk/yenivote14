import { createConnection } from 'net';
import crypto from 'crypto';

/**
 * NuVotifier Vote Sender
 * Sends votes to Minecraft servers using the NuVotifier protocol
 */

export class VotifierClient {
  constructor(host, port, publicKey, token = null) {
    this.host = host;
    this.port = port;
    this.publicKey = publicKey;
    this.token = token;
  }

  /**
   * Send a vote using NuVotifier v1 protocol (RSA encrypted)
   */
  async sendVoteV1(serviceName, username, address) {
    return new Promise((resolve, reject) => {
      const socket = createConnection(this.port, this.host);
      let dataReceived = false;

      socket.setTimeout(10000);

      socket.on('connect', () => {
        console.log(`Connected to votifier at ${this.host}:${this.port}`);
      });

      socket.on('data', (data) => {
        const response = data.toString();
        
        if (!dataReceived) {
          dataReceived = true;
          
          // Check for VOTIFIER header
          if (!response.startsWith('VOTIFIER')) {
            socket.end();
            reject(new Error('Invalid votifier response'));
            return;
          }

          // Build vote message
          const timestamp = Math.floor(Date.now() / 1000);
          const voteString = [
            'VOTE',
            serviceName,
            username,
            address,
            timestamp.toString()
          ].join('\n') + '\n';

          try {
            // Encrypt with RSA public key
            const encrypted = crypto.publicEncrypt(
              {
                key: this.publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
              },
              Buffer.from(voteString)
            );

            socket.write(encrypted);
            
            // Close after sending
            setTimeout(() => {
              socket.end();
              resolve({ success: true, protocol: 'v1' });
            }, 500);
          } catch (err) {
            socket.end();
            reject(new Error(`Encryption failed: ${err.message}`));
          }
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });

      socket.on('error', (err) => {
        reject(new Error(`Socket error: ${err.message}`));
      });

      socket.on('close', () => {
        if (!dataReceived) {
          reject(new Error('Connection closed before receiving data'));
        }
      });
    });
  }

  /**
   * Send a vote using NuVotifier v2 protocol (JSON + HMAC)
   */
  async sendVoteV2(serviceName, username, address) {
    if (!this.token) {
      throw new Error('Token required for NuVotifier v2 protocol');
    }

    return new Promise((resolve, reject) => {
      const socket = createConnection(this.port, this.host);

      socket.setTimeout(10000);

      socket.on('connect', () => {
        console.log(`Connected to votifier v2 at ${this.host}:${this.port}`);
      });

      socket.on('data', (data) => {
        const response = data.toString();

        if (response.startsWith('VOTIFIER 2')) {
          // Extract challenge from response
          const parts = response.split(' ');
          const challenge = parts[2]?.trim();

          if (!challenge) {
            socket.end();
            reject(new Error('No challenge received'));
            return;
          }

          // Build vote payload
          const timestamp = Date.now();
          const votePayload = {
            serviceName,
            username,
            address,
            timestamp,
            challenge
          };

          const payloadJson = JSON.stringify(votePayload);
          
          // Create HMAC signature
          const signature = crypto
            .createHmac('sha256', this.token)
            .update(payloadJson)
            .digest('base64');

          // Create message
          const message = JSON.stringify({
            signature,
            payload: payloadJson
          });

          // Send with length prefix (2 bytes, big-endian)
          const messageBuffer = Buffer.from(message, 'utf8');
          const lengthBuffer = Buffer.alloc(2);
          lengthBuffer.writeInt16BE(messageBuffer.length);

          const packet = Buffer.concat([lengthBuffer, messageBuffer]);
          socket.write(packet);

        } else if (response.includes('ok')) {
          socket.end();
          resolve({ success: true, protocol: 'v2' });
        } else {
          socket.end();
          reject(new Error(`Vote rejected: ${response}`));
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });

      socket.on('error', (err) => {
        reject(new Error(`Socket error: ${err.message}`));
      });
    });
  }

  /**
   * Auto-detect protocol and send vote
   */
  async sendVote(serviceName, username, address) {
    // Try v2 first if token is available, otherwise use v1
    if (this.token) {
      try {
        return await this.sendVoteV2(serviceName, username, address);
      } catch (err) {
        console.log('V2 failed, trying V1:', err.message);
      }
    }

    return await this.sendVoteV1(serviceName, username, address);
  }
}

export async function sendVotifierVote(server, username, voterIp) {
  if (!server.votifierHost || !server.votifierPort || !server.votifierPublicKey) {
    throw new Error('Votifier not configured for this server');
  }

  const client = new VotifierClient(
    server.votifierHost,
    server.votifierPort,
    server.votifierPublicKey,
    server.votifierToken
  );

  return client.sendVote('ServerListRank', username, voterIp);
}
