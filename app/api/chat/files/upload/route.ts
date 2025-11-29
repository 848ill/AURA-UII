import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { insertChatFile } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sessionId = formData.get("sessionId") as string
    const messageId = formData.get("messageId") as string | null
    const userId = formData.get("userId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Generate unique file path
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split(".").pop() || "bin"
    const fileName = `${timestamp}-${randomStr}.${fileExt}`
    const storagePath = `chat-files/${sessionId}/${fileName}`

    // Upload to Supabase Storage
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized" },
        { status: 500 }
      )
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError)
      
      // Provide helpful error message
      const errorMessage = uploadError.message || String(uploadError)
      if (errorMessage.includes("Bucket not found") || errorMessage.includes("404") || errorMessage.includes("not found")) {
        return NextResponse.json(
          { 
            error: "Storage bucket 'chat-files' tidak ditemukan. Silakan buat bucket di Supabase Dashboard → Storage.",
            details: "Bucket belum dibuat. Lihat dokumentasi FILE_UPLOAD_SETUP.md untuk panduan setup."
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "Failed to upload file to storage",
          details: uploadError.message || "Unknown storage error"
        },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("chat-files")
      .getPublicUrl(storagePath)

    // Save file metadata to database (optional - file sudah terupload ke storage)
    const chatFile = await insertChatFile({
      sessionId,
      messageId: messageId || null,
      userId: userId || null,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      storagePath,
      storageUrl: urlData.publicUrl,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    // Jika insert ke database gagal, tetap return success karena file sudah di storage
    // User bisa membuat tabel nanti untuk fitur recall
    if (!chatFile) {
      console.warn("⚠️ File uploaded to storage but metadata not saved. Create 'chat_files' table for full functionality.")
      // Return file info meskipun tidak tersimpan di database
      return NextResponse.json(
        {
          success: true,
          file: {
            id: `temp-${Date.now()}`,
            session_id: sessionId,
            message_id: messageId || null,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: storagePath,
            storage_url: urlData.publicUrl,
            metadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
            },
            created_at: new Date().toISOString(),
          },
          warning: "File uploaded but metadata not saved. Create 'chat_files' table for full functionality.",
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        file: chatFile,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("File upload error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "File upload failed", details: errorMessage },
      { status: 500 }
    )
  }
}

