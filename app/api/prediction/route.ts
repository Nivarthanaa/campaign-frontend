export async function POST(req: Request) {
    try {
      const data = await req.json();
  
      return Response.json({
        message: "Prediction success",
        received: data
      });
    } catch (error) {
      return Response.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  }