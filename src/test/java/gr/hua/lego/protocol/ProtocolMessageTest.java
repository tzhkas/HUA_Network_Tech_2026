
package gr.hua.lego.protocol;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ProtocolMessageTest {

    @Test
    void shouldCreateValidMessage() {

        ProtocolMessage message = new ProtocolMessage(
                "LEGO-DP",
                "1.0",
                MessageType.WELCOME,
                "msg-001",
                "session-001",
                "SERVER",
                0
        );

        assertEquals("LEGO-DP", message.protocol());
        assertEquals("1.0", message.version());
        assertEquals(MessageType.WELCOME, message.type());
        assertEquals("msg-001", message.messageId());
        assertEquals("session-001", message.sessionId());
        assertEquals("SERVER", message.senderId());
        assertEquals(0, message.payloadLength());
    }

    @Test
    void shouldRejectNegativePayloadLength() {

        assertThrows(
                IllegalArgumentException.class,
                () -> new ProtocolMessage(
                        "LEGO-DP",
                        "1.0",
                        MessageType.WELCOME,
                        "msg-001",
                        null,
                        "SERVER",
                        -1
                )
        );
    }

    @Test
    void shouldAllowNullSessionId() {

        ProtocolMessage message = new ProtocolMessage(
                "LEGO-DP",
                "1.0",
                MessageType.CONNECT,
                "msg-002",
                null,
                "CLIENT_A",
                0
        );

        assertNull(message.sessionId());
    }
}
