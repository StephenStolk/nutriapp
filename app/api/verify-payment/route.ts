import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
    const { data: {user}} = await supabase.auth.getUser();

    if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

   const body = await req.json();
   const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;


    const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(razorpay_payment_id + "|" + razorpay_subscription_id)
    .digest("hex");

    if (generatedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

   const validTill = new Date();
  validTill.setMonth(validTill.getMonth() + 1); 

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      razorpay_payment_id,
       razorpay_subscription_id,
      is_active: true,
      valid_till: validTill.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

    if (error) {
    console.error("Supabase update error:", error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });   
    }
}