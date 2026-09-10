import 'package:flutter/material.dart';
import '../../models/message.dart';
import '../../theme/app_theme.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final List<ChatThread> _threads = [
    ChatThread(
      id: 't1',
      partnerName: 'Karthik Raja',
      partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      lastMessage: 'Sure, I can include the extra 4GB RAM stick for ₹500 more.',
      lastMessageTime: DateTime.now().subtract(const Duration(minutes: 15)),
      unreadCount: 1,
      productTitle: 'Dell Inspiron 15 (Core i5 7th Gen)',
      productPrice: 8500,
    ),
    ChatThread(
      id: 't2',
      partnerName: 'Arun Prakash (PSG Tech)',
      partnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      lastMessage: 'Is the Arduino Uno R3 still available for pickup at RS Puram?',
      lastMessageTime: DateTime.now().subtract(const Duration(hours: 2)),
      unreadCount: 0,
      productTitle: 'Arduino Uno R3 Microcontroller',
      productPrice: 450,
    ),
    ChatThread(
      id: 't3',
      partnerName: 'EcoSafe Recyclers TN',
      partnerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80',
      lastMessage: 'Your pickup request #RC-8812 has been scheduled for tomorrow 11:00 AM.',
      lastMessageTime: DateTime.now().subtract(const Duration(days: 1)),
      unreadCount: 0,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages & Negotiations 💬', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _threads.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final thread = _threads[index];
          return ListTile(
            contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            leading: Stack(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppTheme.primary.withAlpha(40),
                  child: Text(
                    thread.partnerName[0],
                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ),
                if (thread.unreadCount > 0)
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: const BoxDecoration(
                        color: AppTheme.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            title: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(thread.partnerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                Text('15m ago', style: theme.textTheme.bodySmall?.copyWith(fontSize: 11)),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (thread.productTitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    '📦 ${thread.productTitle} (₹${thread.productPrice?.toStringAsFixed(0)})',
                    style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  thread.lastMessage,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: thread.unreadCount > 0 ? theme.colorScheme.onSurface : theme.colorScheme.onSurfaceVariant,
                    fontWeight: thread.unreadCount > 0 ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => _ChatDetailScreen(thread: thread)),
              );
            },
          );
        },
      ),
    );
  }
}

class _ChatDetailScreen extends StatefulWidget {
  final ChatThread thread;

  const _ChatDetailScreen({required this.thread});

  @override
  State<_ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<_ChatDetailScreen> {
  final _msgController = TextEditingController();
  final List<ChatMessage> _messages = [
    ChatMessage(
      id: 'm1',
      senderId: 'partner',
      senderName: 'Karthik Raja',
      text: 'Hi Mathavan! I saw your inquiry about the Dell Inspiron laptop.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
      isMe: false,
    ),
    ChatMessage(
      id: 'm2',
      senderId: 'me',
      senderName: 'Mathavan',
      text: 'Yes! Is the 8GB DDR4 RAM stick still in healthy condition for harvesting?',
      timestamp: DateTime.now().subtract(const Duration(minutes: 25)),
      isMe: true,
    ),
    ChatMessage(
      id: 'm3',
      senderId: 'partner',
      senderName: 'Karthik Raja',
      text: 'Yes, memtest passed with 0 errors. I can also bundle the 65W original charger for an offer of ₹7,500 total.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
      isMe: false,
      offerAmount: 7500,
      offerStatus: 'pending',
    ),
  ];

  void _sendMessage() {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(
        ChatMessage(
          id: 'm_${DateTime.now().millisecondsSinceEpoch}',
          senderId: 'me',
          senderName: 'Mathavan',
          text: text,
          timestamp: DateTime.now(),
          isMe: true,
        ),
      );
      _msgController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.thread.partnerName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const Text('🟢 Online • Typically replies in 5 min', style: TextStyle(fontSize: 11, color: AppTheme.primary)),
          ],
        ),
      ),
      body: Column(
        children: [
          // Product Snippet Header
          if (widget.thread.productTitle != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: isDark ? AppTheme.darkSurface2 : AppTheme.lightSurface2,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text('📦 ${widget.thread.productTitle}', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                  Text('₹${widget.thread.productPrice?.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                ],
              ),
            ),

          // Message Bubbles
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return Align(
                  alignment: msg.isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: msg.isMe
                          ? AppTheme.primary
                          : (isDark ? AppTheme.darkSurface : AppTheme.lightSurface),
                      borderRadius: BorderRadius.circular(16),
                      border: msg.isMe ? null : Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg.text,
                          style: TextStyle(color: msg.isMe ? Colors.white : theme.colorScheme.onSurface, fontSize: 14),
                        ),
                        if (msg.offerAmount != null) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.black.withAlpha(30),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Counter Offer Received', style: TextStyle(color: Colors.white, fontSize: 10)),
                                    Text('₹${msg.offerAmount?.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.accentAmber, fontWeight: FontWeight.bold, fontSize: 16)),
                                  ],
                                ),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.primary,
                                    foregroundColor: Colors.white,
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Offer accepted! Item reserved in checkout.')),
                                    );
                                  },
                                  child: const Text('Accept', style: TextStyle(fontSize: 12)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Input Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.attach_money, color: AppTheme.accentAmber),
                    tooltip: 'Make Offer',
                    onPressed: () {
                      _msgController.text = 'Would you accept ₹7,000 for this?';
                    },
                  ),
                  Expanded(
                    child: TextField(
                      controller: _msgController,
                      decoration: const InputDecoration(
                        hintText: 'Type your message or ask about compatibility...',
                        border: InputBorder.none,
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send, color: AppTheme.primary),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
