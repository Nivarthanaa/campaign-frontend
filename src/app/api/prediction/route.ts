export async function POST(req: Request) {
    const data = await req.json();
  
    return Response.json({
      message: "API working ✅",
      received: data
    });
  }