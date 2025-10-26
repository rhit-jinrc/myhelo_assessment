require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the project root
app.use(express.static(__dirname));

app.use(express.json());

app.post('/api/openai', async (req, res) => {
	try {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			req.body,
			{
				headers: {
					'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);
		res.json(response.data);
	} catch (error) {
		res.status(error.response?.status || 500).json({
			error: error.message,
			details: error.response?.data || null,
		});
	}
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
