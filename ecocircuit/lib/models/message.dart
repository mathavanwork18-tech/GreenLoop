class ChatMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String text;
  final DateTime timestamp;
  final bool isMe;
  final String? attachedProductId;
  final double? offerAmount;
  final String? offerStatus; // 'pending', 'accepted', 'declined'

  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.text,
    required this.timestamp,
    required this.isMe,
    this.attachedProductId,
    this.offerAmount,
    this.offerStatus,
  });
}

class ChatThread {
  final String id;
  final String partnerName;
  final String partnerAvatar;
  final String lastMessage;
  final DateTime lastMessageTime;
  final int unreadCount;
  final String? productTitle;
  final double? productPrice;
  final String? productImage;

  const ChatThread({
    required this.id,
    required this.partnerName,
    required this.partnerAvatar,
    required this.lastMessage,
    required this.lastMessageTime,
    this.unreadCount = 0,
    this.productTitle,
    this.productPrice,
    this.productImage,
  });
}
