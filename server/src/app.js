const path = require('path');
const aiRoutes = require('./routes/ai');

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use('/api/ai', aiRoutes); 