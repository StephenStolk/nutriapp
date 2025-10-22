
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NutritionApp from "@/components/nutrition-app";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function Nutrition({ params} : PageProps) {
    const supabase = createClient();
    const { data: {user}, error
} = await supabase.auth.getUser();

if(!user) {
    redirect('/signin');
}

if (user.id !== params.id) {
    redirect(`/${user.id}/nutrition`);
  }

    return(<>
    <NutritionApp />
    </>)
}