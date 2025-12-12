const express = require('express');
const app = express();

// CHỈ CÓ express.json()
app.use(express.json());

app.post('/test-login', (req, res) => {
  console.log('=== TEST LOGIN ===');
  console.log('req.body:', req.body);
  console.log('req.headers:', req.headers);
  
  res.json({
    success: true,
    receivedBody: req.body
  });
});

app.listen(3001, () => {
  console.log('✅ Test server running on http://localhost:3001');
  console.log('Test with: curl -X POST http://localhost:3001/test-login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\'');
});