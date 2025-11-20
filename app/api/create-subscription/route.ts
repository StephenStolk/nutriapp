// import { NextRequest, NextResponse } from "next/server";
// import Razorpay from "razorpay";
// import { createClient } from "@/lib/supabase/server";

// export async function POST(req: NextRequest) {
//     const supabase = createClient();

//     const { data: {user}, error: userError} = await supabase.auth.getUser();

//     if(userError || !user) {
//         return NextResponse.json({
//             error: "[error] Unauthorized user"
//         }, { status: 401});
//     };

//     // const body = await req.json();
//     // const { plan_name } = body;

//     try {
//         const body = await req.json();
//     const { plan_name } = body;

//     if (!plan_name) {
//       return NextResponse.json({ error: "Plan name required" }, { status: 400 });
//     }

//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID!,
//       key_secret: process.env.RAZORPAY_KEY_SECRET!,
//     });

//      const customer = await razorpay.customers.create({
//       name: user.email ?? "User",
//       email: user.email ?? "user@example.com",
//     });

//     const subscription = await razorpay.subscriptions.create({
//       plan_id: process.env.RAZORPAY_PLAN_ID!,
//       customer_notify: 1,
//       total_count: 12,
//     });

//      const { error } = await supabase.from("user_subscriptions").upsert(
//       {
//         user_id: user.id,
//         plan_name,
//         razorpay_customer_id: customer.id,
//         razorpay_subscription_id: subscription.id,
//         is_active: false,
//         valid_till: null,
//       },
//       { onConflict: "user_id" }
//     );
    
//     if (error) {
//       console.error("Supabase error from backend:", error);
//       throw new Error("Failed to save subscription data from backend");
//     }

//     return NextResponse.json({
//       success: true,
//       subscription_id: subscription.id,
//       razorpay_key: process.env.RAZORPAY_KEY_ID,
//     });

//     } catch (err: any) {
//     console.error("Razorpay error:", err);
//     return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create an order for ₹199
    const order = await razorpay.orders.create({
      amount: 89 * 100, // amount in paise
      currency: "INR",
      receipt: `order_rcptid_${user.id.slice(0,10)}`,
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      razorpay_key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
