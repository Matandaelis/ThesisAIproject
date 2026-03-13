import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authorQuery = searchParams.get('id');
  
  if (!authorQuery) {
    return NextResponse.json({ error: 'Author query parameter "id" is required' }, { status: 400 });
  }

  try {
    // 1. First, find the author ID using the query (which could be a name or an OpenAlex ID)
    let authorId = authorQuery;
    
    // If it doesn't look like an OpenAlex ID (which starts with 'A' followed by numbers)
    if (!/^A\d+$/i.test(authorQuery)) {
      const authorSearchUrl = `https://api.openalex.org/authors?search=${encodeURIComponent(authorQuery)}&mailto=matandaelis@gmail.com`;
      const authorRes = await fetch(authorSearchUrl);
      const authorData = await authorRes.json();
      
      if (authorData.results && authorData.results.length > 0) {
        // Use the first matching author's ID
        // The ID comes back as a full URL like https://openalex.org/A5023888391
        const fullId = authorData.results[0].id;
        authorId = fullId.split('/').pop() || '';
      } else {
        return NextResponse.json({ error: 'Author not found in OpenAlex database' }, { status: 404 });
      }
    }

    // 2. Fetch works by this author
    const worksUrl = `https://api.openalex.org/works?filter=authorships.author.id:${authorId}&sort=publication_year:desc&per_page=20&mailto=matandaelis@gmail.com`;
    const worksRes = await fetch(worksUrl);
    const worksData = await worksRes.json();
    
    if (!worksRes.ok) {
      throw new Error(worksData.message || 'Failed to fetch works from OpenAlex');
    }

    // Map to the format expected by the frontend
    const articles = (worksData.results || []).map((work: any) => {
      const authors = work.authorships
        ?.slice(0, 3)
        ?.map((a: any) => a.author?.display_name)
        ?.filter(Boolean)
        ?.join(', ') || 'Unknown Author';
        
      const etAl = work.authorships?.length > 3 ? ' et al.' : '';
      
      return {
        title: work.title || 'Untitled',
        link: work.primary_location?.landing_page_url || work.id,
        authors: `${authors}${etAl}`,
        year: work.publication_year?.toString() || '',
        citation_id: work.id
      };
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('OpenAlex API error:', error);
    return NextResponse.json({ error: 'Failed to fetch author profile from scholarly database' }, { status: 500 });
  }
}
