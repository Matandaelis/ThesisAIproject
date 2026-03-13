import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    // Use OpenAlex API which is free and optimized for scholarly search
    // We add a mailto parameter to enter the polite pool (optional but recommended)
    const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=10&mailto=matandaelis@gmail.com`;
    
    const response = await fetch(openAlexUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch from OpenAlex');
    }

    // Map OpenAlex response to the format expected by the frontend (previously SerpApi format)
    const organic_results = (data.results || []).map((work: any) => {
      // Extract authors
      const authors = work.authorships
        ?.slice(0, 3)
        ?.map((a: any) => a.author?.display_name)
        ?.filter(Boolean)
        ?.join(', ') || 'Unknown Author';
        
      const etAl = work.authorships?.length > 3 ? ' et al.' : '';
      const authorString = `${authors}${etAl}`;
      
      // Extract journal/source
      const source = work.primary_location?.source?.display_name || 'Unknown Source';
      const year = work.publication_year || '';
      
      // Construct abstract from inverted index if available
      let snippet = '';
      if (work.abstract_inverted_index) {
        const index = work.abstract_inverted_index;
        const words = Object.keys(index);
        const abstractArray: string[] = [];
        
        words.forEach(word => {
          index[word].forEach((pos: number) => {
            abstractArray[pos] = word;
          });
        });
        
        snippet = abstractArray.join(' ');
        // Truncate snippet if it's too long
        if (snippet.length > 300) {
          snippet = snippet.substring(0, 300) + '...';
        }
      }

      return {
        title: work.title || 'Untitled',
        link: work.primary_location?.landing_page_url || work.id,
        snippet: snippet || work.type || 'No abstract available',
        publication_info: {
          summary: `${authorString} - ${source}, ${year}`
        },
        inline_links: {
          cited_by: {
            total: work.cited_by_count || 0
          }
        }
      };
    });

    return NextResponse.json({ organic_results });
  } catch (error) {
    console.error('OpenAlex API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from scholarly database' }, { status: 500 });
  }
}
