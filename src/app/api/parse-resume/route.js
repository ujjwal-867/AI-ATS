import mammoth from "mammoth";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");

    if (!file) {
      return Response.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    console.log("File name:", file.name);
    console.log("File type:", file.type);
    console.log("File size:", file.size);

    const arrayBuffer = await file.arrayBuffer();

    console.log("ArrayBuffer size:", arrayBuffer.byteLength);

    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer size:", buffer.length);

    const result = await mammoth.extractRawText({
      buffer: buffer,
    });

    return Response.json({
      success: true,
      text: result.value,
    });
  } catch (error) {
    console.error("PARSE ERROR:");
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}