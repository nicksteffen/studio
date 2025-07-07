import { getImageOptionsForList } from "@/app/my-list/imageConfigActions";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ConfigPageClient } from "./ConfigPageClient";
import { ListItem , ImageOptions} from "@/lib/types";
import { DismissibleWarningHeader } from "@/components/DismissibleWarningHeader";



export default async function ImageConfigePage({params} : {params: {listId : string}}) {
    const { listId } = await params;
    const supabase = await createClient();
    const {data : {user} } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const {data: listData, error: listError} = await supabase
    .from('lists')
    .select('id, title')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single()

    if (listError && listError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching list:', listError);
      // In a real app, you might want to show an error page
    }

    if (!listData) {
        notFound()
    }

    let listTitle = listData?.title;
    let items: ListItem[] = [];
    if (listId) {
      const { data: itemsData, error: itemsError } = await supabase
          .from('list_items')
          .select('*')
          .eq('list_id', listId)
          .order('position', { ascending: true });

      if (itemsError) {
          console.error('Error fetching items:', itemsError);
          // Handle error
      } else {
          items = itemsData || [];
      }
    }


    const userList = {
        id: listId,
        title: listTitle,
        items: items
    }


    // const defaultOptions: ImageOptions = {
    //     backgroundColor: '#fefae0',
    //     textColor: '#1f2937',
    //     font: 'font-sans',
    //     titleColor: '#d4a373',
    //     itemNumberColor: '#9ca3af', // gray-400
    //     completedItemTextColor: '#6b7280', // gray-500
    //     completedItemIconColor: '#16a34a', // green-600
    // };

    const fetchedOptions = await getImageOptionsForList(listId);

    // const userOptions = fetchedOptions || defaultOptions;
    const userOptions = fetchedOptions;





    return (
        <>
        <div className="flex flex-col h-screen"> {/* Added a flex container for layout */}
            <DismissibleWarningHeader
                message="Heads Up!"
                subMessage="Remember to Save Changes before leaving this page to ensure your customizations are kept."
                autoDismissSeconds={15} 
            />
            <ConfigPageClient list={userList} initialOptions={userOptions}/>
        </div>
        </>
    )
}