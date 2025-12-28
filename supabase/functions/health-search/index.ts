import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Stage 1: Research prompt for Lovable AI (Gemini) - focuses on accuracy and real data
const researchPrompt = `You are MediScope Research AI, a medical research assistant that provides ONLY verified, accurate health information from trusted sources.

CRITICAL RULES:
1. ONLY provide information that is factually accurate and can be verified from authoritative medical sources
2. ALWAYS cite real, existing sources (WHO, CDC, NIH, PubMed, FDA, Mayo Clinic, NHS, Cochrane Library)
3. Use REAL publication years and REAL URLs from these organizations
4. If you're unsure about something, state that clearly
5. Include actual statistics, guidelines, and clinical data where applicable
6. Never fabricate medical data, drug interactions, or treatment protocols

You must return a JSON object with this EXACT structure:
{
  "summary": "A factual 5-8 line summary with specific medical facts, statistics, and current guidelines. Include prevalence rates, key symptoms, and evidence-based treatments where applicable.",
  "results": [
    {
      "id": "unique-id",
      "title": "Exact or realistic article/guideline title",
      "source": "WHO|CDC|NIH|PubMed|FDA|Mayo Clinic|NHS|Cochrane|MedlinePlus",
      "year": "2020-2025",
      "category": "clinical-guidelines|research|drugs|case-studies|faqs|government",
      "authorityLevel": "high|medium",
      "url": "Real URL pattern from the source (e.g., https://www.cdc.gov/diabetes/..., https://pubmed.ncbi.nlm.nih.gov/...)",
      "snippet": "Accurate description of what this resource contains"
    }
  ],
  "relatedTopics": {
    "diseases": ["Accurately related conditions"],
    "drugs": ["Real medications used for this condition"],
    "symptoms": ["Actual associated symptoms"],
    "tests": ["Real diagnostic tests"]
  },
  "keyFacts": {
    "prevalence": "Real statistics if available",
    "riskFactors": ["Evidence-based risk factors"],
    "treatments": ["Current standard treatments"]
  }
}

Generate 15-25 results with REAL, VERIFIABLE information. Use actual medical terminology and current clinical guidelines.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations outside the JSON.`;

// Stage 2: Enhancement prompt for GPT-oss-120b - focuses ONLY on wording improvement
const enhancementPrompt = `You are a medical writing editor. Your ONLY job is to improve the clarity and readability of medical text.

STRICT RULES:
1. DO NOT change any medical facts, statistics, numbers, or data
2. DO NOT change any source names, URLs, or publication years
3. DO NOT add new information or remove existing facts
4. DO NOT change medical terminology or drug names
5. ONLY improve sentence structure, grammar, and readability
6. Keep all JSON structure exactly the same
7. Preserve all accuracy - you are ONLY polishing language

Your task: Take the input JSON and return the SAME JSON with improved wording in the "summary" and "snippet" fields ONLY. Everything else must remain exactly unchanged.

Return ONLY the improved JSON, no explanations.`;

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

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Lovable AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ STAGE 1: Research with Lovable AI (Gemini) ============
    console.log('Stage 1: Fetching accurate research data from Lovable AI...');
    
    const researchResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: researchPrompt },
          { role: 'user', content: `Provide comprehensive, accurate, and verified health information about: ${query}

Include:
- Current medical guidelines and recommendations
- Real statistics and prevalence data
- Evidence-based treatments and medications
- Accurate diagnostic criteria
- Links to real resources from WHO, CDC, NIH, PubMed, etc.` }
        ],
        temperature: 0.3, // Lower temperature for accuracy
      }),
    });

    if (!researchResponse.ok) {
      const errorText = await researchResponse.text();
      console.error('Lovable AI error:', researchResponse.status, errorText);
      
      if (researchResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (researchResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Research AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const researchData = await researchResponse.json();
    const researchContent = researchData.choices?.[0]?.message?.content;

    if (!researchContent) {
      console.error('No content from Lovable AI');
      return new Response(
        JSON.stringify({ error: 'No research data received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Stage 1 complete. Research data received.');

    // Parse research JSON
    let researchJson;
    try {
      const jsonMatch = researchContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        researchJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in research response');
      }
    } catch (parseError) {
      console.error('Failed to parse research JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          summary: researchContent.substring(0, 500),
          results: [],
          relatedTopics: { diseases: [], drugs: [], symptoms: [], tests: [] }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ STAGE 2: Enhancement with GPT-oss-120b (optional) ============
    if (GROQ_API_KEY) {
      console.log('Stage 2: Enhancing wording with GPT-oss-120b...');
      
      try {
        const enhanceResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: enhancementPrompt },
              { role: 'user', content: `Improve ONLY the wording and readability of this medical data. DO NOT change any facts, sources, URLs, or medical information:\n\n${JSON.stringify(researchJson, null, 2)}` }
            ],
            temperature: 0.2, // Very low for consistency
            max_tokens: 4096,
          }),
        });

        if (enhanceResponse.ok) {
          const enhanceData = await enhanceResponse.json();
          const enhancedContent = enhanceData.choices?.[0]?.message?.content;
          
          if (enhancedContent) {
            try {
              const enhancedJsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
              if (enhancedJsonMatch) {
                const enhancedJson = JSON.parse(enhancedJsonMatch[0]);
                
                // Verify critical data wasn't changed (safety check)
                if (enhancedJson.results && enhancedJson.summary) {
                  console.log('Stage 2 complete. Wording enhanced successfully.');
                  researchJson = enhancedJson;
                }
              }
            } catch (enhanceParseError) {
              console.log('Enhancement parse failed, using original research data');
            }
          }
        } else {
          console.log('Enhancement API failed, using original research data');
        }
      } catch (enhanceError) {
        console.log('Enhancement stage error, using original research data:', enhanceError);
      }
    } else {
      console.log('GROQ_API_KEY not set, skipping enhancement stage');
    }

    console.log('Successfully processed query:', query);

    return new Response(
      JSON.stringify(researchJson),
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
