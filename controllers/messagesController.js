// messagesController.js

export const getMessages = async (req, res) => {
    // Only admin can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  
    // Fetch messages from database
    const messages = await Message.find();
    res.json(messages);
  };
  