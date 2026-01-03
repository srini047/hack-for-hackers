import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "PASTE_MONGODB_CONNECTION_STRING";
const client = new MongoClient(uri);
const dbName = "access_submit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, disabilityType, feedbackText, audioBase64 } = body;

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("feedback");

    const doc = {
      name: name || null,
      email: email || null,
      disabilityType: disabilityType || null,
      feedbackText: feedbackText || null,
      audioBase64: audioBase64 || null,
      createdAt: new Date(),
    };

    await collection.insertOne(doc);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
