
package gr.hua.lego.protocol;

import java.util.Objects;

public record ProtocolMessage(
        String protocol,
        String version,
        MessageType type,
        String messageId,
        String sessionId,
        String senderId,
        long payloadLength
) {

    public ProtocolMessage {
        Objects.requireNonNull(protocol, "Protocol cannot be null");
        Objects.requireNonNull(version, "Version cannot be null");
        Objects.requireNonNull(type, "Message type cannot be null");
        Objects.requireNonNull(messageId, "Message ID cannot be null");
        Objects.requireNonNull(senderId, "Sender ID cannot be null");

        if (protocol.isBlank()) {
            throw new IllegalArgumentException("Protocol cannot be blank");
        }

        if (version.isBlank()) {
            throw new IllegalArgumentException("Version cannot be blank");
        }

        if (messageId.isBlank()) {
            throw new IllegalArgumentException("Message ID cannot be blank");
        }

        if (senderId.isBlank()) {
            throw new IllegalArgumentException("Sender ID cannot be blank");
        }

        if (payloadLength < 0) {
            throw new IllegalArgumentException(
                    "Payload length cannot be negative"
            );
        }
    }
}
