import { createClient } from "@/lib/supabase/server";
import Button from './button'



export default async function TestPage() {
    // const supabase = await createClient();
    // const { data: serverUser } = await supabase.auth.getUser();
    // console.log("test page, check user")
    // console.log(`found user : ${!!serverUser}`)
    // console.log(serverUser)


    const supabase = await createClient();
    const {data: serverUser } = await supabase.auth.getUser();
    // console.log("index page, check user")
    console.log("test page, check user")
    console.log(`found user : ${!!serverUser}`)
    console.log(`Full user: `);
    console.log(serverUser)
    const id = serverUser?.user?.id  ? serverUser.user.id : 1000
    console.log(id)



    const {data, error } = await supabase.auth.getUser();
    console.log(data)
    


    const haveUser = () => {
        console.log("test page, check user")
        console.log(`found user : ${!!serverUser}`)
    }





    return (
        <>
        <p> test page </p>
        </>

    )
}