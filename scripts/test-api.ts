import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: 'urHf4BtmwVpVvNornL5HvH14WLxNS9wthWIWGj1p',
});

async function testAPI() {
  try {
    console.log('Testing Cohere API connection...');

    // Use the current command-a-03-2025 model
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: 'Say "API is working!" and nothing else.',
    });

    console.log('Success! Response:', response.text);

    // Test embeddings
    console.log('\nTesting embeddings...');
    const embedResponse = await cohere.embed({
      texts: ['This is a test'],
      model: 'embed-english-v3.0',
      inputType: 'search_document',
    });

    console.log('Embedding success! Dimension:', embedResponse.embeddings[0].length);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();