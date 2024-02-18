const express = require('express');
const app = express();

app.get('/getServer', (req, res) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ code: 200, server: serverUrl });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
