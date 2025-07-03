'use client'
export default function Button(haveUser : boolean) {
    return (
        <button onClick={() => {console.log(haveUser)}} > click</button>
    )
}