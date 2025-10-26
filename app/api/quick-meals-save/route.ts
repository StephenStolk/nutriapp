import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
    const { recipes_arr } = body;

    if(!recipes_arr || !Array.isArray(recipes_arr)) {
        console.log("[error] Unauthorized user. [from quick-meals-save]");
        return NextResponse.json({
            error: "Not authenticated"
        }, { status: 401})
    }

    const supabase = createClient();

    const { data: {user}, error: userError} = await supabase.auth.getUser();

    if (!user || userError) {
      console.error("[error] Unauthorized user. [from quick-meals-save]");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const formattedRecipes = recipes_arr.map((r: any) => ({
        user_id: user.id,
        recipe_title: r.name ?? "Untitled Recipe",
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [String(r.ingredients || "")],
        instructions: Array.isArray(r.instructions) ? r.instructions : [String(r.instructions || "")],
    }));

    const { data, error} = await supabase.from("saved_recipes").insert(formattedRecipes).select();

    if(error) {
        console.error("[error] Failed to insert the recipes: ", error);
        return NextResponse.json(
        { error: "Failed to save recipes", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Recipes saved successfully",
      data,
    });

    } catch (error) {
        console.error("[error] Internal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    }
    
}