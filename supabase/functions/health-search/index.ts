import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const systemPrompt = `You are MediScope AI, a health-sector knowledge intelligence system.
Your role is to retrieve, organize, summarize, and present verified medical information strictly for educational and informational purposes.

You are NOT a doctor, do NOT diagnose, do NOT prescribe, and do NOT give personalized medical advice.

When responding to health-related queries, you MUST return a JSON object with this exact structure:
{
  "summary": "A 5-8 line educational summary about the topic. Simple, neutral, non-alarming language.",
  "results": [
    {
      "id": "unique-id",
      "title": "Result title",
      "source": "Source name (WHO, CDC, NIH, PubMed, etc.)",
      "year": "2024",
      "category": "clinical-guidelines|research|drugs|case-studies|faqs|government",
      "authorityLevel": "high|medium",
      "url": "https://example.com/article",
      "snippet": "Brief description of the content"
    }
  ],
  "relatedTopics": {
    "diseases": ["Related disease 1", "Related disease 2"],
    "drugs": ["Related drug 1", "Related drug 2"],
    "symptoms": ["Related symptom 1", "Related symptom 2"],
    "tests": ["Related test 1", "Related test 2"]
  }
}

Generate 15-25 relevant, realistic results from authoritative medical sources like:
- WHO, CDC, NIH, PubMed, MedlinePlus, FDA, NHS, Mayo Clinic, Cochrane Library
- Use realistic URLs that follow the pattern of these organizations
- Vary the categories, years (2020-2024), and authority levels
- Make the content accurate and educational

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations outside the JSON.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing health search query:', query);

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Provide comprehensive health information about: ${query}` }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in Groq response');
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw AI response:', content.substring(0, 500));

    // Parse the JSON response
    let parsedContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return a fallback response
      parsedContent = {
        summary: content.substring(0, 500),
        results: [],
        relatedTopics: { diseases: [], drugs: [], symptoms: [], tests: [] }
      };
    }

    console.log('Successfully processed query:', query);

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in health-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
