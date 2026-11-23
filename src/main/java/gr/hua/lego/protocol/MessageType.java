
package gr.hua.lego.protocol;

public enum MessageType {

    DISCOVER,
    SERVER_FOUND,

    CONNECT,
    WELCOME,

    ASSIGN,

    IMAGE_DATA,
    IMAGE_ACK,

    PROGRESS,

    DISCONNECT
}
