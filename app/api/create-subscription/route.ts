import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = createClient();

    const { data: {user}, error: userError} = await supabase.auth.getUser();

    if(userError || !user) {
        return NextResponse.json({
            error: "[error] Unauthorized user"
        }, { status: 401});
    };

    const body = await req.json();
    const { plan_name } = body;

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.KEY_SECRET!,
        });

        const customer = await razorpay.customers.create({
            name: user.email ?? "User",
            email: user.email,
        });

        const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID!,
      customer_notify: 1,
      total_count: 12,
    });

    const {data, error} = await supabase.from("user_subscriptions").upsert({
        user_id: user.id,
        plan_name,
        razorpay_customer_id: customer.id,
        razorpay_subscription_id: subscription.id,
        is_active: false,
        valid_till: null,
        remaining_uses: null,
    }, {
         onConflict: "user_id"
    });

    if (error) throw error;

    return NextResponse.json({
      subscription_id: subscription.id,
      razorpay_key: process.env.RAZORPAY_KEY_ID,
    });

    } catch (err: any) {
    console.error("Razorpay error:", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}