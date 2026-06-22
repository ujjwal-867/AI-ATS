import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Absolute path to uploads folder
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads"
    );

    // Ensure uploads folder exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(
      uploadDir,
      file.name
    );

    console.log("Saving file to:", filePath);

    await writeFile(filePath, buffer);

    console.log("Saved successfully");

    return Response.json({
      success: true,
      filename: file.name,
      path: `/uploads/${file.name}`,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return Response.json(
      {
        success: false,
        message: "Upload failed",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}