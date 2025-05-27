import { type NextRequest, NextResponse } from "next/server"
import { uploadFile, generateFileKey } from "@/lib/storage/s3"
import { createRateLimitMiddleware } from "@/lib/rate-limit"
import { db } from "@/lib/db"

const rateLimitMiddleware = createRateLimitMiddleware(10, 3600) // 10 uploads per hour

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request)
    if (rateLimitResponse) return rateLimitResponse

    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const module = (formData.get("module") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    // Generate file key and upload to S3
    const fileKey = generateFileKey(userId, module, file.name)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const storageUrl = await uploadFile(fileBuffer, fileKey, file.type)

    // Save file metadata to database
    const mediaFile = await db.mediaFile.create({
      data: {
        userId,
        filename: fileKey,
        originalFilename: file.name,
        fileType: file.type,
        fileSize: BigInt(file.size),
        storageUrl,
        cdnUrl: storageUrl,
        module,
        isPublic: false,
      },
    })

    return NextResponse.json({
      id: mediaFile.id,
      url: storageUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
