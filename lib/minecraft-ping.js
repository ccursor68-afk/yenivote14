// Minecraft Server Ping Utility
// Pings Minecraft servers to get player count and status

import net from 'net';

// Varint helper functions
function writeVarInt(value) {
  const bytes = [];
  while ((value & ~0x7F) !== 0) {
    bytes.push((value & 0x7F) | 0x80);
    value >>>= 7;
  }
  bytes.push(value);
  return Buffer.from(bytes);
}

function readVarInt(buffer, offset = 0) {
  let result = 0;
  let shift = 0;
  let byte;
  let bytesRead = 0;
  
  do {
    if (offset + bytesRead >= buffer.length) {
      return { value: result, bytesRead };
    }
    byte = buffer[offset + bytesRead];
    result |= (byte & 0x7F) << shift;
    shift += 7;
    bytesRead++;
  } while ((byte & 0x80) !== 0);
  
  return { value: result, bytesRead };
}

// Ping Minecraft server
export async function pingMinecraftServer(host, port = 25565, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let hasResolved = false;
    
    const resolveOnce = (result) => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve(result);
      }
    };
    
    socket.setTimeout(timeout);
    
    socket.on('timeout', () => {
      resolveOnce({
        online: false,
        error: 'Connection timeout',
        playerCount: 0,
        maxPlayers: 0,
        latency: null
      });
    });
    
    socket.on('error', (err) => {
      resolveOnce({
        online: false,
        error: err.message,
        playerCount: 0,
        maxPlayers: 0,
        latency: null
      });
    });
    
    socket.connect(port, host, () => {
      try {
        // Create handshake packet
        const hostBuffer = Buffer.from(host, 'utf8');
        const handshakeData = Buffer.concat([
          writeVarInt(0x00), // Packet ID
          writeVarInt(754), // Protocol version (1.16.5)
          writeVarInt(hostBuffer.length),
          hostBuffer,
          Buffer.from([(port >> 8) & 0xFF, port & 0xFF]), // Port as unsigned short
          writeVarInt(1) // Next state: Status
        ]);
        
        const handshakePacket = Buffer.concat([
          writeVarInt(handshakeData.length),
          handshakeData
        ]);
        
        // Create status request packet
        const statusRequestData = writeVarInt(0x00);
        const statusRequestPacket = Buffer.concat([
          writeVarInt(statusRequestData.length),
          statusRequestData
        ]);
        
        socket.write(Buffer.concat([handshakePacket, statusRequestPacket]));
      } catch (err) {
        resolveOnce({
          online: false,
          error: err.message,
          playerCount: 0,
          maxPlayers: 0,
          latency: null
        });
      }
    });
    
    let dataBuffer = Buffer.alloc(0);
    
    socket.on('data', (data) => {
      try {
        dataBuffer = Buffer.concat([dataBuffer, data]);
        
        // Try to parse response
        const { value: packetLength, bytesRead: lenBytes } = readVarInt(dataBuffer, 0);
        
        if (dataBuffer.length >= packetLength + lenBytes) {
          const { bytesRead: idBytes } = readVarInt(dataBuffer, lenBytes);
          const { value: jsonLength, bytesRead: jsonLenBytes } = readVarInt(dataBuffer, lenBytes + idBytes);
          
          const jsonStart = lenBytes + idBytes + jsonLenBytes;
          const jsonData = dataBuffer.slice(jsonStart, jsonStart + jsonLength).toString('utf8');
          
          const latency = Date.now() - startTime;
          
          try {
            const response = JSON.parse(jsonData);
            resolveOnce({
              online: true,
              playerCount: response.players?.online || 0,
              maxPlayers: response.players?.max || 0,
              version: response.version?.name || 'Unknown',
              description: typeof response.description === 'string' 
                ? response.description 
                : response.description?.text || '',
              latency,
              favicon: response.favicon || null
            });
          } catch (parseErr) {
            resolveOnce({
              online: true,
              playerCount: 0,
              maxPlayers: 0,
              latency,
              error: 'Failed to parse response'
            });
          }
        }
      } catch (err) {
        resolveOnce({
          online: false,
          error: err.message,
          playerCount: 0,
          maxPlayers: 0,
          latency: null
        });
      }
    });
    
    // Fallback timeout
    setTimeout(() => {
      resolveOnce({
        online: false,
        error: 'Request timeout',
        playerCount: 0,
        maxPlayers: 0,
        latency: null
      });
    }, timeout + 1000);
  });
}

export default pingMinecraftServer;
